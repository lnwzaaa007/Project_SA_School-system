import React, { useMemo, useState } from "react";
import { Card, Typography, Table, Tag } from "antd";
import SelectCourse from "../../../components/SelectCourse";

const { Text } = Typography;

type AttendanceStatus = "present" | "leave" | "absent";

type AttendanceRecord = {
  id: number;
  date: string;     // วันที่ครูเช็คชื่อ (เช่น '2025-08-18')
  period: string;   // คาบ/ช่วงเวลา (เช่น 'คาบ 1' หรือ '08:40-09:30')
  status: AttendanceStatus; // 'present' | 'leave' | 'absent'
  remark?: string;
};

// 🔰 ตัวอย่างข้อมูล (ต่อ "นักเรียนคนนี้")
const initialRecords: AttendanceRecord[] = [
  { id: 1, date: "2025-08-18 08:30:23", period: "คาบ 1", status: "present" },
  { id: 2, date: "2025-08-18 08:30:23", period: "คาบ 2", status: "leave", remark: "ลาพบหมอ" },
  { id: 3, date: "2025-08-19 08:30:23", period: "คาบ 1", status: "absent" },
  { id: 4, date: "2025-08-20 08:30:23", period: "คาบ 1", status: "leave" },
];

const statusLabel: Record<AttendanceStatus, string> = {
  present: "มา",
  leave: "ลา",
  absent: "ขาด",
};

const statusColor: Record<AttendanceStatus, string> = {
  present: "#52c41a", // green
  leave: "#faad14",   // gold
  absent: "#f5222d",  // red
};

const Attendance: React.FC = () => {
  const [records] = useState<AttendanceRecord[]>(initialRecords);

  // 📊 สรุปยอดตามสถานะ
  const summary = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        if (r.status === "present") acc.present++;
        if (r.status === "leave") acc.leave++;
        if (r.status === "absent") acc.absent++;
        return acc;
      },
      { present: 0, leave: 0, absent: 0 }
    );
  }, [records]);

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
      align: "center" as const,
    },
    {
      title: "วันที่เช็คชื่อ",
      dataIndex: "date",
      key: "date",
      width: 260,
      align: "center" as const,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (value: AttendanceStatus) => (
        <Tag color={statusColor[value]} style={{ padding: "2px 10px", fontWeight: 600 }}>
          {statusLabel[value]}
        </Tag>
      ),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "remark",
      key: "remark",
      ellipsis: true,
    },
  ];

  return (
    <div
      className="attendance-font"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card style={{ width: "100%", border: "none", boxShadow: "none" }} bodyStyle={{ padding: "24px" }}>
        {/* Filter Section (ถ้าต้องกรองรายวิชา) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <SelectCourse/>
        </div>

        {/* ตารางรายวัน */}
        <div style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={false}
            bordered
          />
        </div>

        {/* Summary */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <div
              style={{
                backgroundColor: "#52c41a",
                padding: "12px 24px",
                borderRadius: 8,
                minWidth: 120,
                textAlign: "center",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              มา {summary.present}
            </div>
            <div
              style={{
                backgroundColor: "#faad14",
                padding: "12px 24px",
                borderRadius: 8,
                minWidth: 120,
                textAlign: "center",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              ลา {summary.leave}
            </div>
            <div
              style={{
                backgroundColor: "#f5222d",
                padding: "12px 24px",
                borderRadius: 8,
                minWidth: 120,
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              ขาด {summary.absent}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
