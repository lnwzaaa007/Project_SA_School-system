import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, message, Typography, Empty, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EduRecordAPI,
  studentCRUD,
  AssignmentSubmitAPI_N as AssignSubmitAPI,
} from "../../../services/https";
import SelectTerm from "../../../components/SelectTerm";
import { SearchOutlined } from "@ant-design/icons";
import { Get } from "../../../services/https";
const { Title } = Typography;
import { StudentEduRecordAPI_N } from "../../../services/https";

function getCurrentUserId(): number | undefined {
  const keys = ["user_id", "users_id", "uid", "auth.user_id"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (!v) continue;
    const n = Number(v);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return undefined;
}

function pickPayload<T = any>(res: any): T {
  if (!res) return [] as unknown as T;
  const root = res?.data !== undefined ? res.data : res;
  return (Array.isArray(root?.data) || typeof root?.data === "object") ? root.data : root;
}

async function fetchStudentByUser(userId: number): Promise<any | null> {
  // 1) ใช้ endpoint ตรง ๆ ก่อน: GET /students/:user_id
  try {
    const r = await (studentCRUD as any).getByUserId(userId);
    const d = pickPayload<any>(r);
    // รองรับทั้งแบบ object ตรง ๆ และแบบ array
    if (d?.id) return d;
    if (Array.isArray(d) && d[0]?.id) return d[0];
  } catch (e) {}

  // 2) fallback (กรณีไม่มี getByUserId จริง ๆ)
  try {
    const r = await (studentCRUD as any).list?.({ q: String(userId), page_size: 1 });
    const d = pickPayload<any>(r);
    const arr = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
    if (arr.length > 0) return arr[0];
  } catch (e) {}

  return null;
}



type Row = {
  key: number;
  no: number;
  recId: number;
  term?: string;
  course?: string;
  teacherCode?: string;
  teacherName?: string;
  collect_point?: number;
  work_point?: number;
  point?: number;
  behavior_point?: number;
  mid_point?: number;
  final_point?: number;
  total?: number;
  grade_point?: number;
};

const takeSubmitScore = (sub: any): number => {
  const cand = [sub?.score, sub?.point, sub?.work_point, sub?.assignment_point, sub?.mark, sub?.grade];
  for (const v of cand) {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
};

const AcademicResult: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [termId, setTermId] = useState<number | undefined>(undefined);

  const composeRow = (rec: any, idx: number, workFromMap?: number): Row => {
    const tObj = rec?.Teacher || rec?.teacher || {};
    const teacherCode =
      tObj?.teacher_id ?? tObj?.code ?? rec?.teacher_code ?? String(rec?.teacher_id ?? "");
    const teacherName = [tObj?.t_first_name ?? tObj?.first_name, tObj?.t_last_name ?? tObj?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const cObj = rec?.Course || rec?.course || {};
    const courseName = cObj?.course_name ?? cObj?.name ?? rec?.course_name ?? String(rec?.course_id ?? "");

    const termObj = rec?.Term || rec?.term || {};
    const termLabel =
      termObj?.name ??
      (termObj?.no && termObj?.academic_year
        ? `เทอม ${termObj.no}/${termObj.academic_year}`
        : undefined);

    const rawPoint = Number(rec?.point ?? 0);
    const collectRaw = rec?.collect_point;
    const workRaw = rec?.work_point;

    const behavior = Number(rec?.behavior_point ?? 0);
    const mid = Number(rec?.mid_point ?? 0);
    const fin = Number(rec?.final_point ?? 0);

    const workShown =
      (workRaw !== undefined && workRaw !== null) ? Number(workRaw)
      : (workFromMap !== undefined ? Number(workFromMap) : undefined);

    let collectShown: number | undefined;
    if (collectRaw !== undefined && collectRaw !== null) {
      collectShown = Number(collectRaw);
    } else if (workShown !== undefined) {
      const inferred = rawPoint - Number(workShown);
      collectShown = Number.isFinite(inferred) && inferred >= 0 ? inferred : undefined;
    } else {
      collectShown = rawPoint;
    }

    const caForTotal =
      collectShown !== undefined || workShown !== undefined
        ? (Number(collectShown || 0) + Number(workShown || 0))
        : rawPoint;

    const total = caForTotal + behavior + mid + fin;

    const grade =
      rec?.grade_point !== undefined
        ? Number(rec.grade_point)
        : (() => {
            if (total >= 80) return 4.0;
            if (total >= 75) return 3.5;
            if (total >= 70) return 3.0;
            if (total >= 65) return 2.5;
            if (total >= 60) return 2.0;
            if (total >= 55) return 1.5;
            if (total >= 50) return 1.0;
            return 0.0;
          })();

    return {
      key: Number(rec.id ?? idx),
      no: idx + 1,
      recId: Number(rec.id ?? 0),
      term: termLabel,
      course: String(courseName || ""),
      teacherCode: String(teacherCode || ""),
      teacherName: teacherName || "",
      collect_point: collectShown,
      work_point: workShown,
      point: rawPoint,
      behavior_point: behavior,
      mid_point: mid,
      final_point: fin,
      total,
      grade_point: grade,
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const userId = getCurrentUserId();
      if (!userId) {
        message.error("ไม่พบ UserId ผู้ใช้ปัจจุบัน (กรุณาเข้าสู่ระบบใหม่)");
        setRows([]);
        return;
      }

      const student = await fetchStudentByUser(userId);
      if (!student?.id) {
        message.error("ไม่พบนักเรียนที่ผูกกับบัญชีผู้ใช้นี้");
        setRows([]);
        return;
      }
      const studentId = Number(student.id);

     const recParamsStudent: any = { page_size: 10000 };
if (termId != null) recParamsStudent.term_id = termId;

let recs: any[] = [];
try {
  const recResStudent = await StudentEduRecordAPI_N.list(recParamsStudent);
  const rootStudent = pickPayload<any>(recResStudent);
  recs = Array.isArray(rootStudent?.data) ? rootStudent.data
       : Array.isArray(rootStudent)       ? rootStudent
       : [];
} catch { /* เงียบไว้ แล้วเดี๋ยว fallback */ }

// ----- 2) Fallback: ถ้ายังว่าง ค่อยยิงฝั่งครูด้วย student_id -----
if (recs.length === 0) {
  const recParamsTeacher: any = { student_id: studentId, page_size: 10000 };
  if (termId != null) recParamsTeacher.term_id = termId;

  const recResTeacher = await EduRecordAPI.list(recParamsTeacher);
  const rootTeacher = pickPayload<any>(recResTeacher);
  recs = Array.isArray(rootTeacher?.data) ? rootTeacher.data
       : Array.isArray(rootTeacher)       ? rootTeacher
       : [];
}

if (recs.length === 0) {
  setRows([]);
  message.info("ยังไม่มีบันทึกผลการเรียนสำหรับเงื่อนไขนี้");
  return;
}
      const keyOf = (termIdX: number | string | undefined, courseIdX: number | string | undefined) =>
        `${termIdX ?? "term"}:${courseIdX ?? "course"}`;

      const pairs = new Map<string, { term_id?: number; course_id?: number }>();
      for (const r of recs) {
        const termIdX = Number(r?.term_id ?? r?.Term?.id);
        const courseIdX = Number(r?.course_id ?? r?.Course?.id);
        const k = keyOf(termIdX, courseIdX);
        if (!pairs.has(k)) {
          pairs.set(k, {
            term_id: Number.isFinite(termIdX) && termIdX > 0 ? termIdX : undefined,
            course_id: Number.isFinite(courseIdX) && courseIdX > 0 ? courseIdX : undefined,
          });
        }
      }

      const workMap = new Map<string, number>();
      const tasks = Array.from(pairs.entries()).map(async ([k, { term_id: tId, course_id: cId }]) => {
        try {
          const params: any = { student_id: studentId, page_size: 10000 };
          if (tId) params.term_id = tId;
          if (cId) params.course_id = cId;

          const sRes = await (AssignSubmitAPI as any).list(params);
          const sRoot = pickPayload<any>(sRes);
          const subs: any[] = Array.isArray(sRoot?.data) ? sRoot.data : Array.isArray(sRoot) ? sRoot : [];

          let sum = 0;
          for (const sub of subs) sum += takeSubmitScore(sub);
          workMap.set(k, sum);
        } catch (err) {
          console.warn("fetch submits failed for", k, err);
          workMap.set(k, 0);
        }
      });
      await Promise.allSettled(tasks);

      const mapped: Row[] = recs.map((rec: any, idx: number) => {
        const termIdX = Number(rec?.term_id ?? rec?.Term?.id);
        const courseIdX = Number(rec?.course_id ?? rec?.Course?.id);
        const k = keyOf(termIdX, courseIdX);
        const workFromAssign = workMap.get(k);
        return composeRow(rec, idx, workFromAssign);
      });

      setRows(mapped);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก (แสดงทั้งหมดหรือเทอมล่าสุดตาม backend)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<Row> = useMemo(
    () => [
      { title: "ที่", dataIndex: "no", width: 60, align: "center" },
      { title: "รหัสครู", dataIndex: "teacherCode", width: 120, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "ชื่อ - นามสกุลครู", dataIndex: "teacherName", width: 200, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "วิชา", dataIndex: "course", width: 200, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
      {
        title: <Tooltip title="คะแนนเก็บ (ถ้า backend ยังไม่แยก อาจเท่ากับ point รวม)">คะแนนเก็บ</Tooltip>,
        dataIndex: "collect_point",
        width: 110,
        render: (v?: number) => <Input size="small" value={v ?? ""} disabled />,
      },
      {
        title: <Tooltip title="คะแนนส่งงาน (รวมจาก AssignmentSubmit ของวิชานั้น ๆ)">คะแนนส่งงาน</Tooltip>,
        dataIndex: "work_point",
        width: 120,
        render: (v?: number) => <Input size="small" value={v ?? ""} disabled />,
      },
      { title: "จิตพิสัย", dataIndex: "behavior_point", width: 110, render: (v?: number) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "กลางภาค", dataIndex: "mid_point", width: 110, render: (v?: number) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "ปลายภาค", dataIndex: "final_point", width: 110, render: (v?: number) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "รวม (100)", dataIndex: "total", width: 110, render: (v?: number) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "เกรด", dataIndex: "grade_point", width: 90, render: (v?: number) => <Input size="small" value={v ?? ""} disabled /> },
    ],
    []
  );

  
  return (
    <div style={{ padding: 20 }}>
      {/* แถบหัวเรื่อง + ตัวกรอง + ปุ่มค้นหา */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {/* <Title level={4} style={{ margin: 0 }}>ผลการเรียนของฉัน</Title> */}

        <SelectTerm
          value={termId}
          onChange={(v: number | undefined) => setTermId(v)}
          // ถ้า SelectTerm ของคุณรองรับ allowClear ให้เปิดเพื่อ "ล้างตัวกรอง"
          // allowClear
        />
        <Button
  icon={<SearchOutlined />}
  onClick={fetchData}
  loading={loading}
  type="primary"
  style={{
  backgroundColor: "#f5f5f5",
  color: "#000",
  border: "1px solid #f5f5f5"
}}
  disabled={termId == null}
>
</Button>
      </div>

      <Table<Row>
        columns={columns}
        dataSource={rows}
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        loading={loading}
        locale={{ emptyText: <Empty description="ไม่มีข้อมูลผลการเรียน" /> }}
      />
    </div>
  );
};

export default AcademicResult;
