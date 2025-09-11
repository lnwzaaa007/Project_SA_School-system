import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Flex, message, Table, Typography, Upload, type UploadProps } from "antd";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

type SummaryItem = { billId: number; title: string; amount: number };
type SummaryResp = {
  items: SummaryItem[];
  total: number;
  paymentRef: string;
  qrUrl?: string; // optional - from backend
};

const RAW_API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const API_URL = String(RAW_API_URL).replace(/\/+$/, ""); // ตัด / ท้าย

const getToken = () => {
  const row = document.cookie.split("; ").find(r =>
    r.startsWith("0195f494-feaa-734a-92a6-05739101ede9=")
  );
  if (!row) return null;
  let v = decodeURIComponent(row.split("=")[1]);
  v = v.replace(/\\/g, "").replace(/"/g, "");
  return v || null;
};

const PaymentCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const billIdsStr = useMemo(
    () => new URLSearchParams(location.search).get("billIds") || "",
    [location.search]
  );

  const billIds = useMemo(
    () =>
      billIdsStr
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n)),
    [billIdsStr]
  );

  const studentId = localStorage.getItem("ID") || "1";

  const [summary, setSummary] = useState<SummaryResp | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);

  // กันยิงซ้ำ
  const fetchKey = useMemo(
    () => billIds.slice().sort((a, b) => a - b).join(","),
    [billIds]
  );
  const fetchedKeyRef = useRef<string>("");

  // ฟังก์ชันสำหรับสร้าง PromptPay QR Code
  const generatePromptPayQR = async (phoneNumber: string, amount: number): Promise<string> => {
    try {
      console.log("[QR] Generating QR for phone:", phoneNumber, "amount:", amount);
      
      // Method 1: Try using promptpay-qr library
      try {
        const { default: generatePayload } = await import("promptpay-qr");
        const { toDataURL } = await import("qrcode");
        
        const payload = generatePayload(phoneNumber, amount > 0 ? { amount } : undefined);
        console.log("[QR] Generated payload:", payload);
        
        const qrDataUrl = await toDataURL(payload, { 
          width: 300, 
          margin: 2,
          errorCorrectionLevel: 'M'
        });
        
        console.log("[QR] Successfully generated QR with library");
        return qrDataUrl;
        
      } catch (libError) {
        console.warn("[QR] Library method failed, trying manual method:", libError);
        
        // Method 2: Manual PromptPay QR generation
        return await generateManualPromptPayQR(phoneNumber, amount);
      }
      
    } catch (error) {
      console.error("[QR] All QR generation methods failed:", error);
      throw error;
    }
  };

  // Manual PromptPay QR generation fallback
  const generateManualPromptPayQR = async (phoneNumber: string, amount: number): Promise<string> => {
    try {
      const { toDataURL } = await import("qrcode");
      
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      // Format amount
      const formatAmount = (amt: number) => {
        if (amt <= 0) return "";
        const amtStr = amt.toFixed(2);
        const len = amtStr.length.toString().padStart(2, '0');
        return `54${len}${amtStr}`;
      };
      
      // Build PromptPay EMV payload manually
      let payload = "000201"; // Payload Format Indicator
      payload += "010212"; // Point of Initiation Method
      
      // Merchant Account Information (Tag 29)
      let tag29 = "0016A000000677010112"; // GUI
      tag29 += "01" + cleanPhone.length.toString().padStart(2, '0') + cleanPhone;
      payload += "29" + tag29.length.toString().padStart(2, '0') + tag29;
      
      payload += "5303764"; // Transaction Currency (THB = 764)
      
      if (amount > 0) {
        payload += formatAmount(amount);
      }
      
      payload += "5802TH"; // Country Code
      payload += "6304"; // CRC placeholder
      
      // Calculate CRC16 (simple implementation)
      const crc16 = calculateCRC16(payload.slice(0, -4));
      const finalPayload = payload.slice(0, -4) + crc16.toString(16).toUpperCase().padStart(4, '0');
      
      console.log("[QR] Manual payload:", finalPayload);
      
      const qrDataUrl = await toDataURL(finalPayload, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      
      console.log("[QR] Successfully generated QR manually");
      return qrDataUrl;
      
    } catch (error) {
      console.error("[QR] Manual generation failed:", error);
      throw error;
    }
  };

  // Simple CRC16 calculation for PromptPay
  const calculateCRC16 = (data: string): number => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc;
  };

  useEffect(() => {
    if (!fetchKey) return;
    if (fetchedKeyRef.current === fetchKey) return;
    fetchedKeyRef.current = fetchKey;

    const controller = new AbortController();

    (async () => {
      try {
        const token = getToken();
        const res = await axios.get<SummaryResp>(`${API_URL}/bills/summary`, {
          params: { billIds: fetchKey },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        setSummary(res.data);
        
        let finalQrUrl = "";

        // 1) ถ้า backend ส่ง qrUrl มา ใช้ของ backend
        if (res.data.qrUrl) {
          const base = API_URL + (API_URL.endsWith("/") ? "" : "/");
          const absolute = res.data.qrUrl.startsWith("http")
            ? res.data.qrUrl
            : new URL(res.data.qrUrl.replace(/^\/+/, ""), base).toString();

          finalQrUrl = `${absolute}${absolute.includes("?") ? "&" : "?"}v=${encodeURIComponent(res.data.paymentRef || Date.now().toString())}`;
          
          console.log("[QR] Using backend QR URL:", finalQrUrl);
        } 
        // 2) ถ้าไม่มี ให้สร้างเอง
        else {
          setIsGeneratingQR(true);
          try {
            const amount = Number(res.data.total || 0);
            finalQrUrl = await generatePromptPayQR("0942439557", amount);
            console.log("[QR] Generated local QR successfully");
          } catch (qrError) {
            console.error("[QR] Failed to generate QR:", qrError);
            message.error("ไม่สามารถสร้าง QR Code ได้");
          } finally {
            setIsGeneratingQR(false);
          }
        }

        setQrUrl(finalQrUrl);
        console.log("[QR] Final URL set:", finalQrUrl ? "Success" : "Failed");
        
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("[API] Error:", e);
          message.error(e?.response?.data?.error || "โหลดสรุปยอดไม่สำเร็จ");
        }
      }
    })();

    return () => controller.abort();
  }, [fetchKey]);

  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: ".jpg,.jpeg,.png,.pdf",
    beforeUpload: (f) => {
      setFile(f);
      return false; // ไม่อัปโหลดอัตโนมัติ
    },
    onRemove: () => setFile(null),
  };

  const onConfirm = async () => {
    if (!summary || !file) {
      message.warning("กรุณาแนบสลิปก่อนกดยืนยัน");
      return;
    }
    const form = new FormData();
    form.append("studentId", String(studentId));
    form.append("billIds", fetchKey);
    form.append("paymentRef", summary.paymentRef);
    form.append("slip", file);

    try {
      const token = getToken();
      await axios.post(`${API_URL}/payments/upload`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      message.success("ส่งสลิปแล้ว: รอตรวจสอบ");
      navigate("/student/payments");
    } catch (e: any) {
      message.error(e?.response?.data?.error || "อัปโหลดสลิปไม่สำเร็จ");
    }
  };

  const handleQRError = () => {
    console.error("[QR] Image failed to load:", qrUrl);
    message.error("ไม่สามารถโหลด QR Code ได้");
  };

  const handleQRLoad = () => {
    console.log("[QR] Image loaded successfully:", qrUrl);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        ชำระเงิน
      </Typography.Title>

      {summary && (
        <Flex gap={24} align="stretch" wrap="wrap">
          <Card style={{ flex: "1 1 360px", minWidth: 360, textAlign: "center" }}>
            {isGeneratingQR ? (
              <div
                style={{
                  width: 300,
                  height: 300,
                  margin: "0 auto",
                  background: "#f2f2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <span style={{ color: "#666" }}>กำลังสร้าง QR Code...</span>
              </div>
            ) : qrUrl ? (
              <>
                <img
                  key={qrUrl} // บังคับ re-render เวลา URL เปลี่ยน
                  src={qrUrl}
                  alt="PromptPay QR"
                  width={300}
                  height={300}
                  style={{ 
                    objectFit: "contain", 
                    border: "1px solid #eee", 
                    borderRadius: 8,
                    maxWidth: "100%"
                  }}
                  onLoad={handleQRLoad}
                  onError={handleQRError}
                />
                <Typography.Text style={{ display: "block", marginTop: 8, fontSize: 12, color: "#666" }}>
                  สแกน QR Code เพื่อชำระเงิน {new Intl.NumberFormat("th-TH").format(summary.total)} บาท
                </Typography.Text>
                {/* Debug info - ลบออกใน production */}
                <details style={{ marginTop: 8, textAlign: "left", fontSize: 10 }}>
                  <summary style={{ cursor: "pointer", color: "#999" }}>Debug Info</summary>
                  <div style={{ color: "#888", wordBreak: "break-all" }}>
                    Amount: {summary.total}<br/>
                    QR URL: {qrUrl.substring(0, 100)}...
                  </div>
                </details>
              </>
            ) : (
              <div
                style={{
                  width: 300,
                  height: 300,
                  margin: "0 auto",
                  background: "#f2f2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <span style={{ color: "#888" }}>ไม่สามารถสร้าง QR Code ได้</span>
              </div>
            )}

            <Typography.Paragraph style={{ marginTop: 20 }}>
              หลักฐานการชำระ
            </Typography.Paragraph>

            <Upload.Dragger {...uploadProps} style={{ padding: 12 }}>
              <p>ลากไฟล์มาวางหรือคลิกเพื่อเลือก (JPG/PNG/PDF)</p>
            </Upload.Dragger>
          </Card>

          <Card style={{ flex: "1 1 360px", minWidth: 360 }}>
            <Typography.Title level={2} style={{ textAlign: "center" }}>
              {new Intl.NumberFormat("th-TH").format(summary.total)} บาท
            </Typography.Title>

            <Table
              size="small"
              pagination={false}
              rowKey="billId"
              dataSource={summary.items}
              columns={[
                { title: "รายการ", dataIndex: "title" },
                {
                  title: "จำนวนเงิน",
                  dataIndex: "amount",
                  align: "right",
                  render: (v: number) => new Intl.NumberFormat("th-TH").format(v),
                },
              ]}
              style={{ marginTop: 16 }}
            />

            <Button
              type="primary"
              block
              size="large"
              style={{ marginTop: 16 }}
              onClick={onConfirm}
              disabled={!file}
            >
              ยืนยัน
            </Button>
          </Card>
        </Flex>
      )}
    </div>
  );
};

export default PaymentCheckoutPage;