// src/pages/ChooseRolePage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "antd";
import { useNavigate,Outlet } from "react-router-dom";
import { Button, Space, Typography, Input, Card,Form,message} from "antd";
import School from "../../../assets/School.jpg"
import { authAPI ,studentAPI,teacherAPI ,adminAPI,userTypeAPI} from "../../../services/https";
import type { SignInInterface } from "../../../interfaces/SignIn";

const COOKIE_NAME = "0195f494-feaa-734a-92a6-05739101ede9"; // ให้ตรงกับ axios.getCookie

const { Title } = Typography;

const SignInPages = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  // const [user, setUser] = useState("");
  // const [password, setPassword] = useState("");

  const onFinish = async (values: SignInInterface) => {
  try {
    const payload = {
      ...values,
      username: (values.username || "").trim().toUpperCase(),
    };

    const res = await authAPI.userLogin(payload);
    const { token, id } = res?.data?.data ?? {};

    if (token && id) {
      // เก็บ token และข้อมูลลง localStorage (ยกเว้น isLogin ไว้หลังยืนยัน role)
        localStorage.setItem("token", token);
        localStorage.setItem("id", String(id));
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;

      const userType = await userTypeAPI.getUserTypes(id);
      let role: "student" | "teacher" | "admin" | undefined;
      
      if (userType.prefix === "S") {
        const student = await studentAPI.getStudent(id);
        if (student?.student_id === payload.username) {
          role = "student";
        }
      } 
      else if (userType.prefix === "T") {
        const teacher = await teacherAPI.getTeachar(id);//ค้นหาด้วย id users
        if (teacher?.teacher_id === payload.username) {
          role = "teacher";
        }
      } 
      else if (userType.prefix === "A") {
        const admin = await adminAPI.getNameAdminById(id);
        if (admin?.admin_id === payload.username) {
          role = "admin";
        }
      }

      if (role) {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("role", role);
        // Navigate ไปตาม role
        const nextPath =
        role === "student" ? "/student" :
        role === "teacher" ? "/teacher" : "/admin";
        
        messageApi.success({
          content: "Sign-in successful",
          duration: 1,                 // วินาที
          onClose: () => navigate(nextPath),
        });
        // setTimeout(() => navigate(nextPath), 300);
      } else {
        messageApi.error("ไม่สามารถยืนยันตัวตนผู้ใช้ได้");
      }
    } else {
      messageApi.error(res?.error || "Login failed");
    }
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Unable to sign in. Please try again.";
      messageApi.error(msg);
    }
  };

  return (
    <>
    {contextHolder}
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
          <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
                  // label="Username"
                  name="username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                >
                  <Input
                    size="large"
                    placeholder="Username"
                    prefix={<span role="img" aria-label="user">👤</span>}
                    style={{ marginBottom: 16, borderRadius: 24 }}
                    // value={user}
                    // onChange={e => setUser(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  // label="Password"
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Password"
                    prefix={<span role="img" aria-label="lock">🔒</span>}
                    style={{ marginBottom: 24, borderRadius: 24 }}
                    // value={password}
                    // onChange={e => setPassword(e.target.value)}
                  />
                </Form.Item> 
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
              htmlType="submit"
              size="large"
              style={{ borderRadius: 24, marginBottom: 16 }}
            >
              Login
            </Button>
          </Form>
          <Space direction="vertical" style={{ width: "100%" }}>
          </Space>
        </Card>
      </div>
        <Outlet/>
    </div>
    </>
  );
};

export default SignInPages;
