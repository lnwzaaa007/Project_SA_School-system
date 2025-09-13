import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Input,
  Select,
  Card,
  DatePicker,
  Typography,
  Space,
  message,
  InputNumber,
} from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import type { Moment } from "moment";
import moment from "moment";
import { Get, Post, createAssignment } from "../../../services/https";
import { useNavigate } from "react-router-dom";

type Homework = {
  id: number;
  course_name: string;
  assignment_title: string;
  description: string;
  time_start: string;
  time_end: string;
  submit_point_all: number;
};

const CreateWork: React.FC = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openDate, setOpenDate] = useState<Moment | null>(null);
  const [closeDate, setCloseDate] = useState<Moment | null>(null);
  const [pointAll, setPointAll] = useState<number>(0);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const location = useLocation();                      // ✅ ใช้เพื่อตรวจ path
  const isCheckPage = location.pathname.includes("checkHomework");


  const { Title, Text } = Typography;

  // โหลดรายวิชาที่ครูสอน
  const fetchCourses = async () => {
    try {
      const teacher_id = Number(localStorage.getItem("ID"));
      if (!teacher_id) {
        message.error("ไม่พบ teacher_id");
        return;
      }
      const res = await createAssignment.getCourseTeacher(teacher_id);
      if (Array.isArray(res.data)) {
        setCourses(
          res.data.map((c: any) => ({
            id: c.ID,
            name: c.course_name,
          }))
        );
      }
    } catch (err) {
      console.error("❌ โหลดรายวิชาผิดพลาด:", err);
      message.error("โหลดรายวิชาผิดพลาด");
    }
  };

  // โหลดการบ้านทั้งหมด
  const fetchAssignments = async () => {
    try {
      const res = await Get("/assignments");
      if (Array.isArray(res.data)) {
        setHomeworks(
          res.data.map((hw: any) => ({
            id: hw.ID,
            course_name: hw.Course?.course_name || "-",
            assignment_title: hw.assignment_title,
            description: hw.description,
            time_start: hw.time_start,
            time_end: hw.time_end,
            submit_point_all: hw.submit_Point_all ?? 0,
          }))
        );
      }
    } catch (err) {
      console.error("❌ โหลดการบ้านผิดพลาด:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchAssignments();
  }, []);

  // สร้างงานใหม่
  const handleCreate = async () => {
    if (
      !selectedCourse ||
      !title ||
      !description ||
      !openDate ||
      !closeDate ||
      pointAll <= 0
    ) {
      Modal.error({ title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }
    try {
      await Post("/assignments", {
        course_id: selectedCourse,
        assignment_title: title,
        description: description,
        time_start: openDate.toISOString(),
        time_end: closeDate.toISOString(),
        submit_Point_all: pointAll,
      });

      Modal.success({ title: "สร้างงานสำเร็จ" });
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setOpenDate(null);
      setCloseDate(null);
      setPointAll(0);
      setSelectedCourse(null);
      fetchAssignments(); // โหลดรายการใหม่ทันที
    } catch (err) {
      console.error("❌ บันทึกการบ้านผิดพลาด:", err);
      Modal.error({ title: "เกิดข้อผิดพลาดในการบันทึก" });
    }
  };
  // <Outlet />
  return (
    <div style={{ padding: 32 }}>
      <Outlet />
      {/* ✅ ซ่อน UI ปกติเมื่ออยู่หน้า checkHomework */}
      {!isCheckPage && (
        <>
      <Title level={3}>📘 จัดการการบ้าน</Title>

      <Button
        type="primary"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 24 }}
      >
        ➕ สร้างงานใหม่
      </Button>

      {/* โมดอลสร้างงาน */}
      <Modal
        title="สร้างงานใหม่"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        okText="สร้างงาน"
        cancelText="ยกเลิก"
      >
        <Select
          placeholder="เลือกวิชา"
          value={selectedCourse}
          onChange={(value) => setSelectedCourse(value)}
          options={courses.map((course) => ({
            value: course.id,
            label: course.name,
          }))}
          style={{ width: "100%", marginBottom: 16 }}
        />
        <Input
          placeholder="หัวข้อการบ้าน"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="รายละเอียดการบ้าน"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ marginBottom: 16 }}
        />
        <DatePicker
          placeholder="วันที่เปิด"
          value={openDate}
          onChange={setOpenDate}
          style={{ width: "100%", marginBottom: 16 }}
        />
        <DatePicker
          placeholder="วันที่ปิด"
          value={closeDate}
          onChange={setCloseDate}
          style={{ width: "100%", marginBottom: 16 }}
        />
        <InputNumber
          placeholder="กำหนดคะแนนเต็ม"
          min={1}
          style={{ width: "100%", marginBottom: 16 }}
          value={pointAll}
          onChange={(value) => setPointAll(value ?? 0)}
        />
      </Modal>

      {/* แสดงการบ้านทั้งหมด */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {homeworks.length === 0 ? (
          <Text type="secondary">ยังไม่มีการบ้าน</Text>
        ) : (
          homeworks.map((hw) => (
            <Card
              key={hw.id}
              hoverable
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: 12,
              }}
            >
              <Title level={4}>{hw.assignment_title}</Title>
              <Text strong>วิชา: {hw.course_name}</Text>
              <p style={{ marginTop: 8 }}>{hw.description}</p>
              <Space direction="vertical" size={2} style={{ marginTop: 8 }}>
                <Text type="secondary">
                  📅 เริ่ม: {moment(hw.time_start).format("DD/MM/YYYY")}
                </Text>
                <Text type="secondary">
                  ⏰ สิ้นสุด: {moment(hw.time_end).format("DD/MM/YYYY")}
                </Text>
                <Text strong>คะแนนเต็ม: {hw.submit_point_all}</Text>
              </Space>
              <div style={{ marginTop: 16 }}>
                <Link to={`/teacher/createWork/checkHomework/${hw.id}`}>
                  <Button type="primary">ตรวจงาน</Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default CreateWork;
