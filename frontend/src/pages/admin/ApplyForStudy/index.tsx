import React from 'react';
import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message, Input,Select,Modal } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined,AudioOutlined,SearchOutlined    } from "@ant-design/icons";
import type {GetProps} from "antd";
const { Option } = Select;
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
const ApplyForStudy = () => {
   
  return (
    <div style={{ padding: "20px", backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      
      <Row gutter={[16, 12]}>
        <Col xs={24} md={8} >
          
          <div style={{ minHeight: "20px",minWidth: "100%", backgroundColor: "#c0ffc0ff", padding: "20px", borderRadius: "8px" }}>
            <h3>Completed 0</h3>
          </div>
        </Col>
        <Col xs={24} md={8} >
          
          <div style={{ minHeight: "20px",minWidth: "100%", backgroundColor: "#D4EDFF", padding: "20px", borderRadius: "8px" }}>
            <h3>Waiting 0</h3>
          </div>
        </Col>
        <Col xs={24} md={8}>
          
          <div style={{ minHeight: "20px",minWidth: "100%", backgroundColor: "#FFE0E0", padding: "20px", borderRadius: "8px" }}>
            <h3>Unsuccessful 0</h3>
          </div>
        </Col>
      </Row>

      <div style={{ marginLeft: "15%",marginTop: "20px", padding: "16px", background: "#F1F1F1", minHeight: "calc(10vh - 60px)", width: "70%", borderRadius: "16px" }}>
        <div >
          <Row gutter={[24, 12]} style={{marginLeft: "15%", marginTop: "5px",marginBottom: "5px"}}>
            <Col xs ={24} md={6} >
              {/* <Space direction="vertical">
                <Search placeholder="ค้นหาชื่อผู้สมัคร" onSearch={onSearch} enterButton />
                
              </Space> */}
              <label>ชื่อผู้สมัคร</label>
              <Input placeholder="ค้นหาชื่อผู้สมัคร" />
            </Col>
            <Col xs ={24} md={6}>
              <label>ระดับชั้น</label>
                <Select placeholder="เลือก" style={{ width: "100%" }}>
                  <Option value="มัธยมศึกษาปีที่ 1">มัธยมศึกษาปีที่ 1</Option>
                  <Option value="มัธยมศึกษาปีที่ 2">มัธยมศึกษาปีที่ 2</Option>
                  <Option value="มัธยมศึกษาปีที่ 3">มัธยมศึกษาปีที่ 3</Option>
                  <Option value="มัธยมศึกษาปีที่ 4">มัธยมศึกษาปีที่ 4</Option>
                  <Option value="มัธยมศึกษาปีที่ 5">มัธยมศึกษาปีที่ 5</Option>
                  <Option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6</Option>
                </Select>
            </Col>
            <Col xs ={24} md={6}>
              <label>สถานะ</label>
                <Select placeholder="เลือก" style={{ width: "100%" }}>
                  <Option value="รอการอนุมัติ">รอการอนุมัติ</Option>
                  <Option value="อนุมัติ">อนุมัติ</Option>
                  <Option value="ไม่อนุมัติ">ไม่อนุมัติ</Option>
                  <Option value="ยกเลิก">ยกเลิก</Option>
                </Select>
            </Col>
            <Col xs ={24} md={6} style={{padding: "18px 6px"}}>
              
                <Button type='primary' icon={<SearchOutlined />}> ค้นหา</Button>
            </Col>
            </Row>
        </div>
      </div>
      <div style={{  marginTop: "20px", padding: "16px", background: "#F1F1F1", minHeight: "calc(100vh - 60px)", width: "100%",  }}>
        
      </div>
    </div>
  );
};

export default ApplyForStudy;