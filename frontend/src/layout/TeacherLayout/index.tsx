import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import "../../App.css";
import {
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckSquareOutlined,
  MenuOutlined,
  SolutionOutlined,
  FileAddOutlined,
} from "@ant-design/icons";

import LogoutIcon from "@mui/icons-material/Logout";
import Teacher from "../../assets/teacher.jpeg";
import { Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import Home from "../../pages/teacher/Home";
import AttendanceRecord from "../../pages/teacher/AttendanceRecord";
import CreateWork from "../../pages/teacher/CreateWork";
import EnterScore from "../../pages/teacher/EnterScore";
import ListOfStudent from "../../pages/teacher/ListOfStudent";
import TeachProfile from "../../pages/teacher/TeachProfile";
import TeachingSchedule from "../../pages/teacher/TeachingSchedule";

const { Header, Content, Footer, Sider } = Layout;

const TeacherFullLayout: React.FC = () => {
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
    }, 2000);
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
                to="/teacher"
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
              onClick={() => setCurrentPage("ประวัติ")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/profile"
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
              onClick={() => setCurrentPage("ตารางสอน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/schedule"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CalendarOutlined style={{ fontSize: "20px" }} />

                <span>ตารางสอน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="ListOfStudent"
              onClick={() => setCurrentPage("รายชื่อนักเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/ListOfStudent"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <FileTextOutlined style={{ fontSize: "20px" }} />

                <span>รายชื่อนักเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="enterScore"
              onClick={() => setCurrentPage("กรอกคะแนน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/enterScore"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <EditOutlined style={{ fontSize: "20px" }} />

                <span>กรอกคะแนน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="createWork"
              onClick={() => setCurrentPage("สร้างงาน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/createWork"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <FileAddOutlined style={{ fontSize: "20px" }} />

                <span>สร้างงาน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="attendanceRecord"
              onClick={() => setCurrentPage("บันทึกเข้าเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/teacher/attendanceRecord"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CheckSquareOutlined style={{ fontSize: "20px" }} />

                <span>บันทึกเข้าเรียน</span>
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
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#C1E5FF", 
                  cursor: "pointer",
                }}
              >
                <Tooltip title="ออกจากระบบ">
                  <LogoutIcon
                    style={{ fontSize: "24px", color: "#000" }}
                    onClick={Logout}
                    // className="hover:bg-gray-200 rounded-full p-2 cursor-pointer"
                  />
                </Tooltip>
              </div>
              <span style={{ fontSize: "18px", color: "#000" }}>ครู สมศรี</span>
              <Link to="/teacher/profile">
                <Tooltip title="ข้อมูลส่วนตัว">
                  {/* <UserOutlined style={{ fontSize: "18px",color: "#000" }}/> */}
                  <img
                    src={Teacher}
                    alt="React Logo"
                    style={{
                      width: "40px",
                      height: "40px",
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
                <Route
                  path="/attendanceRecord"
                  element={<AttendanceRecord />}
                />
                <Route path="/createWork" element={<CreateWork />} />
                <Route path="/enterScore" element={<EnterScore />} />
                <Route path="/schedule" element={<TeachingSchedule />} />
                <Route path="/ListOfStudent" element={<ListOfStudent />} />
                <Route path="/profile" element={<TeachProfile />} />
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

export default TeacherFullLayout;
