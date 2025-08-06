import React from 'react';
import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message, Input, } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined,AudioOutlined   } from "@ant-design/icons";
import type {GetProps} from "antd";

import { Link, Route, useNavigate,Outlet } from "react-router-dom";
import dayjs from "dayjs";
import { Content } from 'antd/es/layout/layout';
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
  return (
      
     <div style={{ padding: "16px", background: "#fff", minHeight: "calc(100vh - 60px)",width: "100%" }}>
      <Space direction="vertical">
    
    
    <Search placeholder="ค้นหาชื่อครู" onSearch={onSearch} enterButton />
    
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
            {/* <Button type="primary" icon={<PlusOutlined />}  style={{backgroundColor:"#0088ff"}}  >
              เพิ่ม
            </Button> */}
            {/* <Link to ="DeleteTeacher">
            <Button type="primary" icon={<DeleteOutlined />} style={{backgroundColor:"#0088ff"}}>
                ลบ
              </Button>
            </Link>
            
            <Link to ="EditTeacher">
              <Button type="primary" icon={<FormOutlined />} style={{backgroundColor:"#0088ff"}}>
                แก้ไข
              </Button>
            </Link> */}
          </Space>
        </Col>
      </Row>

      <div style={{ padding: "16px", background: "#E9F6FF", minHeight: "calc(10vh - 60px)",width: "100%", borderRadius: "16px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col >
          <p style={{ marginTop: 10}}>ชื่อ-นามสกุล</p>
        </Col>
        <Col>
          <Space>
            
            {/* <Button type="primary" icon={<DeleteOutlined /> } style={{background:"#ff1818ff"}}>
              ลบ
            </Button>
            <Button type="primary" icon={<FormOutlined />}>
              แก้ไข
            </Button> */}
            
            <Button type="primary" icon={<DeleteOutlined />} style={{backgroundColor:"#ff1818ff"}}>
                ลบ
              </Button>
            
            
            <Link to ="EditTeacher">
              <Button type="primary" icon={<FormOutlined />} style={{backgroundColor:"#0088ff"}}>
                แก้ไข
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
     
      </div>
    </div>
    
    
  );
};
export default ManageTeacher;
