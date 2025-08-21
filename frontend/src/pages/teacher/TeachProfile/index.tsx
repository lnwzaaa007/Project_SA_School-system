import React from "react";
import { Card, Avatar, Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import teacherImage from "../../../assets/teacher.jpeg";

const titleTxt = { fontSize: 22 }; 
const txt = { fontSize: 16 };
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
    <div style={{ display: "flex", justifyContent: "center", marginTop: 50,height:"90vh" }}>
      <Card
        style={{
          width: "100%",
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          
        }}
      >
      <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "2.5%",
        justifyContent: "space-between", // ดันให้ชื่ออยู่ซ้าย ปุ่มอยู่ขวา
      }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={teacherData.image}
            size={120}
            style={{ marginRight: 20 }}
          />
        <div>
          <h2 style={{ marginBottom: 5, fontSize: "32px" }}>
            {teacherData.name}
          </h2>
          <p style={{ color: "gray", fontSize: "24px" }}>
            ครูประจำวิชา {teacherData.subject}
          </p>
        </div>
      </div>

  {/* <Button
    type="primary"
    icon={<EditOutlined />}
    onClick={handleEdit}
    size="large"
  >
    แก้ไขข้อมูล
  </Button> */}
</div>

        <div style={{fontSize:"100px"}}>
          <Descriptions title={<span style={titleTxt}>ข้อมูลส่วนตัว</span>} column={2} bordered >
          <Descriptions.Item  label= "รหัสครู" labelStyle={titleTxt} contentStyle={txt}>{teacherData.id}</Descriptions.Item>
          <Descriptions.Item  label="เพศ" labelStyle={titleTxt} contentStyle={txt}>{teacherData.gender}</Descriptions.Item>
          <Descriptions.Item  label="เลขบัตรประชาชน" labelStyle={titleTxt} contentStyle={txt}>{teacherData.citizenId}</Descriptions.Item>
          <Descriptions.Item  label="วันเกิด" labelStyle={titleTxt} contentStyle={txt}>{teacherData.birthDate}</Descriptions.Item>
          <Descriptions.Item  label="สถานะ" labelStyle={titleTxt} contentStyle={txt}>{teacherData.status}</Descriptions.Item>
          <Descriptions.Item  label="วุฒิการศึกษา" labelStyle={titleTxt} contentStyle={txt}>{teacherData.education}</Descriptions.Item>
          <Descriptions.Item  label="สัญชาติ" labelStyle={titleTxt} contentStyle={txt}>{teacherData.nationality}</Descriptions.Item>
          <Descriptions.Item  label="ศาสนา" labelStyle={titleTxt} contentStyle={txt}>{teacherData.religion}</Descriptions.Item>
          <Descriptions.Item  label="อีเมล" labelStyle={titleTxt} contentStyle={txt}>{teacherData.email}</Descriptions.Item>
          <Descriptions.Item  label="เบอร์โทร" labelStyle={titleTxt} contentStyle={txt}>{teacherData.phone}</Descriptions.Item>
          <Descriptions.Item  label="ที่อยู่" span={2} labelStyle={titleTxt} contentStyle={txt}>
            {teacherData.address}
          </Descriptions.Item>
        </Descriptions>
        </div>
        
      </Card>
    </div>
  );
};

export default Profile;
