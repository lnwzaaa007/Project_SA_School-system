// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Table, Button, Tag, Input, Modal } from "antd";
// import axios from "axios";

// type StudentItem = {
//   id: number;
//   name: string;
//   file: string;
//   status: string;
//   score: string | null;
// };

// type HomeworkItem = {
//   id: number;
//   subject: string;
//   title: string;
//   description: string;
//   openDate: string;
//   closeDate: string;
// };

// const statusMap: Record<string, { color: string; text: string }> = {
//   pending: { color: "orange", text: "รอตรวจ" },
//   checked: { color: "green", text: "ตรวจแล้ว" },
// };

// const CheckHomework: React.FC = () => {
//   const { homeworkId } = useParams();

//   const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
//   const [studentList, setStudentList] = useState<StudentItem[]>([]);
//   const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
//   const [score, setScore] = useState<string>("");

//   // เปิด modal ตรวจงาน
//   const handleCheck = (id: number) => {
//     setSelectedStudent(id);
//     setScore("");
//   };

//   // บันทึกคะแนนและสถานะ
//   const handleSubmitScore = () => {
//     setStudentList((prev) =>
//       prev.map((stu) =>
//         stu.id === selectedStudent
//           ? { ...stu, status: "checked", score }
//           : stu
//       )
//     );
//     setSelectedStudent(null);
//     setScore("");
//     Modal.success({ content: "บันทึกคะแนนเรียบร้อยแล้ว!" });
//   };

//   // ตารางคอลัมน์
//   const columns = [
//     { title: "ลำดับที่", dataIndex: "id", key: "id", align: "center" as const },
//     { title: "ชื่อ", dataIndex: "name", key: "name", align: "center" as const },
//     {
//       title: "ไฟล์แนบ",
//       dataIndex: "file",
//       key: "file",
//       align: "center" as const,
//       render: (file: string) => (
//         <a href={`/uploads/${file}`} target="_blank" rel="noopener noreferrer">
//           {file}
//         </a>
//       ),
//     },
//     {
//       title: "สถานะ",
//       dataIndex: "status",
//       key: "status",
//       align: "center" as const,
//       render: (status: string) => (
//         <Tag color={statusMap[status]?.color || "default"}>
//           {statusMap[status]?.text || status}
//         </Tag>
//       ),
//     },
//     {
//       title: "คะแนน",
//       dataIndex: "score",
//       key: "score",
//       align: "center" as const,
//       render: (score: string | null) => (score ? score : "-"),
//     },
//     {
//       title: "",
//       key: "action",
//       align: "center" as const,
//       render: (_: any, record: StudentItem) =>
//         record.status === "pending" ? (
//           <Button type="primary" onClick={() => handleCheck(record.id)}>
//             ตรวจงาน
//           </Button>
//         ) : (
//           <Tag color="green">ตรวจแล้ว</Tag>
//         ),
//     },
//   ];

//   const student = studentList.find((stu) => stu.id === selectedStudent);

//   // ✅ โหลดการบ้าน (ของครู) จาก backend
//   const fetchAssignments = async () => {
//     try {
//       const teacher_id = Number(localStorage.getItem("ID"));
//       if (!teacher_id) {
//         console.error("❌ ไม่พบ teacher_id ใน localStorage");
//         return;
//       }

//       const res = await axios.get(
//         `http://localhost:8088/assignments/${teacher_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       // backend คืน {"data": [...]} → ต้องใช้ res.data.data
//       const list: HomeworkItem[] = res.data.data.map((item: any) => ({
//         id: item.ID,
//         subject: item.course_id,
//         title: item.assignment_title,
//         description: item.description,
//         openDate: item.time_start,
//         closeDate: item.time_end,
//       }));
//       setHomeworks(list);

//       // ✅ ตัวอย่าง: ดึงรายชื่อนักเรียนที่ส่งงาน
//       // 👉 ปรับเป็น endpoint จริงเมื่อ backend พร้อม
//       const dummy: StudentItem[] = [
//         {
//           id: 1,
//           name: "สมชาย ใจดี",
//           file: "homework1.pdf",
//           status: "pending",
//           score: null,
//         },
//         {
//           id: 2,
//           name: "สุดา สวยงาม",
//           file: "homework2.pdf",
//           status: "pending",
//           score: null,
//         },
//       ];
//       setStudentList(dummy);
//     } catch (err) {
//       console.error("❌ โหลดการบ้านล้มเหลว:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAssignments();
//   }, []);

