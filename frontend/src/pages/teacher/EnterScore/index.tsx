// src/pages/teacher/EnterScore/index.tsx
import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Button, message } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectTerm from "../../../components/SelectTerm";
import SelectCourse from "../../../components/SelectCourse";
import SelectTeacher from "../../../components/SelectTeacher";
// ถ้าโปรเจกต์คุณใช้ studentCRUD ให้เปลี่ยน StudentAPI → studentCRUD
import { studentCRUD, gradeCRUD , EduRecordAPI } from "../../../services/https";

type DraftRow = Pick<Row, "collect" | "work" | "behavior" | "midterm" | "final" | "total" | "grade">;
type DraftMap = Record<number, DraftRow>; // key = studentDbId

const DRAFT_NS = "enterScore:v1";

const makeDraftKey = (args: {
  termId?: number;
  courseId?: number | null;
  teacherId?: number | null;
  gradeId?: number;
}) => {
  const { termId, courseId, teacherId, gradeId } = args;
  return `${DRAFT_NS}:${termId ?? "term"}:${courseId ?? "course"}:${teacherId ?? "teacher"}:${gradeId ?? "grade"}`;
};

const saveDraft = (key: string, rows: Row[]) => {
  const map: DraftMap = {};
  rows.forEach(r => {
    // เก็บเฉพาะฟิลด์คะแนน
    map[r.studentDbId] = {
      collect: r.collect,
      work: r.work,
      behavior: r.behavior,
      midterm: r.midterm,
      final: r.final,
      total: r.total,
      grade: r.grade,
    };
  });
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: map }));
};

const loadDraft = (key: string): DraftMap | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return obj?.data ?? null;
  } catch { return null; }
};

const clearDraft = (key: string) => {
  localStorage.removeItem(key);
};


type Row = {
  key: number;
  no: number;
  // เก็บ id จริงของ table students (ไว้ใช้ตอนบันทึกคะแนน)
  studentDbId: number;
  id: string;      // = student_id (จะแสดงในคอลัมน์ "รหัส")
  name: string;    // = "ชื่อ นามสกุล" (จะแสดงในคอลัมน์ "ชื่อ - นามสกุล")
  // ช่องคะแนน
  collect?: number;
  work?: number;
  behavior?: number;
  midterm?: number;
  final?: number;
  total?: number;
  grade?: number;
  recId?: number;     // <-- เพิ่ม: id ของ education_records (ถ้ามี)
};

type GradeMeta = { year: string; room: string };


const EnterScore: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
const [courseId, setCourseId] = useState<number | null>(null);
  // เลือกตัวกรอง
  const [gradeYear, setGradeYear] = useState<string | null>(null);
  const [gradeClass, setGradeClass] = useState<string | null>(null);
  const [termId, setTermId] = useState<number | undefined>();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // map grade_id -> {year, room} (ไว้หา grade_id จาก year+room ที่หน้า UI เลือก)
  const [gradeMap, setGradeMap] = useState<Record<number, GradeMeta>>({});


  const saveTimer = React.useRef<number | null>(null);

const queueSaveDraft = (key: string, rowsToSave: Row[], delay = 400) => {
  if (saveTimer.current) window.clearTimeout(saveTimer.current);
  saveTimer.current = window.setTimeout(() => {
    saveDraft(key, rowsToSave);
  }, delay);
};

  useEffect(() => {
    // โหลดรายการชั้น/ห้อง → สร้าง gradeMap
    (async () => {
      try {
        const res = await gradeCRUD.list();
        const list = res?.data?.data ?? res?.data ?? [];
        const map: Record<number, GradeMeta> = {};
        list.forEach((g: any) => {
          map[Number(g.id)] = {
            year: String(g.grade_year ?? ""),
            room: String(g.grade_class ?? ""),
          };
        });
        setGradeMap(map);
      } catch (e: any) {
        message.error(e?.message || "โหลดรายการชั้น/ห้องไม่สำเร็จ");
      }
    })();
  }, []);

