import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Tag, Input, Modal, message, Spin } from "antd";
import axios from "axios";

type StudentItem = {
  id: number;
  studentId: number;
  name: string;
  file: string;
  status: "pending" | "checked";
  score: number | null;
};

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "orange", text: "รอตรวจ" },
  checked: { color: "green", text: "ตรวจแล้ว" },
};

const CheckHomework: React.FC = () => {
  const { id: assignmentId } = useParams();
  const [studentList, setStudentList] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [score, setScore] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheck = (rowId: number) => {
    setSelectedStudent(rowId);
    setScore("");
  };

  const handleSubmitScore = async () => {
    if (!selectedStudent) return;
    try {
      await axios.put(
        `http://localhost:8088/submissions/${selectedStudent}/score`,
        { score: Number(score) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      message.success("บันทึกคะแนนสำเร็จ!");
      setStudentList((prev) =>
        prev.map((s) =>
          s.id === selectedStudent
            ? { ...s, status: "checked", score: Number(score) }
            : s
        )
      );
      setSelectedStudent(null);
      setScore("");
    } catch (err) {
      console.error("บันทึกคะแนนล้มเหลว:", err);
      message.error("บันทึกคะแนนล้มเหลว");
    }
  };

const fetchStudentSubmissions = async (assignmentIdParam?: string) => {
  if (!assignmentIdParam) return;
  try {
    setLoading(true);
    const url = `http://localhost:8088/assignment-check/${assignmentIdParam}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const list: StudentItem[] = (res.data?.data || []).map((item: any) => {
      console.log("Backend row:", item);
      const first = item.Student?.t_first_name || "";
      const last  = item.Student?.t_last_name || "";
      const sc    = item.submit_Point ?? null;
      const isChecked = item.submit_status === "ตรวจแล้ว" || sc !== null;
      return {
        id: item.ID,
        studentId: item.StudentID,
        name: `${first} ${last}`.trim(),
        file: item.assignment_file || "",   // ✅ ใช้ชื่อ field ตัวเล็กตาม JSON
        status: isChecked ? "checked" : "pending",
        score: sc,
      };
    });
    setStudentList(list);
  } catch (err) {
    console.error("โหลดรายการส่งล้มเหลว:", err);
    message.error("โหลดรายการส่งล้มเหลว");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (assignmentId) fetchStudentSubmissions(assignmentId);
  }, [assignmentId]);

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      align: "center" as const,
      render: (_: any, __: StudentItem, index: number) => index + 1,
    },
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      align: "center" as const,
    },
    {
      title: "ไฟล์งาน",
      dataIndex: "file",
      key: "file",
      align: "center" as const,
      render: (file: string) =>
        file ? (
          <a href={`http://localhost:8088/${file}`} target="_blank" rel="noreferrer">
            ดาวน์โหลด
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: "pending" | "checked") => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: "คะแนน",
      dataIndex: "score",
      key: "score",
      align: "center" as const,
      render: (s: number | null) => (s !== null ? s : "-"),
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
      <h2>ตรวจงาน: {assignmentId}</h2>
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
        title={`ให้คะแนน: ${student?.name ?? "-"}`}
        onCancel={() => setSelectedStudent(null)}
        onOk={handleSubmitScore}
        okText="บันทึกคะแนน"
        cancelText="ยกเลิก"
      >
        <Input
          style={{ width: 160 }}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="ใส่คะแนน"
          type="number"
          min={0}
          max={100}
        />
      </Modal>
    </div>
  );
};

export default CheckHomework;
