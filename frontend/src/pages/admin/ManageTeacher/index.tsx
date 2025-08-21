import React from 'react';
import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message, Input,Modal } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined,AudioOutlined   } from "@ant-design/icons";
import type {GetProps} from "antd";

import { Link, Route, useNavigate,Outlet } from "react-router-dom";
import dayjs from "dayjs";
import { Content } from 'antd/es/layout/layout';
import ModalDelete from "../../../components/ModalDelete";


type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: '#1677ff',
    }}
  />
);

const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
const ManageTeacher = () => {
  const navigate = useNavigate();
  
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const showModal = () => {
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      setIsModalOpen(false);
      navigate("EditTeacher");
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };
  return (
      
     <div style={{ padding: "16px", background: "#fff", minHeight: "calc(100vh - 60px)",width: "100%" }}>
      <Space direction="vertical">
    
    
    <Search style={{ marginTop: 20 }} placeholder="ค้นหาชื่อครู" onSearch={onSearch} enterButton />
    
  </Space>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          
        </Col>
        <Col>
          <Space >
            <Link to="CreateTeacher">
              <Button type="primary" icon={<PlusOutlined />} style={{backgroundColor:"#0088ff"}}>
                เพิ่ม
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <div style={{ padding: "16px", background: "#E9F6FF", minHeight: "calc(10vh - 60px)",width: "100%", borderRadius: "16px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col >
          <p>ชื่อ-นามสกุล</p>
        </Col>
        <Col>
          <Space>
            
            <ModalDelete />
            
            
            <Button
              type="primary"
              icon={<FormOutlined />}
              style={{ backgroundColor: "#ffca00" }}
              onClick={showModal}
            >
              แก้ไข
            </Button>

            <Modal
              title="คุณแน่ใจหรือไม่?"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel} // ✅ ยกเลิกแค่ปิด modal ไม่ต้อง navigate
              okText="ยืนยัน"
              cancelText="ยกเลิก"
              centered
            >
              <p>คุณต้องการแก้ไขข้อมูลนี้หรือไม่?</p>
            </Modal>

            <Outlet />
          </Space>
        </Col>
      </Row>
     
      </div>
    </div>
    
    
  );
};
export default ManageTeacher;
