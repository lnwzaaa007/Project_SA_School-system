import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/https";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Loader from "../../components/third-patry/Loader";
import "../../App.css";
import {
  HomeOutlined,
  CalendarOutlined,
  MenuOutlined,
  NotificationOutlined,
  ContainerOutlined,
  FileSearchOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  CreditCardOutlined
} from "@ant-design/icons";

// import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import { Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import Home from "../../pages/admin/Home";
import Announce from "../../pages/admin/Announce";
import ManageStudent from "../../pages/admin/ManageStudent";
import ManageTeacher from "../../pages/admin/ManageTeacher";
import Payment from "../../pages/admin/Payment";
import Schedule from "../../pages/admin/Schedule";
import ApplyForStudy from "../../pages/admin/ApplyForStudy";
import Course from "../../pages/admin/Course";
import CreateTeacher from "../../pages/admin/ManageTeacher/CreateTeacher";
import DeleteTeacher from "../../pages/admin/ManageTeacher/DeleteTeacher";
import EditTeacher from "../../pages/admin/ManageTeacher/EditTeacher";
import DataTeacher from "../../pages/admin/ManageTeacher/CreateTeacher/DataTeacher";
import AddressTeacher from "../../pages/admin/ManageTeacher/CreateTeacher/AddressTeacher";
import EditDataTeacher from "../../pages/admin/ManageTeacher/EditTeacher/EditDataTeacher";
import EditAddressTeacher from "../../pages/admin/ManageTeacher/EditTeacher/EditAddressTeacher";
import MoveAddStudent from "../../pages/admin/ApplyForStudy/MoveAddStudent";
import AddStudent from "../../pages/admin/ManageStudent/AddStudent/AddStudent";
const { Header, Content, Footer, Sider } = Layout;

const AdminFullLayout: React.FC = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      (async () => {
          const userId = Number(localStorage.getItem("id"));
          const res = await adminAPI.getNameAdminById(userId);
          setAdmin(res);
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
    setIsLoading(true)
    localStorage.clear();
    messageApi.success("Logout successful");
    setTimeout(() => {
      location.href = "/";
    
    }, 2000);
  };

  return (
    <>
      {isLoading && <Loader />}
      <Layout className="background" style={{ minHeight: "100vh",background:"#ffffff"}}>
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
            defaultSelectedKeys={[currentPage]}
            style={{
              // color: "#fff",
              backgroundColor: "#C8E8FF",
              color: "#ffffff",
              fontSize: "18px", // เพิ่มขนาดข้อความเมนู
              lineHeight: "48px", // เพิ่มความสูงแถว (ไม่แออัด)
              marginTop: 16,
              
              
              
            }}
          >
            <Menu.Item
              key="หน้าหลัก"
              onClick={() => setCurrentPage("หน้าหลัก")}
              style={{ marginBottom: 8,}}
            >
              <Link
                to="/admin"
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
              key="ประกาศ"
              onClick={() => setCurrentPage("ประกาศ")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/announce"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <NotificationOutlined style={{ fontSize: "20px" }} />
                <span>ประกาศ</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="จัดการนักเรียน"
              onClick={() => setCurrentPage("จัดการนักเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/manageStudent"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <TeamOutlined style={{ fontSize: "20px" }} />

                <span>จัดการนักเรียน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="จัดการครู"
              onClick={() => setCurrentPage("จัดการครู")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/manageTeacher"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <UserDeleteOutlined style={{ fontSize: "20px" }} />

                <span>จัดการครู</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="จัดการรายวิชา"
              onClick={() => setCurrentPage("จัดการรายวิชา")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/course"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <FileSearchOutlined style={{ fontSize: "20px" }} />

                <span>จัดการรายวิชา</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="สร้างตารางเรียน/สอน"
              onClick={() => setCurrentPage("สร้างตารางเรียน/สอน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/schedule"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CalendarOutlined style={{ fontSize: "20px" }} />

                <span>สร้างตารางเรียน/สอน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="ตรวจสอบการชำระเงิน"
              onClick={() => setCurrentPage("ตรวจสอบการชำระเงิน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/payment"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <CreditCardOutlined style={{ fontSize: "20px" }} />

                <span>ตรวจสอบการชำระเงิน</span>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="สมัครเรียน"
              onClick={() => setCurrentPage("สมัครเรียน")}
              style={{ marginBottom: 8 }}
            >
              <Link
                to="/admin/applyForStudy"
                style={{
                  marginLeft: collapsed ? "-5px" : "0px",
                  marginTop: `3px`,
                }}
              >
                <ContainerOutlined style={{ fontSize: "20px" }} />
                <span>สมัครเรียน</span>
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
              zIndex: 1000,
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
                {admin?.t_first_name} {admin?.t_last_name}
              </span>
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
                <Route path="/announce"element={<Announce />}/>
                <Route path="/manageStudent" element={<ManageStudent />} />
                <Route path="/manageStudent/AddStudent" element={<AddStudent />} />
                <Route path="/manageTeacher" element={<ManageTeacher />} />
                <Route path="/manageTeacher/CreateTeacher" element={<CreateTeacher />} />
                <Route path="/manageTeacher/DeleteTeacher" element={<DeleteTeacher />} />
                <Route path="/manageTeacher/EditTeacher" element={<EditTeacher />} />
                <Route path="/manageTeacher/CreateTeacher/DataTeacher" element={<DataTeacher />} />
                <Route path="/manageTeacher/CreateTeacher/AddressTeacher" element={<AddressTeacher />} />
                <Route path="/manageTeacher/EditTeacher/EditDataTeacher" element={<EditDataTeacher />} />
                <Route path="/manageTeacher/EditTeacher/EditAddressTeacher" element={<EditAddressTeacher />} />
                <Route path="/course" element={<Course />} />
                <Route path="/schedule" element={<Schedule />} />
                {/* <Route path="/schedule/add" element={<AddSchedule />} /> */}
                <Route path="/payment" element={<Payment />} />
                <Route path="/applyForStudy" element={<ApplyForStudy />} />
                <Route path="/applyForStudy/MoveAddStudent" element={<MoveAddStudent />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default AdminFullLayout;