const findGradeIdByYearRoom = (
  y: string | number | null,
  r: string | number | null
): number | undefined => {
  if (y == null || r == null) return undefined;

  const yNum = Number(y);
  const rNum = Number(r);

  // gradeMap: { [id: number]: { year: string; room: string } }
  for (const [id, meta] of Object.entries(gradeMap)) {
    if (Number(meta.year) === yNum && Number(meta.room) === rNum) {
      return Number(id);
    }
  }
  return undefined;
};

// let mapped: Row[] = list.map((s: any, idx: number) => ({
//   key: s.id,
//   no: idx + 1,
//   studentDbId: s.id,
//   id: s.student_id,
//   name: `${s.t_first_name ?? ""} ${s.t_last_name ?? ""}`.trim(),
// }));


  const gradeFromTotal = (t: number): number => {
    if (t >= 80) return 4.0;
    if (t >= 75) return 3.5;
    if (t >= 70) return 3.0;
    if (t >= 65) return 2.5;
    if (t >= 60) return 2.0;
    if (t >= 55) return 1.5;
    if (t >= 50) return 1.0;
    return 0.0;
  };

  const updateCell = (key: number, field: keyof Row, value: number | undefined, draftKey?: string) => {
  setRows((prev) => {
    const nextRows = prev.map((r) => {
      if (r.key !== key) return r;
      const next = { ...r, [field]: value };
      const t =
        (Number(next.collect) || 0) +
        (Number(next.work) || 0) +
        (Number(next.behavior) || 0) +
        (Number(next.midterm) || 0) +
        (Number(next.final) || 0);
      next.total = t;
      next.grade = gradeFromTotal(t);
      return next;
    });

    if (draftKey) queueSaveDraft(draftKey, nextRows);
    return nextRows;
  });
};

