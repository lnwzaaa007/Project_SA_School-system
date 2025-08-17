import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Loader from "../../components/third-patry/Loader";
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
import Studentimg from "../../assets/student.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import ScheduleStudent from "../../pages/student/ScheduleStudent";
import Home from "../../pages/student/Home";
import Playment from "../../pages/student/Payment";
import Upload from "../../pages/student/Upload";
import Profile from "../../pages/student/StudentProfile";
import Attendance from "../../pages/student/Attendance";
import AcademicResult from "../../pages/student/AcademicResult";

const { Header, Content, Footer, Sider } = Layout;

const StudentFullLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    localStorage.clear();
    messageApi.success("Logout successful");
    setTimeout(() => {
      location.href = "/";
    }, 1000);
  };

  return (
    <>
       {isLoading && <Loader />}
      <Layout style={{ minHeight: "100vh",background:"#F1EEE0" }}>
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
            backgroundColor: "#2F78E1",
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
            // defaultSelectedKeys={[currentPage]}
            selectedKeys={[currentPage]}
            style={{
              backgroundColor: "#2F78E1",
              color: "#000",
              fontSize: "18px", // เพิ่มขนาดข้อความเมนู
              lineHeight: "48px", // เพิ่มความสูงแถว (ไม่แออัด)
              marginTop: 16,
            }}      
          >
            <Menu.Item
              key="หน้าหลัก"
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
              key="ประวัติ"
              onClick={() => setCurrentPage("ประวัติ")}
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
              key="ตารางเรียน"
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
              key="ผลการเรียน"
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
              key="การเข้าเรียน"
              onClick={() => setCurrentPage("การเข้าเรียน")}
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

                <span>การเข้าเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="ส่งงาน"
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
              key="ชำระเงิน"
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
            background:"#F1EEE0"
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
              background: "linear-gradient(to right, #2F78E1, #3D62EA)",
              padding: "0 24px",
              height: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomLeftRadius: 30,
              transition: "left 0.2s, width 0.2s",
              zIndex: 5000,
            }}
          >
            <h2 style={{ margin: 0,color:"#F1EEE0" }}> {currentPage} </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  // backgroundColor: "#C1E5FF", 
                  cursor: "pointer",
                }}
              >
                <Tooltip title="ออกจากระบบ" overlayStyle={{ zIndex: 6000}}>
                  <LogoutIcon
                    style={{ fontSize: "24px", color: "#F1EEE0" }}
                    onClick={Logout}
                  />
                </Tooltip>
              </div>
              <span style={{ fontSize: "18px", color: "#F1EEE0" }}>
                สมศรี ผ่องใส
              </span>
              <Link to="/student/profile"
                onClick={() => setCurrentPage("ประวัติ")}
              >
                <Tooltip title="ข้อมูลส่วนตัว" overlayStyle={{ zIndex: 6000}}>

                  <img
                    src={Studentimg}
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
          <Footer style={{ textAlign: "center",background:"#F1EEE0" }}>
            System Analysis and Design
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default StudentFullLayout;
