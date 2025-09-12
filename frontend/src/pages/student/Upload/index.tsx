import React, { useState, useEffect } from 'react';
import { Form, Select, message, Card, Typography, Space, Button } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import type { AssignmentInterface } from '../../../interfaces/Assignment';
import { AssignmentAPI } from '../../../services/https';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function Index() {
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [detailAssign, setDetailAssign] = useState<AssignmentInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  // โหลดรายวิชา
  const fetchCourse = async () => {
    try {
      const grade_id = Number(localStorage.getItem('grade_id'));
      if (!grade_id) {
        console.error("❌ ไม่มี grade_id ใน localStorage");
        return;
      }
      const res = await AssignmentAPI.getCourses(grade_id);
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
      if (ress.data && Array.isArray(ress.data)) {
        setDetailAssign(ress.data);
      } else {
        setDetailAssign([]);
      }
    } catch (err) {
      console.error("❌ โหลดการบ้านผิดพลาด:", err);
      setDetailAssign([]);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดการบ้าน");
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    if (selectedCourse !== null) {
      loadDetailAssign(selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      {contextHolder}
      <Outlet />

      <Title level={3} style={{ marginBottom: 20 }}>
        📘 รายวิชา
      </Title>

      <Form layout="vertical" style={{ width: '100%', maxWidth: 400 }}>
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

      <div style={{ marginTop: 30 }}>
        {detailAssign.length > 0 ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {detailAssign.map((assign, index) => (
              <Card
                key={index}
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: 16,
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {assign.assignment_title}
                  </Title>
                  <Paragraph style={{ margin: '8px 0' }}>
                    {assign.description}
                  </Paragraph>
                  <Text type="secondary">
                    📅 เริ่ม: {assign.time_start}
                  </Text>
                  <Text type="secondary">
                    ⏰ สิ้นสุด: {assign.time_end}
                  </Text>
                  <Text strong>สถานะ: {assign.submit_status}</Text>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 16,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Link to={`/student/upload/fileupload/${assign.ID}`}>
                      <Button
                        type="primary"
                        style={{ borderRadius: 8 }}
                        disabled={!selectedCourse}
                      >
                        ส่งงาน
                      </Button>
                    </Link>
                    <Link
                      to={`/student/upload/fileupload/${assign.ID}`}
                      state={{ course_id: selectedCourse }}
                    >
                      <Button
                        style={{
                          backgroundColor: '#F06464',
                          color: 'white',
                          borderRadius: 8,
                        }}
                        disabled={!selectedCourse}
                      >
                        แก้ไข
                      </Button>
                    </Link>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        ) : (
          selectedCourse && (
            <Text type="secondary">ไม่มีการบ้านในรายวิชานี้</Text>
          )
        )}
      </div>
    </div>
  );
}

export default Index;
