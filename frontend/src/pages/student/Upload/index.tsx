
import React, { useState, useEffect } from 'react';
import { Form, Select, message } from 'antd';
import { Link, Route, Routes ,Outlet} from 'react-router-dom';
import type { AssignmentInterface } from '../../../interfaces/Assignment';
import { AssignmentAPI } from '../../../services/https';
import AssignmentForm from './uploadfile';

const { Option } = Select;

function Index() {
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [detailAssign, setDetailAssign] = useState<AssignmentInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  // โหลดรายวิชา
  const fetchCourse = async () => {
    try {
      const res = await AssignmentAPI.getCourses();
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
      messageApi.error("เกิดข้อผิดพลาดในการโหลดรายวิชา");
    }
  };

  // โหลด assignment ตาม course_id
  const loadDetailAssign = async (courseId: number) => {
    try {
      const ress = await AssignmentAPI.getAssignments(courseId);
      console.log("📌 API response assignments:", ress.data); // log ทั้งหมด
      if (ress.data && Array.isArray(ress.data)) {
        setDetailAssign(ress.data);
        ress.data.forEach((assign: any) => console.log("assign.ID:", assign.ID)); // log id
      } else {
        setDetailAssign([]);
      }
    } catch (err) {
      console.error("❌ โหลดการบ้านผิดพลาด:", err);
      setDetailAssign([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดการบ้าน");
    }
  };

  // โหลดรายวิชาตอนเปิดหน้า
  useEffect(() => {
    fetchCourse();
  }, []);

  // โหลดการบ้านเมื่อเลือกวิชา
  useEffect(() => {
    if (selectedCourse !== null) {
      loadDetailAssign(selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <div>
      {contextHolder}
      
      <Outlet />

      <span style={{ color: "black", fontSize: "16px", fontWeight: "bold" }}>รายวิชา</span>
      <Form layout="vertical" style={{ width: '30%', marginTop: '10px' }}>
        <Form.Item
          label="เลือกวิชา"
          name="course_id"
          rules={[{ required: true, message: 'กรุณาเลือกวิชา' }]}
        >
          <Select
            placeholder="เลือกวิชา"
            value={selectedCourse}
            onChange={setSelectedCourse}
          >
            {courses.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      <div style={{ marginTop: "30px" }}>
        {detailAssign.length > 0 ? (
          detailAssign.map((assign, index) => {
            console.log("assign object:", assign.ID); // log object แต่ละตัว
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "#B3E0FF",
                  padding: "15px 20px",
                  borderRadius: "15px",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "20px" }}>
                  <div
                    style={{
                      background: "white",
                      height: "auto",
                      padding: "30px",
                      display: "inline-block",
                    }}
                  >
                    <div>{assign.assignment_title}</div>
                    <div>{assign.description}</div>
                    <div>เริ่ม: {assign.time_start}</div>
                    <div>สิ้นสุด: {assign.time_end}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link to={`/student/upload/fileupload/${assign.ID}`}>
                    <button
                      style={{
                        backgroundColor: "#278FDB",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      disabled={!selectedCourse}
                    >
                      ส่งงาน
                    </button>
                  </Link>



                  <Link
                    to={`/student/upload/fileupload/${assign.ID}`}
                    state={{ course_id: selectedCourse }}
                  >
                    <button
                      style={{
                        backgroundColor: "#F06464",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      disabled={!selectedCourse}
                    >
                      แก้ไข
                    </button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          selectedCourse && <p>ไม่มีการบ้านในรายวิชานี้</p>
        )}
      </div>
    </div>
  );
}

export default Index;
