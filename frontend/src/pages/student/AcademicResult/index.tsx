import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, message, Empty, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import SelectTerm from "../../../components/SelectTerm";

import {
  AssignmentSubmitAPI_N as AssignSubmitAPI,
  EduRecordAPI,
  studentCRUD_SAFE as studentCRUD,
  getAuthTokenSafe,
  teacherCRUD_SAFE as teacherCRUD,
  courseCRUD_SAFE as courseCRUD, // ✅ เพิ่ม
} from "../../../services/https";

// ---------- utils ----------
const pickData = (res: any) => {
  const rd = res?.data ?? res;
  return rd?.data ?? rd;
};

function getCurrentUserIdSmart(): number | undefined {
  const keys = ["user_id", "users_id", "uid", "auth.user_id"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !isNaN(Number(v))) return Number(v);
  }
  const token = getAuthTokenSafe?.();
  if (!token || token.split(".").length !== 3) return undefined;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    const raw = json?.id ?? json?.user_id ?? json?.UserID ?? json?.sub;
    const num = Number(raw);
    return isNaN(num) ? undefined : num;
  } catch {
    return undefined;
  }
}

// ---- helper: ครู ----
const extractTeacherName = (o: any) => {
  if (!o) return "";
  const first =
    o?.t_first_name ?? o?.TFirst_Name ?? o?.first_name ?? o?.e_first_name ?? o?.EFirst_Name ?? "";
  const last =
    o?.t_last_name ?? o?.TLast_Name ?? o?.last_name ?? o?.e_last_name ?? o?.ELast_Name ?? "";
  return [first, last].filter(Boolean).join(" ").trim();
};
const extractTeacherCode = (o: any) => {
  if (!o) return "";
  return String(o?.teacher_id ?? o?.TeacherID ?? o?.Teacher_ID ?? o?.code ?? "").trim();
};

// ---- helper: วิชา ----
const extractCourseCode = (o: any) => {
  if (!o) return "";
  return String(o?.course_code ?? o?.Course_Code ?? "").trim();
};
const extractCourseName = (o: any) => {
  if (!o) return "";
  return String(o?.course_name ?? o?.Course_Name ?? o?.name ?? "").trim();
};
const buildCourseLabel = (fromRec?: any, fromApi?: any) => {
  const code = extractCourseCode(fromRec) || extractCourseCode(fromApi);
  const name = extractCourseName(fromRec) || extractCourseName(fromApi);
  if (code && name) return `${code} - ${name}`;
  return name || code || "";
};

