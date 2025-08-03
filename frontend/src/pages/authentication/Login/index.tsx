// src/pages/ChooseRolePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Typography } from "antd";

const { Title } = Typography;

const ChooseRolePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 48, textAlign: "center" }}>

      <Space direction="vertical" size="large">
        <Button  onClick={() => {navigate("/admin"); localStorage.setItem("role", "admin");}}>เข้าสู่ระบบแอดมิน </Button>
        <Button onClick={() => {navigate("/student"); localStorage.setItem("role", "student");}}>เข้าสู่ระบบนักเรียน</Button>
        <Button onClick={() => {navigate("/teacher"); localStorage.setItem("role", "teacher");}}>เข้าสู่ระบบครู</Button>
      </Space>
    </div>
  );
};

export default ChooseRolePage;
