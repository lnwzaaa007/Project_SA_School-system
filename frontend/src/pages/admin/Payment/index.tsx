import React, { useEffect, useMemo, useState } from "react";
import { Table, Row, Col, Card, Button, Image, Space, Tag, Typography, message, Segmented } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Get, Post } from "../../../services/https";

const RAW_API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const API_URL = String(RAW_API_URL).replace(/\/+$/, "");
const abs = (p: string) => {
  if (!p) return "";
  return p.startsWith("http") ? p : `${API_URL}${p.startsWith("/") ? "" : "/"}${p}`;
};

type PaymentBill = { billId: number; title: string; amount: number };
type StudentBrief = { id: number; student_id: string; name_th: string };
type PaymentRow = {
  id: number;
  dateTime: string;
  amount: number;
  status: "Waitting" | "Complete" | string;
  slipUrl: string;
  student?: StudentBrief;
  bills: PaymentBill[];
};

const currency = (n: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n) + " บาท";
const mapStatusColor = (s: string) => (s.toLowerCase().includes("reject") ? "red" : s.toLowerCase().startsWith("wait") ? "gold" : s.toLowerCase().startsWith("comp") ? "green" : "default");

const AdminPaymentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"waiting" | "complete">("waiting");

  const load = async () => {
    try {
      setLoading(true);
      const data = await Get(`/payments?status=${statusFilter}`);
      const normalized: PaymentRow[] = Array.isArray(data)
        ? data.map((r: any) => ({
            id: r.id,
            dateTime: r.dateTime,
            amount: r.amount,
            status: r.status,
            slipUrl: r.slipUrl,
            student: r.student
              ? { id: r.student.id, student_id: r.student.student_id, name_th: r.student.name_th }
              : undefined,
            bills: Array.isArray(r.bills) ? r.bills : [],
          }))
        : [];
      setRows(normalized);
    } catch (e: any) {
      message.error(e?.response?.data?.error || "โหลดรายการสลิปล้มเหลว");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const approve = async (id: number, ok: boolean) => {
    try {
      await Post(`/payments/${id}/verify`, { approve: ok });
      message.success(ok ? "อนุมัติเรียบร้อย" : "ตั้งเป็นรอตรวจแล้ว");
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.error || "อัพเดตสถานะล้มเหลว");
    }
  };

  const columns: ColumnsType<PaymentRow> = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: "สลิป",
      dataIndex: "slipUrl",
      width: 140,
      render: (url: string) => (
        <Space direction="vertical" size={4}>
          <a href={abs(url)} target="_blank" rel="noreferrer">
            <Image src={abs(url)} width={80} height={80} style={{ objectFit: "cover" }} preview={false} fallback="" />
          </a>
          <a href={abs(url)} target="_blank" rel="noreferrer">เปิดสลิป</a>
        </Space>
      ),
    },
    {
      title: "นักเรียน",
      dataIndex: "student",
      render: (s?: StudentBrief) =>
        s ? (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{s.name_th}</Typography.Text>
            <Typography.Text type="secondary">{s.student_id}</Typography.Text>
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "บิล",
      dataIndex: "bills",
      render: (bills: PaymentBill[]) => (
        <Space direction="vertical" size={0}>
          {bills.map((b) => (
            <Typography.Text key={b.billId}>{b.title} ({currency(b.amount)})</Typography.Text>
          ))}
        </Space>
      ),
    },
    { title: "ยอดรวม", dataIndex: "amount", width: 120, render: (v: number) => currency(v) },
    { title: "เวลา", dataIndex: "dateTime", width: 180, render: (v: string) => new Date(v).toLocaleString("th-TH") },
    { title: "สถานะ", dataIndex: "status", width: 120, render: (s: string) => <Tag color={mapStatusColor(s)}>{s}</Tag> },
    {
      title: "การทำงาน",
      key: "actions",
      width: 240,
      render: (_: any, r: PaymentRow) => (
        <Space>
          <Button type="primary" onClick={() => approve(r.id, true)}>
            อนุมัติ
          </Button>
          <Button danger onClick={() => approve(r.id, false)}>
            ไม่อนุมัติ
          </Button>
        </Space>
      ),
    },
  ];

  const pendingCount = useMemo(() => rows.filter((r) => r.status.toLowerCase().startsWith("wait")).length, [rows]);
  const successCount = useMemo(() => rows.filter((r) => r.status.toLowerCase().startsWith("comp")).length, [rows]);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 , justifyContent: "end"}}>
        <Col>
          <Segmented
            options={[
              { label: "รอตรวจ", value: "waiting" },
              { label: "อนุมัติแล้ว", value: "complete" },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as any)}
          />
        </Col>
        <Col>
          <Button onClick={load}>รีเฟรช</Button>
        </Col>
      </Row>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default AdminPaymentsPage;