//   return (
//     <div style={{ padding: 32 }}>
//       <h2>ตรวจงานการบ้าน {homeworkId}</h2>
//       <Table
//         columns={columns}
//         dataSource={studentList}
//         pagination={false}
//         rowKey="id"
//         bordered
//       />

//       <Modal
//         open={selectedStudent !== null}
//         title={`ตรวจงาน: ${student?.name}`}
//         onCancel={() => setSelectedStudent(null)}
//         onOk={handleSubmitScore}
//         okText="บันทึกคะแนน"
//         cancelText="ยกเลิก"
//       >
//         {student && (
//           <div>
//             <div>
//               <strong>ไฟล์ที่ส่ง:</strong>{" "}
//               <a
//                 href={`/uploads/${student.file}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 {student.file}
//               </a>
//             </div>
//             <div style={{ marginTop: 16 }}>
//               <strong>ให้คะแนน:</strong>
//               <Input
//                 style={{ width: 120, marginLeft: 8 }}
//                 value={score}
//                 onChange={(e) => setScore(e.target.value)}
//                 placeholder="กรอกคะแนน"
//                 type="number"
//                 min={0}
//                 max={10}
//               />
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default CheckHomework;
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Tag, Input, Modal, message, Tabs, Spin, Select } from "antd";
import axios from "axios";

type StudentItem = {
  id: number; // submission ID
  studentId: number;
  name: string;
  file: string;
  status: string; // local: 'pending' | 'checked'
  score: number | null;
};

type CourseItem = {
  id: number;
  name: string;
};

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "orange", text: "รอตรวจ" },
  checked: { color: "green", text: "ตรวจแล้ว" },
};

