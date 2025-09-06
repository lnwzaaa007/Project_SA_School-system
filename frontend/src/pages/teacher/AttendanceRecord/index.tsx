import React, { useState, useEffect } from "react"; 
import { useLocation } from "react-router-dom";
import { AttendancesAPI, gradeAPI } from "../../../services/https";
// import SelectGrade from "../../../components/SelectGrade";
// import SelectClass from "../../../components/SelectClass";
// import SelectCourse from "../../../components/SelectCourse";
import type { StudentInterface } from "../../../interfaces/Student";
import { Button, Card, Checkbox, Typography, Input, Table, message } from "antd";
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

      const payload = {
        schedules_id: idschedule,
        teacher_id: teacherId,
        grade_id: gradeId,
        date: new Date().toISOString(),
        items,
      };

      const res: any = await AttendancesAPI.postAttendance(payload as any);
      if (res && (res.status === 200 || res.status === 201)) {
        messageApi.success("บันทึกการเข้าเรียนสำเร็จ");
        // รีเซ็ตสถานะหลังบันทึกสำเร็จ
        handleReset();
      } else {
        const errMsg = res?.data?.error || "บันทึกไม่สำเร็จ";
        messageApi.error(errMsg);
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
            flexWrap: "wrap",
            gap: "5px",
            alignItems: "center",
             marginLeft:"50px",
            fontSize:"32px",
          }}
        >
          วิชา: {coursename}
          {/* <SelectGrade value={selectedGrade} onChange={setSelectedGrade}/>
          <SelectClass value={selectedClass} onChange={setSelectedClass}/> */}
          {/* <SelectCourse /> */}
          <div
            style={{
              justifyContent: "end",
              display: "flex",
              width: "50px",
              height: "40px",
             
            }}
          >
            
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