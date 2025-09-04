import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

function Index() {
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:8088/courses')
      .then(res => setCourses(res.data.data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div>
      <span style={{ color: "black", fontSize: "16px", fontWeight: "bold" }}>รายวิชา</span>
      <Form layout="vertical" style={{ width: '30%', marginTop: '10px' }}>
        <Form.Item label="เลือกวิชา" name="course_id" rules={[{ required: true, message: 'กรุณาเลือกวิชา' }]}>
          <Select
            placeholder="เลือกวิชา"
            value={selectedCourse}
            onChange={setSelectedCourse}
          >
            {courses.map(course => (
              <Option key={course.id} value={course.id}>{course.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <div style={{ marginTop: "30px" }}>
        {[1, 2, 3, 4].map((_, index) => (
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
            <div style={{ fontSize: "20px" }}>📎 แนบไฟล์การบ้าน</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to="/student/upload/fileupload"
                state={{ course_id: selectedCourse }}
              >
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
                to="/student/upload/fileupload"
                state={ { course_id: selectedCourse }}
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
        ))}
      </div>
    </div>
  );
}

export default Index;
