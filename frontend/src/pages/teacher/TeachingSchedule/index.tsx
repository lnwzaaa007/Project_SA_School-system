import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScheduleAPI } from "../../../services/https";
import type { ScheduleInterface } from "../../../interfaces/Schedule";
import { Table, Card, message, List, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
// import "./index.css";

interface TimeTableRow {
  key: string;
  day: string;
  time1?: string;
  time2?: string;
  time3?: string;
  time4?: string;
  time5?: string; // พักเที่ยง (merge แถว)
  time6?: string;
  time7?: string;
  time8?: string;
  time9?: string;
  span?: Record<number, number>; 
}

// ใช้ชื่อวันให้ตรงกับข้อมูล API
const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"] as const;

// จุดเริ่มของแต่ละคาบ (สอดคล้องกับหัวคอลัมน์)
const TIME_SLOTS = [
  "08:40", // time1
  "09:30", // time2
  "10:20", // time3
  "11:10", // time4
  "12:00", // time5 (พักเที่ยง)
  "13:00", // time6
  "13:50", // time7
  "14:40", // time8
  "15:30", // time9
] as const;

type TimeKey = Exclude<keyof TimeTableRow, "key" | "day" | "span">;


const ROOM_PALETTE = [
  "#577590", // steel
  "#277DA1", // blue
  "#9C27B0", // purple
  "#3F51B5", // indigo
  "#009688", // cyan
  "#795548", // brown
  "#E91E63", // pink
  "#F94144", // red
  "#F3722C", // orange
  "#F8961E", // amber
  "#90BE6D", // green
  "#43AA8B", // teal
];

// ดึงชื่อห้องออกมา เช่น "ห้อง 1/1"
const getRoomFromCell = (val?: string) => {
  const parts = (val || "").split("\n");
  return parts[2]?.trim(); // index 2 สมมติว่าเป็นห้อง
};

// แปลง string เป็น index (วนกลับมาที่ palette ถ้าเกิน)
const getRoomColors = (room?: string) => {
  if (!room) return undefined;

  let hash = 0;
  for (let i = 0; i < room.length; i++) {
    hash = (hash + room.charCodeAt(i)) % ROOM_PALETTE.length;
  }

  const bg = ROOM_PALETTE[hash];
  return {
    backgroundColor: bg,
    color: "#000"
  } as React.CSSProperties;
};
const renderCell = (period: number) =>
  (value: string | undefined, row: TimeTableRow) => {
    const span = row.span?.[period] ?? 1;
    if (span === 0) return { children: null, props: { colSpan: 0 } };
    const room = getRoomFromCell(value);
    const style = getRoomColors(room);
    return { children: value, props: { colSpan: span, style } };
  };

const ScheduleTeacher: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [detailCourse, setDetailCourse] = useState<ScheduleInterface[]>([]);

  // const [schedule, setSchedule] = useState<ScheduleInterface[]>([]);
  const [tableData, setTableData] = useState<TimeTableRow[]>(
    DAYS.map((d, i) => ({ key: String(i + 1), day: d }))
  );
  const [loading, setLoading] = useState(false);

  // แปลงข้อมูล API → ตาราง
  const buildTableData = (items: ScheduleInterface[]): TimeTableRow[] => {
    const rows: TimeTableRow[] = DAYS.map((d, i) => ({
      key: String(i + 1),
      day: d,
    }));

    const startIdx = (t: string | undefined): number => {
      if (!t) return -1;
      return TIME_SLOTS.findIndex((x) => x === t); // 0-based
    };

    const endIdxExclusive = (t: string | undefined): number => {
      if (!t) return -1;
      const idx = TIME_SLOTS.findIndex((x) => x === t);
      return idx === -1 ? TIME_SLOTS.length : idx; // exclusive
    };

    items.forEach((raw: any) => {
      // รองรับทั้งโครงสร้างแบน และแบบ nested เดิม
      const day =
        raw.day ??
        "";

      // ถ้า API ให้คาบเป็นเวลา
      let sTime =
        raw.start_time ??
        undefined;
      let eTime =
        raw.end_time ??

        undefined;

      const start = startIdx(sTime);
      const endEx = endIdxExclusive(eTime);

      if (start < 0 || endEx < 0) return;

      const row = rows.find((r) => r.day === day);
      if (!row) return;

      // รวมชื่ออาจารย์/รหัสอาจารย์ในข้อความ เพื่อให้การ merge เซลล์พิจารณา "วิชา+ผู้สอน" ร่วมกัน
      // const teacherName = raw.teacher_name ?? "";
      // const teacherTag = teacherName ? `\n(${teacherName})`: "";

      const courseText = `${raw.course_code}\n${raw.course_name ?? "ไม่ทราบชื่อวิชา"}\nห้อง${raw.grade_year}/${raw.grade_class}`
      // `${raw.teacher || raw.Teacher? ` (${raw.teacher ?? raw.Teacher?.FullName ?? ""})`: ""};`

      // เติมลงคาบ time{n} — ข้ามคาบ 5 (พักเที่ยง) เพราะ merge ไว้แล้ว
      for (let i = start; i < endEx; i++) {
        const periodNum = i + 1; // time1..time9
        if (periodNum === 5) continue; // lunch is merged
        const key = `time${periodNum}` as TimeKey;
        row[key] = courseText;
      }
    });

    rows.forEach((r) => (r.span = computeSpanMap(r)));
    return rows;
  };

  const computeSpanMap = (row: TimeTableRow): Record<number, number> => {
    const map: Record<number, number> = {};
    const periods = [1, 2, 3, 4, 6, 7, 8, 9]; // เว้น 5 (พักเที่ยง)

    // ตารางเวลาแต่ละคาบ (ใช้สำหรับเช็คความต่อเนื่อง)
    const slotRanges = [
      ["08:40", "09:30"], // 1
      ["09:30", "10:20"], // 2
      ["10:20", "11:10"], // 3
      ["11:10", "12:00"], // 4
      // 5 พักเที่ยง
      ["13:00", "13:50"], // 6
      ["13:50", "14:40"], // 7
      ["14:40", "15:30"], // 8
      ["15:30", "16:30"], // 9
    ];

    let i = 0;
    while (i < periods.length) {
      const p = periods[i];
      const key = `time${p}` as TimeKey;
      const val = row[key];

      if (!val) {
        map[p] = 1;
        i++;
        continue;
      }

      let span = 1;
      let j = i + 1;
      while (j < periods.length) {
        const p2 = periods[j];
        const key2 = `time${p2}` as TimeKey;
        // เฉพาะกรณีชื่อวิชาเหมือนกัน และเวลาต่อเนื่องกันเท่านั้น
        if (
          row[key2] === val &&
          slotRanges[j - 1][1] === slotRanges[j][0] // เวลาจบของคาบก่อน = เวลาเริ่มคาบถัดไป
        ) {
          span++;
          j++;
        } else {
          break;
        }
      }

      map[p] = span;
      for (let k = i + 1; k < j; k++) map[periods[k]] = 0;

      i = j;
    }
    return map;
  };

  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      const teacher_id = Number(localStorage.getItem("ID"));

      // ถ้าไม่มี grade_id ให้เคลียร์ตารางและจบ
      if (!teacher_id || teacher_id <= 0 || Number.isNaN(teacher_id)) {
        setDetailCourse([]);
        setTableData(DAYS.map((d, i) => ({ key: String(i + 1), day: d })));
        return;
      }

      // เรียก API ตารางเรียนของนักเรียนตาม grade_id
      const res: any = await ScheduleAPI.getTeacherSchedule(teacher_id);

      // รูปแบบจาก backend: { data: [...], term_id, semester, academic_year }
      const raw = (Array.isArray(res?.data) ? res.data : []) as ScheduleInterface[];
      // console.log("dgadgasdfas", raw?.[0]?.id_schedule);

      setDetailCourse(raw);
      setTableData(buildTableData(raw));
    } catch (err) {
      console.error("❌ โหลดตารางผิดพลาด:", err);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดตาราง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherSchedule();
  }, []);

  const handleCellClick = (row: TimeTableRow, period: number) => {
    const key = `time${period}` as TimeKey;
    const val = row[key];
    if (!val) return;

    // หาเวลาเริ่ม-จบของคาบที่คลิก
    const clickedStart = TIME_SLOTS[period - 1];
    const clickedEnd = TIME_SLOTS[period] ?? "16:30";

    // helper สำหรับ map เวลา → index
    const startIdx = (t?: string) => (t ? TIME_SLOTS.findIndex((x) => x === t) : -1);
    const endIdxExclusive = (t?: string) => {
      if (!t) return -1;
      const idx = TIME_SLOTS.findIndex((x) => x === t);
      return idx === -1 ? TIME_SLOTS.length : idx; // exclusive
    };

    // พยายามจับคู่ข้อมูลวิชาจริงจาก API ด้วย day และช่วงเวลา
    const match = detailCourse.find((it) => {
      const dayOk = (it.day ?? "") === row.day;
      const s = (it as any).start_time ?? it.start_tinme;
      const e = it.end_time;
      const si = startIdx(s);
      const ei = endIdxExclusive(e);
      const pIndex = period - 1; // 0-based
      return dayOk && si !== -1 && ei !== -1 && si <= pIndex && pIndex < ei;
    });

    // parse ข้อมูลพื้นฐานจากข้อความใน cell เผื่อหา match ไม่ได้
    const [code, name, roomLabel] = (val || "").split("\n");
    let grade_year: string | undefined;
    let grade_class: number | undefined;
    const m = /ห้อง\s*(\d+)\/(\d+)/.exec(roomLabel || "");
    if (m) {
      grade_year = m[1];
      grade_class = Number(m[2]);
    }

    // รวม payload โดยให้ค่าที่ parse จากข้อความใน cell มีสิทธิ์ override ห้อง
    const payload = match
      ? {
          id_schedule: (match as any).id_schedule,
          day: match.day,
          start_time: (match as any).start_time ?? match.start_tinme,
          end_time: match.end_time,
          course_code: match.course_code,
          course_name: match.course_name,
          grade_year: grade_year ?? match.grade_year,
          grade_class: grade_class ?? match.grade_class,
        }
      : {
          day: row.day,
          start_time: clickedStart,
          end_time: clickedEnd,
          course_code: code,
          course_name: name,
          grade_year,
          grade_class,
        };

    navigate("/teacher/attendanceRecord", { state: payload });
  };

  // คอลัมน์ของตาราง (เพิ่ม onCell เพื่อให้คลิกได้)
  const timeTableColumns: ColumnsType<TimeTableRow> = [
    { title: "Day/Time", dataIndex: "day", key: "day", align: "center" },
    {
      title: "08.40-09.30",
      dataIndex: "time1",
      key: "time1",
      align: "center",
      render: renderCell(1),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 1),
        style: { cursor: record.time1 ? "pointer" : "default" },
      }),
    },
    {
      title: "09.30-10.20",
      dataIndex: "time2",
      key: "time2",
      align: "center",
      render: renderCell(2),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 2),
        style: { cursor: record.time2 ? "pointer" : "default" },
      }),
    },
    {
      title: "10.20-11.10",
      dataIndex: "time3",
      key: "time3",
      align: "center",
      render: renderCell(3),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 3),
        style: { cursor: record.time3 ? "pointer" : "default" },
      }),
    },
    {
      title: "11.10-12.00",
      dataIndex: "time4",
      key: "time4",
      align: "center",
      render: renderCell(4),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 4),
        style: { cursor: record.time4 ? "pointer" : "default" },
      }),
    },
    {
      title: "12.00-13.00",
      dataIndex: "time5",
      key: "time5",
      align: "center",
      render: (_, __, index) => {
        if (index === 0) {
          return { children: "พักเที่ยง", props: { rowSpan: DAYS.length } };
        }
        return { children: null, props: { rowSpan: 0 } };
      },
    },
    {
      title: "13.00-13.50",
      dataIndex: "time6",
      key: "time6",
      align: "center",
      render: renderCell(6),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 6),
        style: { cursor: record.time6 ? "pointer" : "default" },
      }),
    },
    {
      title: "13.50-14.40",
      dataIndex: "time7",
      key: "time7",
      align: "center",
      render: renderCell(7),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 7),
        style: { cursor: record.time7 ? "pointer" : "default" },
      }),
    },
    {
      title: "14.40-15.30",
      dataIndex: "time8",
      key: "time8",
      align: "center",
      render: renderCell(8),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 8),
        style: { cursor: record.time8 ? "pointer" : "default" },
      }),
    },
    {
      title: "15.30-16.30",
      dataIndex: "time9",
      key: "time9",
      align: "center",
      render: renderCell(9),
      onCell: (record) => ({
        onClick: () => handleCellClick(record, 9),
        style: { cursor: record.time9 ? "pointer" : "default" },
      }),
    },
  ];

  
  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card style={{ width: "100%", border: "none", boxShadow: "none" }} bodyStyle={{ padding: "40px" }}>
          {/* ตารางเวลา */}
          <div style={{ overflowX: "auto", paddingTop: "40px" }}>
            <Table
              className="timetable"
              rowKey="key"
              dataSource={tableData}
              columns={timeTableColumns}
              pagination={false}
              bordered
              loading={loading}
              style={{ minWidth: 1200 }}
            />
          </div>
          {detailCourse && detailCourse.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <div style={{ width: "100%", maxWidth: 1000 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                  ***รายละเอียดคาบ***
                </div>
                <List
                  bordered
                  dataSource={[...detailCourse].sort((a, b) => {
                    const dayA = a.day ?? "";
                    const dayB = b.day ?? "";
                    if (dayA !== dayB) return dayA.localeCompare(dayB, "th");
                    const tA = ((a as any).start_time ?? a.start_tinme ?? "") as string;
                    const tB = ((b as any).start_time ?? b.start_tinme ?? "") as string;
                    if (tA !== tB) return tA.localeCompare(tB);
                    return (a.course_code ?? "").localeCompare(b.course_code ?? "");
                  })}
                  renderItem={(item) => {
                    const fmtTime = (it: ScheduleInterface) => {
                      const start = (it as any).start_time ?? it.start_tinme ?? "";
                      const end = it.end_time ?? "";
                      return start && end ? `${start}–${end}` : start || end || "-";
                    };
                    return (
                      <List.Item style={{ display: "block" }}>
                        <div style={{ fontWeight: 700 }}>
                          {item.course_code || "-"}: {item.course_name || "(ไม่มีชื่อวิชา)"}
                        </div>
                        <Divider style={{ margin: "8px 0" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>วัน: {item.day || "-"}</div>
                          <div>เวลา: {fmtTime(item)}</div>
                          <div>หน่วยกิต: {item.credit_num ?? "-"}</div>
                          <div>จำนวนคาบ/สัปดาห์: {item.class_in_week ?? "-"}</div>
                          <div>ชั่วโมง/เทอม: {item.hours_of_term ?? "-"}</div>
                          <div>กลุ่มสาระ: {item.subject_group || "-"}</div>
                          <div style={{ gridColumn: "1 / -1" }}>ห้อง: {item.grade_year|| "-"}/{item.grade_class|| "-"}</div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
export default ScheduleTeacher;
