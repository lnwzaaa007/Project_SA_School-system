import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Tag, Input, Modal } from "antd";
import axios from "axios";

type StudentItem = {
  id: number;
  name: string;
  file: string;
  status: string;
  score: string | null;
};

type HomeworkItem = {
  id: number;
  subject: string;
  title: string;
  description: string;
  openDate: string;
  closeDate: string;
};

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "orange", text: "รอตรวจ" },
  checked: { color: "green", text: "ตรวจแล้ว" },
};

const CheckHomework: React.FC = () => {
  const { homeworkId } = useParams();

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [studentList, setStudentList] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [score, setScore] = useState<string>("");

  // เปิด modal ตรวจงาน
  const handleCheck = (id: number) => {
    setSelectedStudent(id);
    setScore("");
  };

  // บันทึกคะแนนและสถานะ
  const handleSubmitScore = () => {
    setStudentList((prev) =>
      prev.map((stu) =>
        stu.id === selectedStudent
          ? { ...stu, status: "checked", score }
          : stu
      )
    );
    setSelectedStudent(null);
    setScore("");
    Modal.success({ content: "บันทึกคะแนนเรียบร้อยแล้ว!" });
  };

  // ตารางคอลัมน์
  const columns = [
    { title: "ลำดับที่", dataIndex: "id", key: "id", align: "center" as const },
    { title: "ชื่อ", dataIndex: "name", key: "name", align: "center" as const },
    {
      title: "ไฟล์แนบ",
      dataIndex: "file",
      key: "file",
      align: "center" as const,
      render: (file: string) => (
        <a href={`/uploads/${file}`} target="_blank" rel="noopener noreferrer">
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
      render: (score: string | null) => (score ? score : "-"),
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

  const student = studentList.find((stu) => stu.id === selectedStudent);

  // ✅ โหลดการบ้าน (ของครู) จาก backend
  const fetchAssignments = async () => {
    try {
      const teacher_id = Number(localStorage.getItem("ID"));
      if (!teacher_id) {
        console.error("❌ ไม่พบ teacher_id ใน localStorage");
        return;
      }

      const res = await axios.get(
        `http://localhost:8088/assignments/${teacher_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // backend คืน {"data": [...]} → ต้องใช้ res.data.data
      const list: HomeworkItem[] = res.data.data.map((item: any) => ({
        id: item.ID,
        subject: item.course_id,
        title: item.assignment_title,
        description: item.description,
        openDate: item.time_start,
        closeDate: item.time_end,
      }));
      setHomeworks(list);

      // ✅ ตัวอย่าง: ดึงรายชื่อนักเรียนที่ส่งงาน
      // 👉 ปรับเป็น endpoint จริงเมื่อ backend พร้อม
      const dummy: StudentItem[] = [
        {
          id: 1,
          name: "สมชาย ใจดี",
          file: "homework1.pdf",
          status: "pending",
          score: null,
        },
        {
          id: 2,
          name: "สุดา สวยงาม",
          file: "homework2.pdf",
          status: "pending",
          score: null,
        },
      ];
      setStudentList(dummy);
    } catch (err) {
      console.error("❌ โหลดการบ้านล้มเหลว:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>ตรวจงานการบ้าน {homeworkId}</h2>
      <Table
        columns={columns}
        dataSource={studentList}
        pagination={false}
        rowKey="id"
        bordered
      />

      <Modal
        open={selectedStudent !== null}
        title={`ตรวจงาน: ${student?.name}`}
        onCancel={() => setSelectedStudent(null)}
        onOk={handleSubmitScore}
        okText="บันทึกคะแนน"
        cancelText="ยกเลิก"
      >
        {student && (
          <div>
            <div>
              <strong>ไฟล์ที่ส่ง:</strong>{" "}
              <a
                href={`/uploads/${student.file}`}
                target="_blank"
                rel="noopener noreferrer"
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
                max={10}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckHomework;
