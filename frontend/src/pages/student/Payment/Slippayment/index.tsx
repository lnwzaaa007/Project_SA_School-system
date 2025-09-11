import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Flex, message, Table, Typography, Upload, type UploadProps } from "antd";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

type SummaryItem = { billId: number; title: string; amount: number };
type SummaryResp = {
  items: SummaryItem[];
  total: number;
  paymentRef: string;
  qrImageUrl?: string; // e.g. "/uploads/qr/promptpay.jpg"
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

  // กันยิงซ้ำ
  const fetchKey = useMemo(
    () => billIds.slice().sort((a, b) => a - b).join(","),
    [billIds]
  );
  const fetchedKeyRef = useRef<string>("");

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

        // ประกอบ URL รูปให้เป็น absolute + ใส่ cache buster
        if (res.data.qrImageUrl) {
          const base = API_URL + (API_URL.endsWith("/") ? "" : "/");
          const absolute = res.data.qrImageUrl.startsWith("http")
            ? res.data.qrImageUrl
            : new URL(res.data.qrImageUrl.replace(/^\/+/, ""), base).toString();
          const bust = `${absolute}${absolute.includes("?") ? "&" : "?"}v=${encodeURIComponent(
            res.data.paymentRef || Date.now().toString()
          )}`;
          setQrUrl(bust);
          console.log("[QR] composed URL =", bust);

          // debug: HEAD เช็คว่ามีจริง
          fetch(absolute, { method: "HEAD" })
            .then(r => console.log("[QR] HEAD status", r.status, absolute))
            .catch(e => console.warn("[QR] HEAD error", e));
        } else {
          setQrUrl("");
        }
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
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

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        ชำระเงิน
      </Typography.Title>

      {summary && (
        <Flex gap={24} align="stretch" wrap="wrap">
          <Card style={{ flex: "1 1 360px", minWidth: 360, textAlign: "center" }}>
            {qrUrl ? (
              <>
                <img
                  key={qrUrl} // บังคับ re-render เวลา URL เปลี่ยน
                  src={qrUrl}
                  alt="PromptPay QR"
                  width={240}
                  height={240}
                  style={{ objectFit: "contain", border: "1px solid #eee", borderRadius: 8 }}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onLoad={() => console.log("[QR] loaded OK:", qrUrl)}
                  onError={(e) => {
                    console.error("[QR] image onError for:", qrUrl);
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    message.error("โหลดรูป QR ไม่สำเร็จ (ลองกดเปิดลิงก์ตรวจสอบด้านล่าง)");
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <a
                    href={qrUrl.replace(/\?.*$/, "")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    เปิดรูป QR ในแท็บใหม่
                  </a>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    URL: {qrUrl}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  width: 240,
                  height: 240,
                  margin: "0 auto",
                  background: "#f2f2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <span style={{ color: "#888" }}>ไม่มีรูป QR</span>
              </div>
            )}

            <Typography.Paragraph style={{ marginTop: 12 }}>
              หลักฐานการชำระ
            </Typography.Paragraph>

            <Upload.Dragger {...uploadProps} style={{ padding: 12 }}>
              <p>ลากไฟล์มาวางหรือคลิกเพื่อเลือก (JPG/PNG/PDF)</p>
            </Upload.Dragger>
          </Card>

          <Card style={{ flex: "1 1 360px", minWidth: 360 }}>
            <Typography.Title level={2} style={{ textAlign: "center" }}>
              {new Intl.NumberFormat("th-TH").format(summary.total)} THB
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
