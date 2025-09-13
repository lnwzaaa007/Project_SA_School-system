import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Checkbox, Flex, List, Tag, Typography, message, Table, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Get } from "../../../services/https";
const RAW_API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const API_URL = String(RAW_API_URL).replace(/\/+$/, "");
const abs = (p: string) => (p?.startsWith("http") ? p : `${API_URL}${p?.startsWith("/") ? "" : "/"}${p}`);

type BillUI = {
  billId: number;
  title: string;         // เช่น "ม.1 เทอม 1"
  amount: number;        // 1000
  uiStatus: "ยังไม่ชำระ" | "รอตรวจสอบ" | "ชำระแล้ว";
};

const currency = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n) + " บาท";

const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<BillUI[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  // payments result section
  type StudentPayment = { id: number; dateTime: string; amount: number; statusCode: "WAITING"|"COMPLETE"|"REJECTED"|string; slipUrl: string; bills: { billId:number; title:string; amount:number }[] };
  const [myPayments, setMyPayments] = useState<StudentPayment[]>([]);

  // TODO: ดึง studentId จาก auth/localStorage ตามระบบของคุณ
  const studentId = (localStorage.getItem("student_id") || 1);
//   useEffect(() => {
//   const run = async () => {
//     try {
//       setLoading(true);

//       const id = (localStorage.getItem("id") ?? "1");
//       // เรียก endpoint ที่มีจริงใน backend
//       const res = await Get(`/bills/student/${id}`); 
//       // กันพัง: รับได้ทั้ง array ตรง ๆ หรือรูปแบบ { data: [...] }
//       const rows: any =
//         Array.isArray(res) ? res :
//         Array.isArray(res?.data) ? res.data :
//         [];

//       setBills(rows as BillUI[]);
//       if (!Array.isArray(rows)) {
//         message.warning("รูปแบบข้อมูลบิลไม่ถูกต้อง (ไม่ใช่ array)");
//       }
//     } catch (e: any) {
//       message.error(e?.response?.data?.error || "โหลดรายการบิลไม่สำเร็จ");
//       setBills([]); // กันพัง
//     } finally {
//       setLoading(false);
//     }
//   };
//   run();
// }, []);
useEffect(() => {
  const run = async () => {
    try {
      setLoading(true);

      const studentId = localStorage.getItem("ID"); // ✅ ใช้ student PK
      if (!studentId) {
        message.warning("ไม่พบ studentId ในระบบ กรุณาเข้าเมนูอีกครั้ง");
        setBills([]);
        return;
      }

      const rows = await Get(`/bills/student/${studentId}`);  // ✅ ถูก endpoint แล้ว
      const data = Array.isArray(rows) ? rows :
                   Array.isArray(rows?.data) ? rows.data : [];
      setBills(data as BillUI[]);
    } catch (e: any) {
      message.error(e?.response?.data?.error || "โหลดรายการบิลไม่สำเร็จ");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };
  run();
}, []);
  // load my payment results (admin verification outcomes)
  useEffect(() => {
    (async () => {
      try {
        const sid = localStorage.getItem("id");
        if (!sid) return;
        const res = await Get(`/payments/student/${sid}`);
        const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setMyPayments(arr);
      } catch (e) {
        // ignore
      }
    })();
  }, []);
  // useEffect(() => {
  //   const run = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get<BillUI[]>(`/students/${studentId}/bills`);
  //       setBills(res.data);
  //     } catch (e: any) {
  //       message.error(e?.response?.data?.error || "โหลดรายการบิลไม่สำเร็จ");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   run();
  // }, [studentId]);
  

  const selectableIds = useMemo(
    () => bills.filter(b => b.uiStatus === "ยังไม่ชำระ").map(b => b.billId),
    [bills]
  );

  const onToggle = (billId: number, checked: boolean) => {
    setSelected(prev =>
      checked ? Array.from(new Set([...prev, billId])) : prev.filter(id => id !== billId)
    );
  };

  const onSelectAll = () => setSelected(selectableIds);
  const onClear = () => setSelected([]);

  const goPay = () => {
    if (selected.length === 0) return;
    navigate(`/payments/checkout?billIds=${selected.join(",")}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        ชำระเงิน
      </Typography.Title>

      <Flex gap={12} style={{ marginBottom: 16 }}>
        <Button onClick={onSelectAll} disabled={selectableIds.length === 0}>เลือกทั้งหมด</Button>
        <Button onClick={onClear} disabled={selected.length === 0}>ล้างการเลือก</Button>
        <Flex flex={1} />
        <Button
          type="primary"
          onClick={() => {
            if (selected.length === 0) return;
            // ✅ จาก /student/payments → ไป /student/payments/checkout
            navigate(`checkout?billIds=${selected.join(",")}`);
          }}
          disabled={selected.length === 0}
        >
          ชำระเงิน
        </Button>
      </Flex>
          
      <List
        loading={loading}
        dataSource={bills}
        renderItem={(item) => {
          const checked = selected.includes(item.billId);
          const disabled = item.uiStatus !== "ยังไม่ชำระ";
          return (
            <List.Item>
              <Card
                style={{
                  width: "100%",
                  background: "#e6f4ff",
                  border: "none",
                  borderRadius: 16
                }}
                bodyStyle={{ padding: 16 }}
              >
                <Flex align="center" gap={12}>
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onToggle(item.billId, e.target.checked)}
                  />
                  <Flex vertical style={{ flex: 1 }}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                  </Flex>

                  <Typography.Text strong style={{ width: 120, textAlign: "right" }}>
                    {currency(item.amount)}
                  </Typography.Text>

                  {item.uiStatus === "ยังไม่ชำระ" && <Tag color="blue">ยังไม่ชำระ</Tag>}
                  {item.uiStatus === "รอตรวจสอบ" && <Tag color="gold">รอตรวจสอบ</Tag>}
                  {item.uiStatus === "ชำระแล้ว" && <Tag color="green">ชำระแล้ว</Tag>}
                </Flex>
              </Card>
            </List.Item>
          );
        }}
      />

      <Card style={{ marginTop: 24 }}>
        <Typography.Title level={5} style={{ marginBottom: 12 }}>สถานะการตรวจสลิปล่าสุด</Typography.Title>
        <Table
          size="small"
          rowKey="id"
          dataSource={myPayments}
          pagination={false}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "เวลา", dataIndex: "dateTime", width: 180, render: (v:string)=> new Date(v).toLocaleString("th-TH") },
            { title: "ยอด", dataIndex: "amount", width: 120, align: "right", render: (v:number)=> new Intl.NumberFormat("th-TH").format(v) },
            { title: "สถานะ", dataIndex: "statusCode", width: 140, render: (s:string)=> s==="COMPLETE"? <Tag color="green">ตรวจสอบสำเร็จ</Tag> : s==="REJECTED"? <Tag color="red">ตรวจสอบไม่สำเร็จ</Tag> : <Tag color="gold">รอตรวจ</Tag> },
            { title: "สลิป", dataIndex: "slipUrl", render: (u:string)=> <a href={abs(u)} target="_blank" rel="noreferrer">เปิดสลิป</a> },
            { title: "บิลที่เกี่ยวข้อง", dataIndex: "bills", render: (bs:any[])=> <Space direction="vertical" size={0}>{bs?.map(b=> <span key={b.billId}>{b.title}</span>)}</Space> },
          ]}
        />
      </Card>
    </div>
  );
};

export default PaymentListPage;
