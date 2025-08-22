import React, { useState } from "react";
import { Table, Row, Col, Card, Checkbox } from "antd";

// ข้อมูลตัวอย่าง
const initialPaymentData = [
  {
    key: "1",
    name: "สมชาย ใจดี",
    amount: 5000,
    time: "09:30",
    date: "2025-08-21",
    base: "โอนเงิน",
    status: "pending",
  },
  {
    key: "2",
    name: "สุดา สวยงาม",
    amount: 5000,
    time: "10:15",
    date: "2025-08-20",
    base: "โอนเงิน",
    status: "success",
  },
];

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "#FFF9D6", text: "รอตรวจสอบ" },
  success: { color: "#D6F9E7", text: "ชำระเงินสำเร็จ" },
};

const Payment: React.FC = () => {
  const [paymentData, setPaymentData] = useState(initialPaymentData);

  // นับจำนวนแต่ละสถานะ
  const pendingCount = paymentData.filter((d) => d.status === "pending").length;
  const successCount = paymentData.filter((d) => d.status === "success").length;

  const handleCheck = (key: string, checked: boolean) => {
    setPaymentData((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, status: checked ? "success" : "pending" }
          : item
      )
    );
  };

  const columns = [
    {
      title: "ลำดับที่",
      dataIndex: "key",
      key: "key",
      align: "center" as const,
    },
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      align: "center" as const,
    },
    {
      title: "ยอดที่ชำระ",
      dataIndex: "amount",
      key: "amount",
      align: "center" as const,
      render: (amount: number) => `${amount.toLocaleString()} บาท`,
    },
    {
      title: "เวลา",
      dataIndex: "time",
      key: "time",
      align: "center" as const,
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      align: "center" as const,
    },
    {
      title: "หลักฐาน",
      dataIndex: "base",
      key: "base",
      align: "center" as const,
    },
    {
      title: "สถานะการตรวจสอบ",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <span
          style={{
            background: statusMap[status].color,
            borderRadius: 8,
            padding: "2px 12px",
            fontSize: 14,
          }}
        >
          {statusMap[status].text}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.status === "success"}
          onChange={(e) => handleCheck(record.key, e.target.checked)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <Row gutter={32} style={{ marginBottom: 24 ,display: "flex", justifyContent: "center"}}>
        <Col>
          <Card
            style={{
              background: "#FFE2A9",
              borderRadius: 16,
              width: 180,
              textAlign: "center",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ fontSize: 32, fontWeight: "bold" }}>{pendingCount}</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>รอตรวจสอบ</div>
          </Card>
        </Col>
        <Col>
          <Card
            style={{
              background: "#B7E6B7",
              borderRadius: 16,
              width: 180,
              textAlign: "center",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ fontSize: 32, fontWeight: "bold" }}>{successCount}</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>ตรวจสอบแล้ว</div>
          </Card>
        </Col>
      </Row>
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>รายการที่ต้องตรวจ</div>
      <Table
        columns={columns}
        dataSource={paymentData}
        pagination={false}
        bordered
        style={{ background: "#fff" }}
      />
    </div>
  );
};

export default Payment;
// filepath: d:\Project_SA_School-system\frontend\src\pages\admin\Payment\index.tsx
