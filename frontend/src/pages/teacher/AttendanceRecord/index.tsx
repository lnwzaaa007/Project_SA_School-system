import React, { useState, useEffect } from "react"; 
import { useLocation } from "react-router-dom";
import { AttendancesAPI, gradeAPI } from "../../../services/https";
// import SelectGrade from "../../../components/SelectGrade";
// import SelectClass from "../../../components/SelectClass";
// import SelectCourse from "../../../components/SelectCourse";
import type { StudentInterface } from "../../../interfaces/Student";
import { Button, Card, Checkbox, Typography, Input, Table, message, Select, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import './index.css';

const { Text } = Typography;

type RowStudent = StudentInterface & {
  present: boolean;
  leave: boolean;
  absent: boolean;
  remark: string;
};

const initialStudents: RowStudent[] = [];

const AttendanceRecord: React.FC = () => {
  const { state } = useLocation() as { state?: any };
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [idschedule,setIdSchedule] = useState<number | null>(null);
  const [coursename,setCourseName] = useState<string | null>(null);
  const [students, setStudents] = useState<RowStudent[]>(initialStudents);
  const [historyDates, setHistoryDates] = useState<string[]>([]); // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loadingDates, setLoadingDates] = useState<boolean>(false);
  
  useEffect(() => {
    handleReset(); // ✅ เรียก reset ตอนเปิด component ครั้งแรก
  }, []);

  // อ่านค่าที่ถูกส่งมาจากหน้าตารางสอน (TeachingSchedule)
  useEffect(() => {
    if (!state) return;
    const gYear = state.grade_year !== undefined ? Number(state.grade_year) : null;
    const gClass = state.grade_class !== undefined ? Number(state.grade_class) : null;
    const CourseName = state.course_name !== undefined ? String(state.course_name): null;
    const IDschedule = state.id_schedule !== undefined ? Number(state.id_schedule): null; 
    if (!Number.isNaN(gYear )) setSelectedGrade(gYear);
    if (!Number.isNaN(gClass )) setSelectedClass(gClass);
    setCourseName(CourseName);
    setIdSchedule(IDschedule);
    // สามารถใช้ state.day, state.start_time, state.end_time, state.course_code, state.course_name ได้เช่นกัน
    // console.log("attendance state:", state);
  }, [state]);
  // console.log("gradseAttendance",selectedClass);
  // console.log("coursename",coursename);
  console.log("idschedule",idschedule);

  const handleStatusChange = (id: number, status: "present" | "leave" | "absent") => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              present: status === "present",
              leave: status === "leave",
              absent: status === "absent",
            }
          : student
      )
    );
  };

  // โหลดรายชื่อนักเรียนจาก API ตามชั้น/ห้อง
  const fetchStudents = async () => {
    try {
      if (selectedGrade == null || selectedClass == null) return;
      const res: any = await AttendancesAPI.getStudentByGrade(selectedGrade, selectedClass);
      const list = Array.isArray(res?.data) ? res.data : [];
      const mapped: RowStudent[] = list.map((s: any, idx: number) => ({
        ...(s as StudentInterface),
        id: Number(s?.id ?? s?.ID ?? idx + 1),
        present: false,
        leave: false,
        absent: false,
        remark: "",
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("โหลดรายชื่อนักเรียนล้มเหลว", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedGrade, selectedClass]);

  // helper: format a JS Date into YYYY-MM-DD at Asia/Bangkok timezone
  const toThaiYMD = (d: Date): string => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(d);
      const day = parts.find(p => p.type === 'day')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';
      // year is Gregorian, keep as YYYY
      return `${year}-${month}-${day}`;
    } catch {
      return d.toISOString().slice(0,10);
    }
  };

  // โหลดวันที่ที่เคยเช็กชื่อจาก schedule_id เพื่อแสดงใน Select
  const fetchHistoryDates = async () => {
    if (!idschedule) return;
    setLoadingDates(true);
    try {
      const res: any = await AttendancesAPI.getAttendanceTeacher(idschedule);
      const list: any[] = Array.isArray(res?.data) ? res.data : [];
      const dateSet = new Set<string>();
      for (const item of list) {
        const raw = (item?.Attendances_Date ?? item?.attendances_date ?? item?.date);
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          dateSet.add(toThaiYMD(d));
        }
      }
      setHistoryDates(Array.from(dateSet).sort((a,b)=> a.localeCompare(b)));
    } catch (e) {
      console.error('โหลดวันที่ประวัติล้มเหลว', e);
    } finally {
      setLoadingDates(false);
    }
  };

  // เมื่อ idschedule พร้อม ให้โหลดวันที่ประวัติที่มีอยู่
  useEffect(() => {
    if (idschedule) {
      fetchHistoryDates();
    }
  }, [idschedule]);

  // โหลดข้อมูลเช็กชื่อของวันที่ที่เลือกและ set ลง students
  const applyDateRecordsToStudents = (items: any[]) => {
    const statusByStudent = new Map<number, { statusId: number; note: string }>();
    for (const it of items) {
      const sid = Number(it?.student_id ?? it?.StudentID ?? it?.studentId);
      const st = Number(it?.attendance_status_id ?? it?.AttendanceStatusID ?? it?.attendanceStatusId);
      const note = String(it?.note ?? it?.Note ?? '');
      if (sid) statusByStudent.set(sid, { statusId: st, note });
    }
    setStudents(prev => prev.map(s => {
      const found = statusByStudent.get(Number(s.id));
      if (!found) return { ...s, present: false, leave: false, absent: false, remark: '' };
      return {
        ...s,
        present: found.statusId === 1,
        leave: found.statusId === 2,
        absent: found.statusId === 3,
        remark: found.note,
      };
    }));
  };
  //
  const loadBySelectedDate = async (ymd: string) => {
    if (!idschedule || !ymd) return;
    try {
      const res: any = await AttendancesAPI.getAttendanceByDate(idschedule, ymd);
      const items = Array.isArray(res?.items) ? res.items : [];
      applyDateRecordsToStudents(items);
    } catch (e) {
      console.error('ดึงข้อมูลตามวันที่ล้มเหลว', e);
    }
  };

  const handleOk = async () => {
    try {
      if (idschedule == null || selectedGrade == null || selectedClass == null) {
        messageApi.error("ข้อมูลคาบ/ชั้นเรียนไม่ครบถ้วน");
        console.log("idschedule",idschedule)
         console.log("selectedGrade",selectedGrade)
          console.log("selectedClass",selectedClass)
        return;
      }

      const teacherId = Number(localStorage.getItem("ID"));
      if (!teacherId || Number.isNaN(teacherId)) {
        messageApi.error("ไม่พบข้อมูลผู้สอน");
        return;
      }

      // ดึง grade_id จากปี/ห้อง
      const gradeRes: any = await gradeAPI.getGradeByYearAndClass(selectedGrade, String(selectedClass));
      const gradeId = Array.isArray(gradeRes) && gradeRes.length > 0 ? Number(gradeRes[0].id ?? gradeRes[0].ID) : undefined;
      if (!gradeId) {
        messageApi.error("ไม่พบรหัสชั้นเรียน (grade_id)");
        return;
      }

      const items = students
        .map((s) => {
          const statusId = s.present ? 1 : s.leave ? 2 : s.absent ? 3 : 0;
          if (!statusId) return null;
          return {
            student_id: s.id,
            attendance_status_id: statusId,
            note: s.remark || "",
          };
        })
        .filter(Boolean) as Array<{ student_id: number; attendance_status_id: number; note: string }>;

      if (items.length === 0) {
        messageApi.warning("กรุณาเลือกสถานะอย่างน้อย 1 คน");
        return;
      }

      const payload: any = {
        schedules_id: idschedule,
        teacher_id: teacherId,
        grade_id: gradeId,
        date: selectedDate ? selectedDate : new Date().toISOString(),
        items,
      };

      if (selectedDate) {
        // อัปเดตประวัติของวันที่ที่เลือก
        const res: any = await AttendancesAPI.updateAttendance(payload);
        if (res && res?.message) {
          messageApi.success("อัปเดตการเข้าเรียนสำเร็จ");
          // โหลดซ้ำข้อมูลของวันนั้น
          await loadBySelectedDate(selectedDate);
          await fetchHistoryDates();
        } else {
          const errMsg = res?.data?.error || "อัปเดตไม่สำเร็จ";
          messageApi.error(errMsg);
        }
      } else {
        // บันทึกใหม่สำหรับวันนี้
        const res: any = await AttendancesAPI.postAttendance(payload as any);
        if (res && (res.status === 200 || res.status === 201)) {
          messageApi.success("บันทึกการเข้าเรียนสำเร็จ");
          // รีเซ็ตสถานะหลังบันทึกสำเร็จ
          handleReset();
          await fetchHistoryDates();
        } else {
          const errMsg = res?.data?.error || "บันทึกไม่สำเร็จ";
          messageApi.error(errMsg);
        }
      }
    } catch (err) {
      console.error("บันทึกการเข้าเรียนล้มเหลว", err);
      messageApi.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };
  const handleRemarkChange = (id: number, remark: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id ? { ...student, remark } : student
      )
    );
  };

  const handleReset = () => {
    setStudents(prev =>
      prev.map(student => ({
        ...student,
        present: false,
        leave: false,
        absent: false,
        remark: "",
      }))
    );
    // รีเซ็ตการเลือกวัน
    // setSelectedDate(null);
  };

  const summary = students.reduce(
    (acc, s) => {
      if (s.present) acc.present++;
      if (s.leave) acc.leave++;
      if (s.absent) acc.absent++;
      return acc;
    },
    { present: 0, leave: 0, absent: 0 }
  );

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: "center" as const,
    },
    {
      title: "ชื่อ-นามสกุล",
      key: "full_name",
      render: (_: any, record: RowStudent) => (
        <span>{`${record.t_first_name ?? ''} ${record.t_last_name ?? ''}`.trim()}</span>
      ),
    },
    {
      title: "มา",
      key: "present",
      align: "center" as const,
      width: 60,
      render: (_: any, record: RowStudent) => (
        <Checkbox
          checked={record.present}
          onChange={() => handleStatusChange(record.id, "present")}
          style={{
            backgroundColor: record.present ? "#B7E4C7" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "ลา",
      key: "leave",
      align: "center" as const,
      width: 60,
      render: (_: any, record: RowStudent) => (
        <Checkbox
          checked={record.leave}
          onChange={() => handleStatusChange(record.id, "leave")}
          style={{
            backgroundColor: record.leave ? "#FFE066" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "ขาด",
      key: "absent",
      align: "center" as const,
      width: 60,
      render: (_: any, record: RowStudent) => (
        <Checkbox
          checked={record.absent}
          onChange={() => handleStatusChange(record.id, "absent")}
          style={{
            backgroundColor: record.absent ? "#FF6B6B" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "remark",
      key: "remark",
      width: 600,
      align: "center" as const,
      render: (_: any, record: RowStudent) => (
        <Input
          // style={{width:"600px"}}
          placeholder="ระบุเหตุผล"
          value={record.remark}
          onChange={(e) => handleRemarkChange(record.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
       <div
    className="attendance-font"
      style={{
        minHeight: "100vh",
        // background: "#F1EEE0",
        display: "flex",
        justifyContent: "center",
        

      }}
    >
      <Card 
      style={{ width: "100%", border: "none", boxShadow: "none" }} 
      bodyStyle={{ padding: "24px" }}>
        {/* Filter Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // 👈 ดันซ้าย-ขวา
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* ซ้าย: ชื่อวิชา */}
          <div style={{ fontSize: "32px" }}>
            วิชา: {coursename}
          </div>

          {/* ขวา: ประวัติการเช็คชื่อ */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 25 }}>ประวัติการเช็คชื่อ:</Text>
            <div style={{ minWidth: 220 }}>
              {loadingDates ? (
                <Spin size="small" />
              ) : (
                <Select
                  allowClear
                  placeholder="เลือกวันที่"
                  style={{ width: 220 }}
                  value={selectedDate ?? undefined}
                  onChange={async (v) => {
                    const ymd = (v ?? null) as string | null;
                    setSelectedDate(ymd);
                    if (ymd) {
                      await loadBySelectedDate(ymd);
                    } else {
                      handleReset();
                    }
                  }}
                  options={historyDates.map(d => ({ value: d, label: d }))}
                />
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ marginTop: 32, }}>
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={false}
            bordered
          />

          {/* Summary */}
          <div
            style={{
              // background: "#D7EDFF",
              marginTop: 24,
              padding: "16px 24px",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: "16px",
              justifyContent:"life"
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <div
                style={{
                  backgroundColor: "#B7E4C7", // เขียว - มา
                  padding: "12px 24px",
                  borderRadius: 8,
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                มา {summary.present}
              </div>
              <div
                style={{
                  backgroundColor: "#FFE066", // เหลือง - ลา
                  padding: "12px 24px",
                  borderRadius: 8,
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                ลา {summary.leave}
              </div>
                <div
                  style={{
                    backgroundColor: "#FF6B6B", // แดง - ขาด
                    padding: "12px 24px",
                    borderRadius: 8,
                    minWidth: 100,
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  ขาด {summary.absent}
              </div>
              </div>
            </div>


          {/* Confirm & Reset Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
              width: "100%",
              height: "40px",
              gap: 12,
            }}
          >
            <Button type="primary" style={{ width: "100px", height: "100%" }}
              onClick={handleOk}
              >
              บันทึก
            </Button>
            <Button style={{ width: "100px", height: "100%" }} onClick={handleReset}>
              รีเซ็ต
            </Button>
          </div>
        </div>
      </Card>
    </div>
    </>
   
  );
};

export default AttendanceRecord;
