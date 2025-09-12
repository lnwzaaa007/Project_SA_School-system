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
import UploadImages from "../../../components/UploadImages";
import TableApplyForStudy from '../../../components/TableApplyForStudy';
import SelectGrade from "../../../components/SelectGrade";
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
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
   
  return (
    <div style={{ padding: "20px", backgroundColor: "#ffffffff", minHeight: "100vh" }}>
      
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

      <div style={{display:"flex", justifyContent:"center",marginTop: "20px", padding: "16px", background: "#F1F1F1", minHeight: "calc(10vh - 60px)", width: "70%", borderRadius: "16px",marginLeft:"15%" }}>
        <div >
          <Row gutter={[24, 12]} style={{ marginTop: "5px",marginBottom: "5px",}}>
            <Col xs ={24} md={6} >
              <label>ชื่อผู้สมัคร</label>
              <Input style={{ width: "100%",height:"45px"  }} placeholder="ค้นหาชื่อผู้สมัคร" 
              />
            </Col>
            <Col xs ={24} md={6}>
              <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label>ระดับชั้น</label>
                <SelectGrade value={selectedGrade} onChange={setSelectedGrade} />
                </div>
              
            </Col>
            <Col xs ={24} md={6}>
              <label>สถานะ</label>
                <Select placeholder="เลือก" style={{ width: "100%",height:"45px"  }}>
                  <Option value="รอการอนุมัติ">รอการอนุมัติ</Option>
                  <Option value="อนุมัติ">อนุมัติ</Option>
                  <Option value="ไม่อนุมัติ">ไม่อนุมัติ</Option>
                  <Option value="ยกเลิก">ยกเลิก</Option>
                </Select>
            </Col>
            <Col xs ={24} md={6} style={{padding: "18px 6px"}}>
                
                <Button type='primary' icon={<SearchOutlined />} onClick={() => alert(`ไม่พบข้อมูล `)}> ค้นหา</Button>
                
            </Col>
            </Row>
        </div>
      </div>
      <div style={{  marginTop: "20px", padding: "16px", background: "#F1F1F1", minHeight: "auto", width: "100%",  }}>
        
        <TableApplyForStudy />
      </div>
      
    </div>
  );
};

export default ApplyForStudy;