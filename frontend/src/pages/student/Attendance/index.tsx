import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, Typography, Table, Tag, message } from "antd";
import { AttendancesAPI, studentAPI } from "../../../services/https";
import {formatThaiDateTime} from "./formatTime"
import "./index.css" 

const { Text } = Typography;

type AttendanceStatus = "present" | "leave" | "absent";

type AttendanceRecord = {
  date: string;     // วันที่ครูเช็คชื่อ (เช่น '2025-08-18')
  period: string;   // คาบ/ช่วงเวลา (เช่น 'คาบ 1' หรือ '08:40-09:30')
  status: AttendanceStatus; // 'present' | 'leave' | 'absent'
  remark?: string;
};

//  ตัวอย่างข้อมูล (fallback กรณีไม่มีข้อมูล)
const initialRecords: AttendanceRecord[] = [];

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
  const { state } = useLocation() as { state?: any };
  const [messageApi, contextHolder] = message.useMessage();

  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [loading, setLoading] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>("");
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const studentId = Number(localStorage.getItem("IDstudent"));
  if (!scheduleId){
    console.warn("ไม่พบ IDstudent ใน localStorage");
  }

  // รับค่าจากตารางเรียนที่ส่งมาผ่าน navigate state
  useEffect(() => {
    if (!state) return;
    const cName = state.course_name ? String(state.course_name) : "";
    const sId = state.id_schedule !== undefined ? Number(state.id_schedule) : null;
    setCourseName(cName);
    setScheduleId(Number.isNaN(sId as any) ? null : sId);
  }, [state]);

  // โหลดประวัติการเช็กชื่อ เมื่อมี scheduleId และ studentId ครบ
  useEffect(() => {
    const fetchHistory = async () => {
      if (!scheduleId || !studentId) return;
      try {
        setLoading(true);
        const res: any = await AttendancesAPI.getAttendanceHistory(scheduleId, studentId);
        const list = Array.isArray(res?.data) ? res.data : [];

        const toStatus = (statusId: number): AttendanceStatus => {
          if (statusId === 1) return "present";
          if (statusId === 2) return "leave";
          return "absent";
        };

        const mapped: AttendanceRecord[] = list.map((it: any) => {
          const dtRaw = it.Attendances_Date ?? it.attendances_date ?? it.Date ?? it.date;
          const note = it.Note ?? it.note ?? "";
          const statusId = Number(it.AttendanceStatusID ?? it.attendance_status_id ?? 0);
          return {
            date: formatThaiDateTime(dtRaw),
            period: "", // ไม่ได้ส่งช่วงคาบมาจาก backend ณ ตอนนี้
            status: toStatus(statusId),
            remark: note,
          } as AttendanceRecord;
        });

        setRecords(mapped);
      } catch (err) {
        console.error("โหลดประวัติการเช็คชื่อล้มเหลว:", err);
        messageApi.error("ไม่สามารถโหลดประวัติการเช็คชื่อได้");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [scheduleId, studentId]);
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
      width: 100,
      align: "center" as const,
    },
    {
      title: "วันที่เช็คชื่อ",
      dataIndex: "date",
      key: "date",
      width: 330,
      align: "center" as const,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 150,
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
      {contextHolder}
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
          <Text style={{ fontSize: 20, fontWeight: 600 }}>วิชา: {courseName || "-"}</Text>
        </div>

        {/* ตารางรายวัน */}
        <div style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey={(_, idx) => String(idx)}
            pagination={false}
            bordered
            loading={loading}
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