const fetchStudents = async () => {
  try {
    setLoading(true);

    // ต้องเลือกชั้น+ห้องก่อน
    if (!gradeYear || !gradeClass) {
      message.warning("กรุณาเลือกชั้นปีและห้องก่อนค้นหา");
      setRows([]);
      return;
    }

    const gradeId = findGradeIdByYearRoom(gradeYear, gradeClass);
    
    if (gradeId === undefined) {
      console.warn("🟠 ไม่พบ gradeId จาก year/room:", { gradeYear, gradeClass, gradeMap });
      message.warning("จับคู่ชั้น/ห้องไม่เจอในระบบ");
      setRows([]);
      return;
    }

    const draftKey = makeDraftKey({ termId, courseId, teacherId, gradeId });

    

    const res = await studentCRUD.list({
      grade_id: gradeId,
      page: 1,
      page_size: 1000,
    });

    const payload = (res && res.data !== undefined) ? res.data : res;
    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];

    let mapped: Row[] = list.map((s: any, idx: number) => ({
      key: s.id,
      no: idx + 1,
      studentDbId: s.id,
      id: s.student_id,
      name: `${s.t_first_name ?? ""} ${s.t_last_name ?? ""}`.trim(),
    }));

    if (termId && courseId) {
  const recRes = await EduRecordAPI.list({
    term_id: termId,
    course_id: courseId,
    ...(teacherId ? { teacher_id: teacherId } : {}),
    page_size: 10000,
  });
      const recPayload = (recRes && recRes.data !== undefined) ? recRes.data : recRes;
      const recList = Array.isArray(recPayload?.data)
        ? recPayload.data
        : Array.isArray(recPayload)
        ? recPayload
        : [];

      const byStu = new Map<number, any>();
      recList.forEach((r: any) => byStu.set(Number(r.student_id), r));

      mapped = mapped.map((r) => {
        const rec = byStu.get(r.studentDbId);
        if (!rec) return r;
        const point = Number(rec.point ?? 0);
        const behavior = Number(rec.behavior_point ?? 0);
        const mid = Number(rec.mid_point ?? 0);
        const fin = Number(rec.final_point ?? 0);
        const total = point + behavior + mid + fin;
        return {
          ...r,
          recId: Number(rec.id),
          collect: point,
          work: 0,
          behavior,
          midterm: mid,
          final: fin,
          total,
          grade: Number(rec.grade_point ?? gradeFromTotal(total)),
        };
      });
    }

    const draft = loadDraft(draftKey);
if (draft) {
  mapped = mapped.map(row => {
    const d = draft[row.studentDbId];
    if (!d) return row;
    // ใช้ draft ทับ เพื่อคงค่าที่ผู้ใช้เคยพิมพ์
    const merged = { ...row, ...d };
    // เผื่อ draft ไม่มี total/grade ให้คำนวณใหม่
    const t =
      (Number(merged.collect) || 0) +
      (Number(merged.work) || 0) +
      (Number(merged.behavior) || 0) +
      (Number(merged.midterm) || 0) +
      (Number(merged.final) || 0);
    merged.total = t;
    merged.grade = gradeFromTotal(t);
    return merged;
  });
}
setRows(mapped);

    setRows(mapped);
    if (mapped.length === 0) message.info("ไม่พบนักเรียนตามเงื่อนไข");
  } catch (e: any) {
    console.error(e);
    message.error(e?.message || "โหลดข้อมูลนักเรียนล้มเหลว");
    setRows([]);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
const handleSave = async () => {
  if (!isEditing) return;

  if (!termId || !courseId || !teacherId) {
    message.warning("กรุณาเลือก วิชา / ครู / เทอม ให้ครบก่อนบันทึก");
    return;
  }
setLoading(true);
  try {
    const tasks = rows.map((r) => {
      // รวมคะแนนส่ง/เก็บให้เป็น point
      const point = (Number(r.collect) || 0) + (Number(r.work) || 0);
      const behavior = Number(r.behavior) || 0;
      const mid = Number(r.midterm) || 0;
      const fin = Number(r.final) || 0;

      const total = point + behavior + mid + fin;
      const grade = gradeFromTotal(total);

      // ถ้าแถวนี้ไม่มีการกรอกอะไรเลย และยังไม่เคยมี record — ข้ามไป (ไม่สร้างเปล่า)
      const hasAny =
        (r.collect ?? r.work ?? r.behavior ?? r.midterm ?? r.final) !== undefined;
      if (!hasAny && !r.recId) return Promise.resolve(null);

      const payload = {
        term_id: termId,
        course_id: courseId,
        teacher_id: teacherId,
        student_id: r.studentDbId,

        point,
        mid_point: mid,
        final_point: fin,
        grade_point: grade,
        behavior_point: behavior,
      };

      if (r.recId) {
        // UPDATE
        return EduRecordAPI.update(r.recId, {
          // สำหรับ UpdateEducationRecordReq เป็น pointer
          point,
          mid_point: mid,
          final_point: fin,
          grade_point: grade,
          behavior_point: behavior,
          teacher_id: teacherId, // เผื่ออัปเดตผู้สอนด้วย
        });
      } else {
        // CREATE
        return EduRecordAPI.create(payload);
      }
    });

   const results = await Promise.allSettled(tasks);

const ok = results.filter(r => r.status === "fulfilled").length;
const fail = results.filter(r => r.status === "rejected").length;

if (ok) message.success(`บันทึกสำเร็จ ${ok} รายการ`);
if (fail) message.error(`บันทึกล้มเหลว ${fail} รายการ`);


function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

for (const part of chunk(tasks, 20)) {              // ครั้งละ 20 รายการ
  await Promise.allSettled(part);

}


    message.success("บันทึกคะแนนสำเร็จ");
    setIsEditing(false);

    // เคลียร์ draft ของ key ปัจจุบัน (เพราะตอนนี้ข้อมูลจริงไปอยู่ backend แล้ว)
const gradeId = findGradeIdByYearRoom(gradeYear, gradeClass);
const draftKey = makeDraftKey({ termId, courseId, teacherId, gradeId });
clearDraft(draftKey);
    // reload เพื่อเอา recId ที่เพิ่งสร้างมาใช้ต่อ
    fetchStudents();
  } catch (e: any) {
    console.error(e);
    message.error(e?.message || "บันทึกคะแนนล้มเหลว");
  } finally {
    setLoading(false);
  }
};
const draftKey = makeDraftKey({ termId, courseId, teacherId});
  const columns = [
    { title: "ที่", dataIndex: "no", width: 50, align: "center" as const },
    {
      title: "รหัส",
      dataIndex: "id",
      width: 100,
      align: "center" as const,
      // คง UI เดิม: Input เล็กและ disabled แต่โชว์ค่า
      render: (v: string) => <Input size="small" value={v} disabled />,
    },
    {
      title: "ชื่อ - นามสกุล",
      dataIndex: "name",
      width: 200,
      render: (v: string) => <Input size="small" value={v} disabled />,
    },
    {
      title: "คะแนนเก็บ",
      dataIndex: "collect",
      width: 100,
      render: (_: any, record: Row) => (
        <Input
          size="small"
          type="number"
          min={0}
          max={100}
           disabled={!isEditing}            
           value={record.collect ?? ""}
        onChange={(e) =>
          updateCell(
            record.key,
            "collect",
            e.target.value === "" ? undefined : Number(e.target.value),
            draftKey
          )
        }
      />
    ),
  },
    {
      title: "คะแนนส่งงาน",
      dataIndex: "work",
      width: 120,
      render: (_: any, record: Row) => (
        <Input
          size="small"
          type="number"
               min={0}
          max={100}
          disabled={!isEditing}  
          value={record.work ?? ""}   
          onChange={(e) =>
            updateCell(
              record.key,
              "work",
              e.target.value === "" ? undefined : Number(e.target.value),
               draftKey 
            )
          }
        />
      ),
    },
    {
      title: "จิตพิสัย",
      dataIndex: "behavior",
      width: 100,
      render: (_: any, record: Row) => (
        <Input
          size="small"
          type="number"
               min={0}
          max={100}
           disabled={!isEditing}     
           value={record.behavior ?? ""} 
          onChange={(e) =>
            updateCell(
              record.key,
              "behavior",
              e.target.value === "" ? undefined : Number(e.target.value),
               draftKey 
            )
          }
        />
      ),
    },
    {
      title: "คะแนนกลางภาค",
      dataIndex: "midterm",
      width: 130,
      render: (_: any, record: Row) => (
        <Input
          size="small"
          type="number"
               min={0}
          max={100}
           disabled={!isEditing}     
           value={record.midterm ?? ""}
          onChange={(e) =>
            updateCell(
              record.key,
              "midterm",
              e.target.value === "" ? undefined : Number(e.target.value),
               draftKey 
            )
          }
        />
      ),
    },
    {
      title: "คะแนนปลายภาค",
      dataIndex: "final",
      width: 130,
      render: (_: any, record: Row) => (
        <Input
          size="small"
          type="number"
               min={0}
          max={100}
           disabled={!isEditing}     
           value={record.final ?? ""} 
          onChange={(e) =>
            updateCell(
              record.key,
              "final",
              e.target.value === "" ? undefined : Number(e.target.value),
               draftKey 
            )
          }
        />
      ),
    },
    {
      title: "รวมคะแนน 100",
      dataIndex: "total",
      width: 130,
      render: (v: number | undefined) => (
        <Input size="small" value={v ?? ""} disabled />
      ),
    },
    {
      title: "เกรด",
      dataIndex: "grade",
      width: 100,
      render: (v: number | undefined) => (
        <Input size="small" value={v ?? ""} disabled />
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* แถบตัวกรอง/ปุ่มต่าง ๆ — คงเลย์เอาต์เดิม */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 40,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >


       <SelectCourse
  value={courseId}
  onChange={(id) => setCourseId(id)}
/>

<SelectTeacher
  value={teacherId}
  onChange={setTeacherId}

/>
        <SelectTerm value={termId} onChange={(v: number) => setTermId(v)} />
        <SelectGrade value={gradeYear} onChange={(v: string) => setGradeYear(v)} />
        <SelectClass value={gradeClass} onChange={(v: string) => setGradeClass(v)} />
       <Button
  icon={<SearchOutlined />}
  onClick={fetchStudents}
  loading={loading}
  disabled={!gradeYear || !gradeClass}
/>
        <div style={{ marginLeft: "auto" }}>
       <Button
    icon={<EditOutlined />}
    type={isEditing ? "primary" : "default"}
    onClick={() => setIsEditing((v) => !v)}
    style={{ marginRight: 8 }}
  >
    {isEditing ? "กำลังแก้ไข" : "แก้ไข"}
  </Button>
 <Button type="primary" disabled={!isEditing} onClick={handleSave}>
  บันทึก
</Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={rows}
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        loading={loading}
      />
    </div>
  );
};

export default EnterScore;
