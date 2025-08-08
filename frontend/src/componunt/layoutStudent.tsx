import React, { useState } from "react";
import { MdHomeFilled, MdMenuOpen } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { BsTable } from "react-icons/bs";
import homeworkSvg from "../assets/homework.svg";
import eduRecordSvg from "../assets/eduRecord.svg";
import checknameSvg from "../assets/checkname.svg";
import walletSvg from "../assets/wallet.svg";
import { Link, Routes,Route } from "react-router-dom";
import AssignSubmit from "../page/Student/AssignSubmit";
import FileUpload from "../page/Student/FileSubmit";
import { Content } from "antd/es/layout/layout";
import Payment from "../../src/page/Student/Payment";
import SlipPayment from "../page/Student/SlipPayment";

function LayoutStudent() {
  const [collapsed, setCollapsed] = useState(true);
  const [selected, setSelected] = useState("home");

  const sidebarWidth = collapsed ? 70 : 200;
  const headerLeft = sidebarWidth + 20;

  const menuItems = [
    { id: "home", icon: <MdHomeFilled style={{ width: "23px", height: "23px" }} />, label: "หน้าหลัก", path: "/" },
    { id: "profile", icon: <ImProfile style={{ width: "23px", height: "23px" }} />, label: "ประวัติส่วนตัว", path: "/profile" },
    { id: "table", icon: <BsTable style={{ width: "23px", height: "23px" }} />, label: "ตารางเรียน", path: "/table" },
    { id: "homework", icon: <img src={homeworkSvg} alt="Homework" style={{ width: "23px", height: "23px", marginTop: "8px" }} />, label: "การบ้าน", path: "/assign" },
    { id: "checkname", icon: <img src={checknameSvg} alt="Check Name" style={{ width: "23px", height: "23px", marginTop: "8px" }} />, label: "เช็คชื่อ", path: "/checkname" },
    { id: "eduRecord", icon: <img src={eduRecordSvg} alt="Education Record" style={{ width: "23px", height: "23px", marginTop: "8px" }} />, label: "บันทึกผลการเรียน", path: "/record" },
    { id: "wallet", icon: <img src={walletSvg} alt="Wallet" style={{ width: "23px", height: "23px", marginTop: "8px" }} />, label: "ชำระเงิน", path: "/wallet" },
  ];

  const sidebarStyle: React.CSSProperties = {
    position: "absolute",
    width: `${sidebarWidth + 10}px`,
    height: "738px",
    left: "0px",
    top: "00px",
    background: "#B3E0FF",
    borderRadius: "0px 20px 20px 0px",
    transition: "width 0.3s ease-in-out",
    overflow: "hidden",
  };

  const iconStyle = {
    fontSize: "30px",
    color: "#000",
    margin: "20px auto",
    display: "block",
    cursor: "pointer",
    transition: "transform 0.3s",
  };

  return (
    <>
      {/* Header */}
      <header
        style={{
          position: "absolute",
          left: `${headerLeft}px`,
          top: "0px",
          height: "70px",
          width: `calc(100% - ${headerLeft + 20}px)`,
          background: "linear-gradient(90.54deg, #88CBF5 0.46%, #C1E5FF 52.99%)",
          borderRadius: "0px 0px 20px 20px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "20px",
          transition: "left 0.3s, width 0.3s",
        }}
      >
        <h2 style={{ margin: 0, padding: "20px", color: "#000", fontSize: "20px" }}>
          {menuItems.find((item) => item.id === selected)?.label || "หน้าหลัก"}
        </h2>
      </header>

      {/* Sidebar */}
      <div
        style={sidebarStyle}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <MdMenuOpen
          style={{
            ...iconStyle,
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            marginRight: "30px",
          }}
        />
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.id}
            onClick={() => setSelected(item.id)}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                padding: "10px 15px",
                margin: "0 10px 12px 10px",
                borderRadius: "12px",
                backgroundColor: selected === item.id ? "#fff" : "transparent",
                fontWeight: selected === item.id ? "bold" : "normal",
                cursor: "pointer",
                color: "#000",
              }}
            >
              <span style={{ marginRight: "20px" }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          position: "absolute",
          left: `${headerLeft}px`,
          top: "80px",
          width: `calc(100% - ${headerLeft + 40}px)`,
          height: "calc(90vh - 45px)",
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "20px",
          overflow: "auto",
        }}
      >
        <Content>
          <Routes>
            <Route path="/assign" element={<AssignSubmit />} />
            <Route path="/assign/file-upload" element={<FileUpload />} />
            <Route path="/wallet" element={<Payment />} />
            <Route path="/wallet/file-payment" element={<SlipPayment />} />
            {/* Add other routes as needed */}
          </Routes>
        </Content>
      
        
      </div>
    </>
  );
}

export default LayoutStudent;