type Row = {
  key: number;
  no: number;
  recId: number;
  term?: string;
  course?: string;         // ✅ แสดง "(รหัส) ชื่อวิชา"
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
  const [myStudentId, setMyStudentId] = useState<number | undefined>(undefined);

  // 1) resolve student.id ของผู้ใช้
  useEffect(() => {
    (async () => {
      try {
        const uid = getCurrentUserIdSmart();
        if (!uid) {
          message.error("ไม่พบผู้ใช้ที่ล็อกอิน");
          return;
        }
        const sRes = await studentCRUD.getByUserId(uid);
        let s = pickData(sRes);
        if (Array.isArray(s)) s = s[0] ?? null;
        const sid = Number(s?.id ?? s?.ID);
        if (!Number.isFinite(sid)) {
          message.warning("บัญชีนี้ยังไม่ผูกกับข้อมูลนักเรียน");
          return;
        }
        setMyStudentId(sid);
      } catch (e: any) {
        console.error(e);
        message.error(e?.message || "โหลดข้อมูลผู้ใช้ล้มเหลว");
      }
    })();
  }, []);

  // 2) compose แถว
  const composeRow = (rec: any, idx: number, workFromMap?: number, teacherInfo?: any, courseInfo?: any): Row => {
    // ครู
    const teacherFromRec = rec?.Teacher || rec?.teacher;
    const teacherName = extractTeacherName(teacherFromRec) || extractTeacherName(teacherInfo);
    const teacherCode = extractTeacherCode(teacherFromRec) || extractTeacherCode(teacherInfo);

    // วิชา
    const courseFromRec = rec?.Course || rec?.course;
    const courseLabel = buildCourseLabel(courseFromRec, courseInfo);

    // เทอม
    const termObj = rec?.Term || rec?.term || {};
    const termLabel =
      termObj?.name ??
      (termObj?.no && termObj?.academic_year ? `เทอม ${termObj.no}/${termObj.academic_year}` : undefined);

    // คะแนน
    const rawPoint = Number(rec?.point ?? 0);
    const behavior = Number(rec?.behavior_point ?? 0);
    const mid = Number(rec?.mid_point ?? 0);
    const fin = Number(rec?.final_point ?? 0);

    const workShown = workFromMap != null ? Number(workFromMap) : undefined;

    let collectShown: number | undefined;
    if (workShown !== undefined) {
      const inferred = rawPoint - workShown;
      collectShown = Number.isFinite(inferred) && inferred >= 0 ? inferred : undefined;
    } else {
      collectShown = rawPoint;
    }

    const caForTotal =
      collectShown !== undefined || workShown !== undefined
        ? Number(collectShown || 0) + Number(workShown || 0)
        : rawPoint;

    const total = caForTotal + behavior + mid + fin;

    const grade =
      rec?.grade_point !== undefined
        ? Number(rec.grade_point)
        : total >= 80 ? 4.0
        : total >= 75 ? 3.5
        : total >= 70 ? 3.0
        : total >= 65 ? 2.5
        : total >= 60 ? 2.0
        : total >= 55 ? 1.5
        : total >= 50 ? 1.0
        : 0.0;

    return {
      key: Number(rec.id ?? idx),
      no: idx + 1,
      recId: Number(rec.id ?? 0),
      term: termLabel,
      course: courseLabel,          // ✅ แสดง (รหัส) ชื่อวิชา
      teacherCode,
      teacherName,
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

  // 3) โหลดผลการเรียน + รวมคะแนนส่งงาน + เติมข้อมูลครู + เติมข้อมูลวิชา
  const fetchData = async () => {
    try {
      setLoading(true);

      if (!myStudentId) {
        setRows([]);
        return;
      }

      const recParams: any = { page_size: 10000, student_id: myStudentId };
      if (termId != null) recParams.term_id = termId;

      const recRes = await EduRecordAPI.list(recParams);
      const root = recRes?.data ?? recRes;
      const recs: any[] = Array.isArray(root?.data) ? root.data : Array.isArray(root) ? root : [];

      if (recs.length === 0) {
        setRows([]);
        message.info("ยังไม่มีบันทึกผลการเรียนสำหรับเงื่อนไขนี้");
        return;
      }

      // --- 3.1 รวมคะแนนส่งงาน (AssignmentSubmit) ---
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
      const workTasks = Array.from(pairs.entries()).map(async ([k, { term_id: tId, course_id: cId }]) => {
        try {
          const params: any = { student_id: myStudentId, page_size: 10000 };
          if (tId) params.term_id = tId;
          if (cId) params.course_id = cId;

          const sRes = await (AssignSubmitAPI as any).list(params);
          const sRoot = sRes?.data ?? sRes;
          const subs: any[] = Array.isArray(sRoot?.data) ? sRoot.data : Array.isArray(sRoot) ? sRoot : [];

          let sum = 0;
          for (const sub of subs) sum += takeSubmitScore(sub);
          workMap.set(k, sum);
        } catch {
          workMap.set(k, 0);
        }
      });

      // --- 3.2 เตรียมข้อมูลครู (ไม่ซ้ำ) ---
      const teacherIds = Array.from(
        new Set(
          recs
            .map((r) => Number(r?.teacher_id ?? r?.Teacher?.id ?? r?.teacher?.id))
            .filter((n) => Number.isFinite(n) && n > 0)
        )
      );
      const teacherMap = new Map<number, any>();
      const teacherTasks = teacherIds.map(async (tid) => {
        try {
          const tRes = await teacherCRUD.getNameById(tid);
          const tObj = pickData(tRes) ?? tRes?.data ?? tRes;
          if (tObj) teacherMap.set(tid, tObj);
        } catch {}
      });

      // --- 3.3 เตรียมข้อมูลวิชา (ไม่ซ้ำ) ---
      const courseIds = Array.from(
        new Set(
          recs
            .map((r) => Number(r?.course_id ?? r?.Course?.id ?? r?.course?.id))
            .filter((n) => Number.isFinite(n) && n > 0)
        )
      );
      const courseMap = new Map<number, any>();
      const courseTasks = courseIds.map(async (cid) => {
        try {
          const cRes = await courseCRUD.getById(cid);
          const cObj = pickData(cRes) ?? cRes?.data ?? cRes;
          if (cObj) courseMap.set(cid, cObj);
        } catch {}
      });

      await Promise.allSettled([...workTasks, ...teacherTasks, ...courseTasks]);

      // --- 3.4 map แถวพร้อม teacher/course info ---
      const mapped: Row[] = recs.map((rec: any, idx: number) => {
        const tId = Number(rec?.teacher_id ?? rec?.Teacher?.id ?? rec?.teacher?.id);
        const cId = Number(rec?.course_id ?? rec?.Course?.id ?? rec?.course?.id);
        const termIdX = Number(rec?.term_id ?? rec?.Term?.id);
        const courseIdX = Number(rec?.course_id ?? rec?.Course?.id);
        const k = keyOf(termIdX, courseIdX);

        const workFromAssign = workMap.get(k);
        const teacherInfo = Number.isFinite(tId) ? teacherMap.get(tId) : undefined;
        const courseInfo = Number.isFinite(cId) ? courseMap.get(cId) : undefined;

        return composeRow(rec, idx, workFromAssign, teacherInfo, courseInfo);
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, myStudentId]);

  const columns: ColumnsType<Row> = useMemo(
    () => [
      { title: "ที่", dataIndex: "no", width: 60, align: "center" },
      { title: "รหัสครู", dataIndex: "teacherCode", width: 120, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "ครู ผู้สอน", dataIndex: "teacherName", width: 200, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
      { title: "รายวิชา", dataIndex: "course", width: 260, render: (v) => <Input size="small" value={v ?? ""} disabled /> },
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, flexWrap: "wrap",marginTop: 20 }}>
        <SelectTerm
          value={termId}
          onChange={(v: any) => setTermId(typeof v === "object" ? v?.value : v)}
          allowClear
          placeholder="เลือกเทอมหรือดูทั้งหมด"
        />
        <Button
          icon={<SearchOutlined />}
          onClick={fetchData}
          loading={loading}
          type="primary"
          style={{ backgroundColor: "#f5f5f5", color: "#000", border: "1px solid #f5f5f5" }}
        />
      </div>

      <Table<Row>
        rowKey="recId"
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
