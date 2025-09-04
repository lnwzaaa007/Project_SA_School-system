import React, { useState, useEffect } from "react";
import AddCourseModal from "./AddSchedule";
import DeleteCoursesModal from "./DeleteSchedule";
import { ScheduleAPI } from "../../../services/https";
import type { ScheduleInterface } from "../../../interfaces/Schedule";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectTerm from "../../../components/SelectTerm";
import { Button, Table, Card, message, List, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Course } from "./types";
import "./index.css";

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

// Utilities: color by course code only
const getCourseCodeFromCell = (val?: string) => {
  // value format: `${course_code}\n${course_name}(+teacher)`
  return (val || "").split("\n")[0].trim();
};

const hashToHue = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0
  }
  return Math.abs(h) % 360;
};

const getCourseColors = (code?: string) => {
  if (!code) return undefined;
  const hue = hashToHue(code);
  const bg = `hsl(${hue}, 100%, 70%)`;
  const fg = `hsl(${hue}, 100%, 0%)`;
  return { backgroundColor: bg, color: fg } as React.CSSProperties;
};


const renderCell = (period: number) =>
  (value: string | undefined, row: TimeTableRow) => {
    const span = row.span?.[period] ?? 1;
    if (span === 0) return { children: null, props: { colSpan: 0 } };
    const code = getCourseCodeFromCell(value);
    const style = getCourseColors(code);
    return { children: value, props: { colSpan: span, style } };
  };

const timeTableColumns: ColumnsType<TimeTableRow> = [
  { title: "Day/Time", dataIndex: "day", key: "day", align: "center" },
  { title: "08.40-09.30", dataIndex: "time1", key: "time1", align: "center", render: renderCell(1)},
  { title: "09.30-10.20", dataIndex: "time2", key: "time2", align: "center", render: renderCell(2) },
  { title: "10.20-11.10", dataIndex: "time3", key: "time3", align: "center", render: renderCell(3) },
  { title: "11.10-12.00", dataIndex: "time4", key: "time4", align: "center", render: renderCell(4) },
  {
    title: "12.00-13.00",
    dataIndex: "time5",
    key: "time5",
    align: "center",
    render: (_, __, index) => {
      // รวม "พักเที่ยง" 5 แถวไว้ที่บรรทัดแรก (ต้องแน่ใจว่าเรียงวัน Monday→Friday)
      if (index === 0) {
        return { children: "พักเที่ยง", props: { rowSpan: DAYS.length } };
      }
      return { children: null, props: { rowSpan: 0 } };
    },
  },
  { title: "13.00-13.50", dataIndex: "time6", key: "time6", align: "center", render: renderCell(6) },
  { title: "13.50-14.40", dataIndex: "time7", key: "time7", align: "center", render: renderCell(7) },
  { title: "14.40-15.30", dataIndex: "time8", key: "time8", align: "center", render: renderCell(8) },
  { title: "15.30-16.30", dataIndex: "time9", key: "time9", align: "center", render: renderCell(9)},
];

const Schedule: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);

  const [detailCourse,setDetailCourse] = useState<ScheduleInterface[]>([]);

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
      const teacherName = raw.teacher_name ?? "";
      const teacherTag = teacherName ? `\n(${teacherName})`: "";

      const courseText = `${raw.course_code}\n${raw.course_name ?? "ไม่ทราบชื่อวิชา"}${teacherTag}`
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



  const fetchSchedule = async () => {
    // ดึงข้อมูลตารางเรียน get ด้วย term grade class
    try {
      if (selectedClass && selectedGrade && selectedTerm) {
        setLoading(true);
        const res = await ScheduleAPI.getSchedule(
          selectedGrade,
          selectedClass,
          selectedTerm
        );

        //ตรวจสอบว่า res.data เป็น array หรือไม่ถ้าใช่ จะนำค่าจาก res.data มาเก็บในตัวแปร list ถ้าไม่ใช่ จะให้ list เป็น array ว่าง
        const raw =
          (Array.isArray((res as any)?.data?.data) && (res as any).data.data) ||
          (Array.isArray((res as any)?.data) && (res as any).data) ||
          [];

        const list: ScheduleInterface[] = Array.isArray(raw) ? (raw as ScheduleInterface[]) : [];
        setDetailCourse(list);
        // setSchedule(list);
        setTableData(buildTableData(list));
      } else {
        // ยังไม่เลือกครบ → เคลียร์ตาราง
        // setSchedule([]);
        setTableData(DAYS.map((d, i) => ({ key: String(i + 1), day: d })));
      }
    } catch (err) {
      console.error("❌ โหลดตารางผิดพลาด:", err);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดตาราง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedGrade, selectedClass, selectedTerm]);

 const handleAddCourse = (newCourse: Omit<Course, "id">) => {
  const id = crypto?.randomUUID?.() ?? String(Date.now());
  setCourses(prev => [...prev, { id, ...newCourse }]);
  setIsAddModalVisible(false);
};

  const handleDeleteCourses = (coursesToDelete: Course[]) => {
    const deleteIds = coursesToDelete.map((c) => c.id);
    setCourses((prev) => prev.filter((c) => !deleteIds.includes(c.id)));
    setIsDeleteModalVisible(false);
  };

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
          {/* Filter Section */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              marginBottom: "42px",
              alignItems: "center",
            }}
          >
            <SelectGrade value={selectedGrade} onChange={setSelectedGrade} />
            <SelectClass value={selectedClass} onChange={setSelectedClass} />
            <SelectTerm value={selectedTerm} onChange={setSelectedTerm} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setIsAddModalVisible(true)}
                style={{ background: "#1677FF" }}
              >
                เพิ่ม
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={() => setIsDeleteModalVisible(true)}
                danger
                // disabled={courses.length === 0}
              >
                ลบ
              </Button>

              <AddCourseModal
                open={isAddModalVisible}
                onOk={handleAddCourse}
                onCancel={() => setIsAddModalVisible(false)}
                termId={selectedTerm ?? 0}
                gradeYear={selectedGrade ? String(selectedGrade) : ""}
                gradeClass={selectedClass ?? 0}
                fetchSchedule={fetchSchedule}
              />
              <DeleteCoursesModal
                open={isDeleteModalVisible}
                onDelete={handleDeleteCourses}
                onCancel={() => setIsDeleteModalVisible(false)}
                termId={selectedTerm ?? 0}
                gradeYear={selectedGrade ?? 0}
                gradeClass={selectedClass ?? 0}
                fetchSchedule={fetchSchedule}
                // courses={courses}
              />
            </div>
          </div>

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
              locale={{ emptyText: selectedGrade && selectedClass && selectedTerm ? "ไม่พบข้อมูลตารางในช่วงที่เลือก" : "โปรดเลือกระดับชั้น / ห้อง / ภาคเรียน" }}
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
                          <div style={{ gridColumn: "1 / -1" }}>อาจารย์: {item.teacher_name || "-"}</div>
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

export default Schedule;
