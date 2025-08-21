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
  LeftOutlined,
} from "@ant-design/icons";
import Studentimg from "../../assets/student.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import ScheduleStudent from "../../pages/student/ScheduleStudent";
import Home from "../../pages/student/Home";
import Payment from "../../pages/student/Payment";
import Upload from "../../pages/student/Upload";
import Profile from "../../pages/student/StudentProfile";
import Attendance from "../../pages/student/Attendance";
import AcademicResult from "../../pages/student/AcademicResult";
import SlipPayment from "../../pages/student/Payment/Slippayment";
import FileUpload from "../../pages/student/Upload/uploadfile";

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
      <Layout style={{ minHeight: "100vh", background: "#ffffff" }}>
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
            <LeftOutlined
              rotate={collapsed ? 180 : 0}
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
              style={{ marginBottom: 8  ,margin: "0 3px 15px"}}
            >
              <Link
                to="/student"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3 px`,
                }}
              >
                <HomeOutlined style={{ fontSize: "20px" }} />
                <span>หน้าหลัก</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="ประวัติ"
              onClick={() => setCurrentPage("ประวัติ")}
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
              style={{ marginBottom:  8 ,margin: "0 3px 15px"}}
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
            <h2 style={{ margin: 0,color:"#000000" }}> {currentPage} </h2>
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
                    style={{ fontSize: "24px", color: "#000000" }}
                    onClick={Logout}
                  />
                </Tooltip>
              </div>
              <span style={{ fontSize: "18px", color: "#000000" }}>
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
              marginTop: "80px",
              marginLeft: "25px",

            }}
          >
            <Breadcrumb style={{ margin: "12px 0" }} />

            <div
              style={{
                padding: 24,
                borderRadius: "16px",
                minHeight: "calc(100vh - 60px)",
                background: colorBgContainer,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<ScheduleStudent />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/slip" element={<SlipPayment />} />
                <Route path="/Upload" element={<Upload />} />
                <Route path="/Upload/fileupload" element={<FileUpload />} />
                <Route path="/result" element={<AcademicResult />} />
                <Route path="/checkin" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default StudentFullLayout;
