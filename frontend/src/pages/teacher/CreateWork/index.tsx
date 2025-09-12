import React, { useEffect, useState } from "react";
import { Button, Modal, Input, Select, Card, Row, Col, DatePicker } from "antd";
import { Link } from "react-router-dom";
import type { Moment } from "moment";
import moment from "moment";
import axios from "axios";
import { createAssignment } from "../../../services/https";

const subjects = [
  { value: "thai", label: "ภาษาไทย" },
  { value: "math", label: "คณิตศาสตร์" },
  { value: "science", label: "วิทยาศาสตร์" },
  { value: "english", label: "ภาษาอังกฤษ" },
];

type Homework = {
  id: number;
  subject: string;
  title: string;
  description: string;
  openDate: string;
  closeDate: string;
};

const CreateWork: React.FC = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openDate, setOpenDate] = useState<Moment | null>(null);
  const [closeDate, setCloseDate] = useState<Moment | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [pointAll, setPointAll] = useState<number>(10);

  // โหลดรายวิชาเฉพาะครู
  const fetchCourses = async () => {
    try {
      const teacher_id = Number(localStorage.getItem("ID"));
      if (!teacher_id) {
        console.error("❌ ไม่มี teacher_id ใน localStorage");
        return;
      }
      const res = await createAssignment.getCourseTeacher(teacher_id);
      if (Array.isArray(res.data)) {
        setCourses(
          res.data.map((c: any) => ({
            id: c.ID,
            name: `${c.course_name}`,
          }))
        );
      } else {
        console.error("ไม่พบข้อมูลรายวิชา:", res.data);
      }
    } catch (err) {
      console.error("❌ โหลดรายวิชาผิดพลาด:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ สร้างงานใหม่
  const handleCreate = async () => {
    if (!selectedCourse || !title || !description || !openDate || !closeDate) {
      Modal.error({ title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }

    try {
      await axios.post(
        "http://localhost:8088/assignments",
        {
          course_id: selectedCourse,
          assignment_title: title,
          description,
          time_start: openDate.toISOString(),
          time_end: closeDate.toISOString(),
          submit_Point_all: pointAll,
        },
        {
          headers: {
            // ✅ ถ้าต้องตรวจ token ให้แน่ใจว่ามี token ใน localStorage
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Modal.success({ title: "สร้างงานสำเร็จ" });
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setOpenDate(null);
      setCloseDate(null);
      setSelectedCourse(null);
      setPointAll(10);
    } catch (err) {
      console.error("❌ Error:", err);
      Modal.error({ title: "เกิดข้อผิดพลาดในการบันทึก" });
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <Button
        type="primary"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 24 }}
      >
        สร้างงานใหม่
      </Button>

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
          options={courses.map((course) => ({
            value: course.id,
            label: course.name,
          }))}
          value={selectedCourse}
          onChange={(value) => setSelectedCourse(value)}
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
        <Input
          type="number"
          placeholder="คะแนนเต็ม (Submit_Point_all)"
          value={pointAll}
          onChange={(e) => setPointAll(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 16 }}
        />
      </Modal>

      <Row gutter={[16, 16]}>
        {subjects.map((subj) => (
          <Col key={subj.value} xs={24} sm={12} md={8} lg={6}>
            <Card title={subj.label} style={{ minHeight: 180 }}>
              {homeworks.filter((hw) => hw.subject === subj.value).length === 0 ? (
                <div style={{ color: "#aaa" }}>ยังไม่มีงานในวิชานี้</div>
              ) : (
                homeworks
                  .filter((hw) => hw.subject === subj.value)
                  .map((hw) => (
                    <div key={hw.id} style={{ marginBottom: 8 }}>
                      <strong>{hw.title}</strong>
                      <div>{hw.description}</div>
                      <div>
                        <span style={{ color: "#888" }}>
                          เปิด: {hw.openDate} | ปิด: {hw.closeDate}
                        </span>
                      </div>
                      <Link to="checkHomework">
                        <Button type="primary" style={{ marginTop: 8 }}>
                          ตรวจงาน
                        </Button>
                      </Link>
                    </div>
                  ))
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CreateWork;
