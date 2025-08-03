import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import "../../App.css";
import {
  HomeOutlined,
  SolutionOutlined,
  CalendarOutlined,
  BookOutlined,
  EditOutlined,
  UploadOutlined,
  CreditCardOutlined,
  MenuOutlined,
} from "@ant-design/icons";
// import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from "@mui/icons-material/Logout";
// import react from "../../assets/react.svg"
import { Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
// import logo from "../../assets/logo.png";
// import Dashboard from "../../pages/dashboard";
// import Customer from "../../pages/customer";
// import CustomerCreate from "../../pages/customer/create";
// import CustomerEdit from "../../pages/customer/edit";
// import { MenuOutlined } from "@ant-design/icons";
import ScheduleStudent from "../../pages/student/ScheduleStudent";
import Home from "../../pages/student/Home";
import Playment from "../../pages/student/Payment";
import Upload from "../../pages/student/Upload";
import Profile from "../../pages/student/StudentProfile";
import Attendance from "../../pages/student/Attendance";
import AcademicResult from "../../pages/student/AcademicResult";

const { Header, Content, Footer, Sider } = Layout;

const StudentFullLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("page") || "หน้าหลัก",
  );
  useEffect(() => {
    localStorage.setItem("page", currentPage);
  }, [currentPage]);

  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const Logout = () => {
    localStorage.clear();
    messageApi.success("Logout successful");

    setTimeout(() => {
      location.href = "/";
    }, 1000);
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            backgroundColor: "#B3E0FF",
            borderBottomRightRadius: 30,
            borderTopRightRadius: 30,
            zIndex: 1000,
            // transition: "left 0.2s, width 0.2s",
            // overflow: "auto", // เผื่อเมนูยาว
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              padding: 16,
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: "20px" }} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 20, color: "#000" }}
            />
          </div>

          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={["home"]}
            style={{
              backgroundColor: "#B3E0FF",
              color: "#000",
              fontSize: "18px", // เพิ่มขนาดข้อความเมนู
              lineHeight: "48px", // เพิ่มความสูงแถว (ไม่แออัด)
            }}
          >
            <Menu.Item
              key="home"
              onClick={() => setCurrentPage("หน้าหลัก")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <HomeOutlined style={{ fontSize: "20px" }} />
                <span>หน้าหลัก</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="profile"
              onClick={() => setCurrentPage("ประวัติส")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/profile"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <SolutionOutlined style={{ fontSize: "20px" }} />

                <span>ประวัติ</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="schedule"
              onClick={() => setCurrentPage("ตารางเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/schedule"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CalendarOutlined style={{ fontSize: "20px" }} />

                <span>ตารางเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="result"
              onClick={() => setCurrentPage("ผลการเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/result"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <BookOutlined style={{ fontSize: "20px" }} />

                <span>ผลการเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="checkin"
              onClick={() => setCurrentPage("บันทึกเข้าเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/checkin"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <EditOutlined style={{ fontSize: "20px" }} />

                <span>บันทึกเข้าเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="upload"
              onClick={() => setCurrentPage("ส่งงาน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/upload"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <UploadOutlined style={{ fontSize: "20px" }} />

                <span>ส่งงาน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="payment"
              onClick={() => setCurrentPage("ชำระเงิน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/student/payment"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CreditCardOutlined style={{ fontSize: "20px" }} />

                <span>ชำระเงิน</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Layout ด้านขวา */}
        <Layout
          style={{
            marginLeft: collapsed ? 87 : 207, // ขยับเฉพาะ Content
            transition: "margin-left 0.2s",
            minHeight: "100vh",
          }}
        >
          {/* Header */}
          <Header
            style={{
              position: "fixed",
              top: 0,
              left: collapsed ? 87 : 207, // ขยับตาม Sider
              right: 0,
              // zIndex: 1100,
              width: `calc(100% - ${collapsed ? 87 : 207}px)`,
              background: "linear-gradient(to right, #88CBF5, #C1E5FF)",
              padding: "0 24px",
              height: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomLeftRadius: 30,
              transition: "left 0.2s, width 0.2s",
            }}
          >
            <h2 style={{ margin: 0 }}> {currentPage} </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Tooltip title="ออกจากระบบ">
                <LogoutIcon
                  style={{ fontSize: "24px", color: "#000" }}
                  onClick={Logout}
                />
              </Tooltip>

              <span style={{ fontSize: "18px", color: "#000" }}>
                สมศรี ผ่องใส
              </span>
              <Link to="/student/profile">
                <Tooltip title="ข้อมูลส่วนตัว">
                  {/* <UserOutlined style={{ fontSize: "18px",color: "#000" }}/> */}
                  <img
                    src={
                      "data:image/jpeg;base64,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"
                    }
                    alt="React Logo"
                    style={{
                      width: "40px",
                      marginLeft: "8px",
                      marginTop: `30px`,
                      borderRadius: "50%",
                    }}
                  />
                </Tooltip>
              </Link>
            </div>
          </Header>

          {/* เนื้อหา */}
          <Content
            style={{
              margin: "0 5px",
              marginTop: "60px",
              // height: "calc(100vh - 60px)", // 64px คือความสูงของ Header
              // overflowY: "auto",            // ✅ ให้ scroll เฉพาะเนื้อหา
            }}
          >
            <Breadcrumb style={{ margin: "16px 0" }} />

            <div
              style={{
                padding: 24,

                minHeight: "calc(100vh - 60px)",

                background: colorBgContainer,
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<ScheduleStudent />} />
                <Route path="/payment" element={<Playment />} />
                <Route path="/Upload" element={<Upload />} />
                <Route path="/result" element={<AcademicResult />} />
                <Route path="/checkin" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            System Analysis and Design
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default StudentFullLayout;
