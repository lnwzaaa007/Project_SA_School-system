import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Tag, Input, Modal } from "antd";

// ตัวอย่างข้อมูลนักเรียน
const students: { id: number; name: string; file: string; status: string; score: string | null }[] = [
  { id: 1, name: "สมชาย ใจดี", file: "homework1.pdf", status: "pending", score: null },
  { id: 2, name: "สุดา สวยงาม", file: "homework2.pdf", status: "pending", score: null },
];

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "orange", text: "รอตรวจ" },
  checked: { color: "green", text: "ตรวจแล้ว" },
};

const CheckHomework: React.FC = () => {
  const { homeworkId } = useParams();
  const [studentList, setStudentList] = useState(students);
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

  const columns = [
    { title: "ลำดับที่", dataIndex: "id", key: "id", align: "center" as const },
    { title: "ชื่อ", dataIndex: "name", key: "name", align: "center" as const },
    {
      title: "ไฟล์แนบ",
      dataIndex: "file",
      key: "file",
      align: "center" as const,
      render: (file: string) => (
        <a href={`/${file}`} target="_blank" rel="noopener noreferrer">
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
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
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
      render: (_: any, record: any) =>
        record.status === "pending" ? (
          <Button type="primary" onClick={() => handleCheck(record.id)}>
            ตรวจงาน
          </Button>
        ) : (
          <Tag color="green">ตรวจแล้ว</Tag>
        ),
    },
  ];

  // Modal ตรวจงาน
  const student = studentList.find((stu) => stu.id === selectedStudent);

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
              <a href={`/${student.file}`} target="_blank" rel="noopener noreferrer">
                {student.file}
              </a>
            </div>
            <div style={{ marginTop: 16 }}>
              <strong>ให้คะแนน:</strong>
              <Input
                style={{ width: 120, marginLeft: 8 }}
                value={score}
                onChange={e => setScore(e.target.value)}
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
// filepath: d:\Project_SA_School-system\frontend\src\pages\teacher\CreateWork\CheckWork\index.tsx