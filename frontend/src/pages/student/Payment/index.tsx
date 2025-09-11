// import React, { useState } from "react";
// import { Select, Button } from "antd";
// import { Link } from "react-router-dom";

// // กล่องชำระเงินแต่ละรายการ
// function PaymentBox({ name }: { name: string }) {
//   return (
    
//     <div
//       style={{
//         width: "80%",
//         backgroundColor: "#cceaff",
//         padding: "20px",
//         marginBottom: "20px",
//         borderRadius: "12px",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//       }}
//     >
//       <div>{name}</div>
//       <Link to="/student/payment/slip">
//         <Button
//           type="primary"
//           style={{
//             borderRadius: "20px",
//             paddingInline: "24px",
//           fontWeight: "bold",
//         }}
//       >
//         ชำระเงิน
//       </Button>
//       </Link>
//     </div>
//   );
// }

// function index() {
//   const [gradeOPTIONS, setGradeOptions] = useState<string[]>([]);
//   const [termOPTIONS, setTermOptions] = useState<string[]>([]);

//   // ชั้นปีการศึกษา
//   const GradeOPTIONS = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
//   const GradeOptions = GradeOPTIONS.filter((o) => !gradeOPTIONS.includes(o));

//   // เทอม
//   const TermOPTIONS = ["เทอม 1", "เทอม 2"];
//   const TermOptions = TermOPTIONS.filter((o) => !termOPTIONS.includes(o));

//   // สมมุติข้อมูลนักเรียนที่ต้องชำระเงิน
//   const paymentData = [
//     { id: 1, name: "นักเรียน ม.1 เทอม 1" },
//     { id: 2, name: "นักเรียน ม.1 เทอม 2" },
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         marginTop: "10px",
//       }}
//     >
//       <h1 style={{ textAlign: "center", marginBottom: "30px" }}>ชำระเงิน</h1>

//       {/* Select เลือกกรอง */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           gap: "20px",
//           alignItems: "center",
//           marginBottom: "30px",
//         }}
//       >
//         <Select
//           mode="multiple"
//           placeholder="เลือกชั้นปี"
//           value={gradeOPTIONS}
//           onChange={setGradeOptions}
//           style={{ width: "200px" }}
//           options={GradeOptions.map((item) => ({
//             value: item,
//             label: item,
//           }))}
//         />

//         <Select
//           mode="multiple"
//           placeholder="เลือกเทอม"
//           value={termOPTIONS}
//           onChange={setTermOptions}
//           style={{ width: "200px" }}
//           options={TermOptions.map((item) => ({
//             value: item,
//             label: item,
//           }))}
//         />
//       </div>

//       {/* กล่องชำระเงิน */}
//       {paymentData.map((data) => (
//         <PaymentBox key={data.id} name={data.name} />
//       ))}
//     </div>
//   );
// }

// export default index;

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Checkbox, Flex, List, Tag, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Get } from "../../../services/https";

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
    </div>
  );
};

export default PaymentListPage;