const CheckHomework: React.FC = () => {
  const { id: routeId } = useParams(); // ใช้เป็นค่าเริ่มต้นของ course id ถ้ามี
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [studentList, setStudentList] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [score, setScore] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filterStudentId, setFilterStudentId] = useState<number | null>(null);

  // ✅ เปิด modal ตรวจงาน
  const handleCheck = (studentId: number) => {
    setSelectedStudent(studentId);
    setScore("");
  };

  // ✅ บันทึกคะแนนและสถานะ
  const handleSubmitScore = async () => {
    if (!selectedStudent) return;

    try {
      await axios.put(
        `http://localhost:8088/submissions/${selectedStudent}/score`,
        { score: Number(score) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // อัปเดตใน state ทันที
      setStudentList((prev) =>
        prev.map((stu) =>
          stu.id === selectedStudent
            ? { ...stu, status: "checked", score: Number(score) }
            : stu
        )
      );

      Modal.success({ content: "บันทึกคะแนนเรียบร้อยแล้ว!" });
      setSelectedStudent(null);
      setScore("");
    } catch (err) {
      console.error("❌ บันทึกคะแนนล้มเหลว:", err);
      message.error("บันทึกคะแนนล้มเหลว");
    }
  };

  // ✅ โหลดรายวิชาของครู
  const fetchCourses = async () => {
    try {
      const teacherId = localStorage.getItem("ID");
      if (!teacherId) {
        message.error("ไม่พบข้อมูลครู (ID)");
        return;
      }
      const res = await axios.get(
        `http://localhost:8088/courses/teacher/${teacherId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const list: CourseItem[] = (res.data?.data || []).map((c: any) => ({
        id: c.ID,
        name: c.course_name,
      }));
      setCourses(list);
      // ตั้งค่าแท็บเริ่มต้น: จาก route หรือ course แรก
      const initialId = Number(routeId) || (list[0]?.id ?? null);
      setActiveCourseId(initialId || null);
    } catch (err) {
      console.error("❌ โหลดรายวิชาล้มเหลว:", err);
      message.error("โหลดรายวิชาล้มเหลว");
    }
  };

  // ✅ โหลดข้อมูลนักเรียนที่ส่งงานของรายวิชา
  const fetchStudentSubmissions = async (courseId: number, studentId?: number | null) => {
    if (!courseId) return;

    try {
      setLoading(true);
      const url = `http://localhost:8088/assignments/submissions/${courseId}` + (studentId ? `?student_id=${studentId}` : "");
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      const list: StudentItem[] = (res.data?.data || []).map((item: any) => {
        const score = item.submit_Point ?? item.submit_point ?? null;
        const first = item.Student?.first_name || item.student?.first_name || "";
        const last = item.Student?.last_name || item.student?.last_name || "";
        const isChecked = item.submit_status === "Success" || item.submit_status === "สำเร็จ" || score !== null; // กันเหนียวเรื่องข้อความสถานะ
        return {
          id: item.ID, // ใช้ submission ID สำหรับอัปเดตคะแนน
          studentId: item.student_id || item.StudentID || 0,
          name: `${first} ${last}`.trim(),
          file: item.assignment_file,
          status: isChecked ? "checked" : "pending",
          score: score,
        };
      });

      setStudentList(list);
    } catch (err) {
      console.error("❌ โหลดข้อมูลนักเรียนล้มเหลว:", err);
      message.error("โหลดข้อมูลนักเรียนล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCourseId) fetchStudentSubmissions(activeCourseId, filterStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourseId, filterStudentId]);

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      align: "center" as const,
      render: (_: any, __: StudentItem, index: number) => index + 1,
    },
    { title: "ชื่อ", dataIndex: "name", key: "name", align: "center" as const },
    {
      title: "ไฟล์แนบ",
      dataIndex: "file",
      key: "file",
      align: "center" as const,
      render: (file: string) => (
        <a href={`http://localhost:8088/${file}`} target="_blank" rel="noreferrer">
          {file}
        </a>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: "คะแนน",
      dataIndex: "score",
      key: "score",
      align: "center" as const,
      render: (score: number | null) => (score !== null ? score : "-"),
    },
    {
      title: "",
      key: "action",
      align: "center" as const,
      render: (_: any, record: StudentItem) =>
        record.status === "pending" ? (
          <Button type="primary" onClick={() => handleCheck(record.id)}>
            ตรวจงาน
          </Button>
        ) : (
          <Tag color="green">ตรวจแล้ว</Tag>
        ),
    },
  ];

  const student = useMemo(
    () => studentList.find((s) => s.id === selectedStudent),
    [studentList, selectedStudent]
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>ตรวจการบ้าน แยกตามวิชา</h2>

      <div style={{ marginBottom: 16 }}>
        {courses.length === 0 ? (
          <div>ไม่พบรายวิชาของครู</div>
        ) : (
          <Tabs
            activeKey={activeCourseId ? String(activeCourseId) : undefined}
            onChange={(key) => setActiveCourseId(Number(key))}
            items={courses.map((c) => ({ key: String(c.id), label: c.name }))}
          />
        )}
      </div>

      <div style={{ marginBottom: 16, maxWidth: 360 }}>
        <Select
          allowClear
          placeholder="กรองตามนักเรียนในวิชานี้"
          value={filterStudentId as any}
          onChange={(val) => setFilterStudentId(val ?? null)}
          style={{ width: "100%" }}
          options={Array.from(
            new Map(studentList.map((s) => [s.studentId, { value: s.studentId, label: s.name }])).values()
          )}
        />
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={studentList}
          pagination={false}
          rowKey="id"
          bordered
        />
      </Spin>

      <Modal
        open={selectedStudent !== null}
        title={`ตรวจงาน: ${student?.name}`}
        onCancel={() => setSelectedStudent(null)}
        onOk={handleSubmitScore}
        okText="บันทึกคะแนน"
        cancelText="ยกเลิก"
      >
        {student && (
          <>
            <div>
              <strong>ไฟล์ที่ส่ง:</strong>{" "}
              <a
                href={`http://localhost:8088/${student.file}`}
                target="_blank"
                rel="noreferrer"
              >
                {student.file}
              </a>
            </div>
            <div style={{ marginTop: 16 }}>
              <strong>ให้คะแนน:</strong>
              <Input
                style={{ width: 120, marginLeft: 8 }}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="กรอกคะแนน"
                type="number"
                min={0}
                max={100}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CheckHomework;
