// src/pages/ChooseRolePage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { Button, Space, Typography, Input, Card } from "antd";
import School from "../../../assets/School.jpg"


const { Title } = Typography;

const ChooseRolePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ minHeight: "100vh"}}> <img
          src={School}
          alt="School Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: 0.4, 
          }}
/>
      {/* Header */}
      <header
        style={{
          width: "100%",
          background: "linear-gradient(to right, #4a7fd4ff, #60a5fa)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            SUT School
          </Title>
        </div>
        <Space>
            <Col>
            <Link to="/enrollment/checkStatus">
              <Button  >
                  ตรวจสอบสถานะ
                  </Button>
            </Link>
            </Col>
          
          <Button
              block
              onClick={() => {
                navigate("/enrollment");
                localStorage.setItem("role", "enrollment");
              }}
            >
              สมัครเรียน
            </Button>
        </Space>
      </header>

      {/* Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 80px)",
          backgroundImage: "url('/school-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card
          style={{
            width: 450,
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            textAlign: "center",
            background: "#F8D49A",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
          <Title level={4} style={{ marginBottom: 24 }}>
            SUT School
          </Title>

          <Input
            size="large"
            placeholder="User"
            prefix={<span role="img" aria-label="user">👤</span>}
            style={{ marginBottom: 16, borderRadius: 24 }}
            value={user}
            onChange={e => setUser(e.target.value)}
          />
          <Input.Password
            size="large"
            placeholder="Password"
            prefix={<span role="img" aria-label="lock">🔒</span>}
            style={{ marginBottom: 24, borderRadius: 24 }}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {/* Forget Password */}
          <div style={{ textAlign: "right", marginBottom: 4 }}>
            <a
              href="/forgot-password"
              style={{ fontSize: "14px", color: "#1677ff", textDecoration: "underline" }}
            >
              Forget Password?
            </a>
          </div>
          <Button
            type="primary"
            block
            size="large"
            style={{ borderRadius: 24, marginBottom: 16 }}
            onClick={() => {
              // TODO: handle login logic
            }}
          >
            Login
          </Button>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              block
              onClick={() => {
                navigate("/admin");
                localStorage.setItem("role", "admin");
              }}
            >
              เข้าสู่ระบบแอดมิน
            </Button>
            <Button
              block
              onClick={() => {
                navigate("/student");
                localStorage.setItem("role", "student");
              }}
            >
              เข้าสู่ระบบนักเรียน
            </Button>
            <Button
              block
              onClick={() => {
                navigate("/teacher");
                localStorage.setItem("role", "teacher");
              }}
            >
              เข้าสู่ระบบครู
            </Button>
            
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ChooseRolePage;
