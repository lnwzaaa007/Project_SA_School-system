import React from "react";
import { Card, Avatar, Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import teacherImage from "../../../assets/teacher.jpeg";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // ข้อมูลตัวอย่าง
  const teacherData = {
    id: "T123456",
    name: "นางสมศรี ใจดี",
    gender: "หญิง",
    citizenId: "1234567890123",
    birthDate: "1 มกราคม 2520",
    status: "สมรส",
    education: "ปริญญาตรี คณิตศาสตร์ศึกษา",
    nationality: "ไทย",
    religion: "พุทธ",
    email: "somchai@example.com",
    phone: "081-234-5678",
    address: "123/45 หมู่บ้านตัวอย่าง ต.ในเมือง อ.เมือง จ.นครราชสีมา",
    subject: "คณิตศาสตร์",
    image: teacherImage,
  };

  const handleEdit = () => {
    navigate("EditProfile", { state: teacherData });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
      <Card
        style={{
          width: 800,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Avatar
            src={teacherData.image}
            size={120}
            style={{ marginRight: 20 }}
          />
          <div>
            <h2 style={{ marginBottom: 5 }}>{teacherData.name}</h2>
            <p style={{ color: "gray" }}>ครูประจำวิชา {teacherData.subject}</p>

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              แก้ไขข้อมูล
            </Button>
          </div>
        </div>

        <Descriptions title="ข้อมูลส่วนตัว" column={2} bordered>
          <Descriptions.Item label="รหัสครู">{teacherData.id}</Descriptions.Item>
          <Descriptions.Item label="เพศ">{teacherData.gender}</Descriptions.Item>
          <Descriptions.Item label="เลขบัตรประชาชน">{teacherData.citizenId}</Descriptions.Item>
          <Descriptions.Item label="วันเกิด">{teacherData.birthDate}</Descriptions.Item>
          <Descriptions.Item label="สถานะ">{teacherData.status}</Descriptions.Item>
          <Descriptions.Item label="วุฒิการศึกษา">{teacherData.education}</Descriptions.Item>
          <Descriptions.Item label="สัญชาติ">{teacherData.nationality}</Descriptions.Item>
          <Descriptions.Item label="ศาสนา">{teacherData.religion}</Descriptions.Item>
          <Descriptions.Item label="อีเมล">{teacherData.email}</Descriptions.Item>
          <Descriptions.Item label="เบอร์โทร">{teacherData.phone}</Descriptions.Item>
          <Descriptions.Item label="ที่อยู่" span={2}>
            {teacherData.address}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
