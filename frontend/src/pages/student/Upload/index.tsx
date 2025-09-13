import React, { useState, useEffect } from 'react';
import { Form, Select, message, Card, Typography, Space, Button, Tag } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import type { AssignmentInterface } from '../../../interfaces/Assignment';
import { AssignmentAPI } from '../../../services/https';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function Index() {
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [detailAssign, setDetailAssign] = useState<AssignmentInterface[]>([]);
  const [mySubsByTitle, setMySubsByTitle] = useState<Record<string, any>>({});
  const [messageApi, contextHolder] = message.useMessage();

  const isWithinWindow = (a: AssignmentInterface) => {
    const start = a.time_start ? new Date(a.time_start) : null;
    const end = a.time_end ? new Date(a.time_end) : null;
    const now = new Date();
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return true;
    return now >= start && now <= end;
  };

  const windowLabel = (a: AssignmentInterface) => {
    const start = a.time_start ? new Date(a.time_start) : null;
    const end = a.time_end ? new Date(a.time_end) : null;
    const now = new Date();
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    if (now < start) return 'ยังไม่เปิดส่ง';
    if (now > end) return 'หมดเขตส่งแล้ว';
    return null;
  };

  const statusTag = (a: AssignmentInterface): { color: string; text: string } => {
    const lbl = windowLabel(a);
    if (!lbl) return { color: 'green', text: 'เปิดส่ง' };
    if (lbl.includes('ยังไม่เปิด')) return { color: 'default', text: 'ยังไม่เปิด' };
    return { color: 'red', text: 'หมดเขต' };
  };

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
  // ???? assignment + ???????????????????
  const loadDetailAssign = async (courseId: number) => {
    try {
      const ress = await AssignmentAPI.getAssignments(courseId);
      if (ress.data && Array.isArray(ress.data)) {
        setDetailAssign(ress.data);
      } else {
        setDetailAssign([]);
      }

      const sidRaw = localStorage.getItem('ID');
      const sid = sidRaw ? Number(sidRaw) : 0;
      if (sid && courseId) {
        const sub = await AssignmentAPI.getMySubmissionsByCourse(courseId, sid);
        const map: Record<string, any> = {};
        if (sub?.data && Array.isArray(sub.data)) {
          for (const s of sub.data) {
            if ((s as any).assignment_title) map[(s as any).assignment_title] = s;
          }
        }
        setMySubsByTitle(map);
      } else {
        setMySubsByTitle({});
      }
    } catch (err) {
      console.error('????????????????????????????:', err);
      setDetailAssign([]);
      messageApi.error('?????????????????????????????????');
      setMySubsByTitle({});
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
                  opacity: isWithinWindow(assign) ? 1 : 0.55,
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
                  <Tag color={statusTag(assign).color}>{statusTag(assign).text}</Tag>
                  {mySubsByTitle[assign.assignment_title] && (
                    <Tag color="blue">???????</Tag>
                  )}
                  {windowLabel(assign) && (
                    <Text type="secondary">{windowLabel(assign)}</Text>
                  )}
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
                        disabled={!selectedCourse || !isWithinWindow(assign)}
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
                        disabled={!selectedCourse || !isWithinWindow(assign)}
                      >
                        แก้ไข
                      </Button>
                  </Link>
                    {!isWithinWindow(assign) && (
                      <Text type="secondary"></Text>
                    )}
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
