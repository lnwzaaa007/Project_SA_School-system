import React, { useState, useEffect } from "react";
import { teacherAPI } from "../../services/https";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Loader from "../../components/third-patry/Loader";
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
import EditProfile from "../../pages/teacher/TeachProfile/EditProfile";
import CheckHomework from "../../pages/teacher/CreateWork/CheckWork";

const { Header, Content, Footer, Sider } = Layout;

const TeacherFullLayout: React.FC = () => {
  const [teacher, setTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
    // useEffect(() => {
    //   (async () => {
    //     try {
    //       const userIdStr = localStorage.getItem("id");
    //       if (!userIdStr) {
    //         throw new Error("ไม่พบ userId ใน localStorage");
    //       }
  
    //       const userId = Number(userIdStr); // ✅ แปลงเป็น number
    //       console.log("📌 userId (from localStorage):", userId); // ✅ print ดูใน console
  
    //       const res = await studentAPI.getNameStudentById(userId);
    //       console.log("📌 studentAPI.getById result:", res); // ✅ print ดูผลลัพธ์ API
  
    //       setStudent(res ?? null);
    //     } catch (e) {
    //       console.error(e);
    //       setStudent(null);
    //       messageApi.error("ไม่สามารถโหลดข้อมูลนักเรียนได้");
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   })();
    // }, []);
    useEffect(() => {
      (async () => {
      
          const userId = Number(localStorage.getItem("id"));
  
          const res = await teacherAPI.getNameTeacherById(userId);
          console.log("📌  result:", res);
          setTeacher(res);
          setIsLoading(false);
    
      })();
    }, []);

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
    }, 2000);
  };

  return (
    <>
       {isLoading && <Loader />}
      <Layout style={{ minHeight: "100vh",background:"#ffffff" }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={230}            
          collapsedWidth={87} 
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            bottom: 10,
            backgroundColor: "#C8E8FF",
            borderRadius: 30,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
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
              style={{ fontSize: 20, color: "#000000" }}
            />
          </div>

          <Menu
            theme="light"
            mode="inline"
            // defaultSelectedKeys={[currentPage]}
            selectedKeys={[currentPage]}
            style={{
              backgroundColor: "#C8E8FF",
              color: "#ffffff",
              fontSize: "18px", // เพิ่มขนาดข้อความเมนู
              lineHeight: "24px", // เพิ่มความสูงแถว (ไม่แออัด)
              marginTop: 16,
            }}
          >
            <Menu.Item
              key="หน้าหลัก"
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
              key="ประวัติ"
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
              key="ตารางสอน"
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
              key="รายชื่อนักเรียน"
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
              key="กรอกคะแนน"
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
              key="สร้างงาน"
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
              key="บันทึกเข้าเรียน"
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
            marginLeft: collapsed ? 87 : 230, // ขยับเฉพาะ Content
            marginRight: 10,
            transition: "margin-left 0.2s",
            minHeight: "100vh",
            background: "#ffffff"
          }}
        >
          {/* Header */}
          <Header
            style={{
              position: "fixed",
              top: 10,
              left: collapsed ? 110 : 250, // ขยับตาม Sider
              right: 15, // เว้นช่องขวา
              width: `calc(100% - ${collapsed ? 110 + 15 : 250 + 15}px)`,
              background: "#C8E8FF",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              padding: "0 24px",
              height: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "30px",
              transition: "left 0.2s, width 0.2s",
              zIndex: 5000,
            }}
          >
            <h2 style={{ margin: 0 ,color:"#000000"}}> {currentPage} </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  // backgroundColor: "#F1EEE0", 
                  cursor: "pointer",
                }}
              >
                <Tooltip title="ออกจากระบบ" overlayStyle={{ zIndex: 6000}}>
                  <LogoutIcon
                    style={{ fontSize: "24px", color: "#000000" }}
                    onClick={Logout}
                  />
                </Tooltip>
              </div>
              <span style={{ fontSize: "18px", color: "#000000" }}>
                {teacher?.tfirst_name} {teacher?.tlast_name}
              </span>
              <Link to="/teacher/profile" 
                onClick={() => setCurrentPage("ประวัติ")}
              >
                <Tooltip title="ข้อมูลส่วนตัว" 
                  overlayStyle={{ zIndex: 6000}}
                >
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
                borderRadius: "16px",
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
                <Route path="/createWork/checkHomework" element={<CheckHomework />} />
                <Route path="/enterScore" element={<EnterScore />} />
                <Route path="/schedule" element={<TeachingSchedule />} />
                <Route path="/ListOfStudent" element={<ListOfStudent />} />
                <Route path="/profile" element={<TeachProfile />} />
                <Route path="/profile/EditProfile" element={<EditProfile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default TeacherFullLayout;
