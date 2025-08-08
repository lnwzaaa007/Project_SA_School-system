
import { Link, Route,Routes, useNavigate,Outlet } from "react-router-dom";
import { Space, Table, Button, Col, Row, Divider, message, DatePicker, Input, Select } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined, IdcardOutlined ,PushpinFilled, ArrowLeftOutlined   } from "@ant-design/icons";
import { Gradient } from "@mui/icons-material";
const { Option } = Select;
import BackButton from "../../../components/BackButton";
import Upload from "../../../components/Upload";
import React, { useState } from "react";
import ModalSave from "../../../components/ModalSeve";
import MadalCancel from "../../../components/ModalCancel";
import UploadImages from "../../../components/UploadImages";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";



const AddInformation = () => {
  

  const navigate = useNavigate();
  
  return (
    <div style={{ background: "#F1EEE0", minHeight: "100vh" ,padding: "20px"}}>
      
      
        <div style={{justifyContent: "center",boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: '24px', background : "linear-gradient(to left, #ffffffff, #ffffffff)", minHeight: '80vh', maxWidth: '60%' ,borderRadius: "32px" ,marginLeft : "20%",marginTop:"20px"}} >
          <h1>ข้อมูลทั่วไป</h1>
          <Row style={{marginLeft : "87.5%"}}>
            <Col>
            <Link to="/enrollment/checkStatus">
            <Button  style={{padding: '24px', background:"#B3D286"}}>
                ตรวจสอบสถานะ
                </Button>
                </Link>
                </Col>
                </Row>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>เลขบัตรประชาชน</label>
              <Input placeholder="กรอกเลขบัตรประชาชน" />
            </Col>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>วันเกิด</label>
              <DatePicker style={{ width: "100%" }} />
            </Col>
          </Row>

          <Row gutter={[16, 12]}>
            <Col xs={24} md={3}>
              <label style= {{lineHeight: "2"}}>คำนำหน้า</label>
              <Select placeholder="เลือก" style={{ width: "100%" }}>
                <Option value="เด็กชาย">เด็กชาย</Option>
                <Option value="เด็กหญิง">เด็กหญิง</Option>
                <Option value="นาย">นาย</Option>
                <Option value="นาง">นาง</Option>
                <Option value="นางสาว">นางสาว</Option>
              </Select>
            </Col>

            <Col xs={24} md={9}>
              <label style= {{lineHeight: "2"}}>ชื่อ</label>
              <Input placeholder="ชื่อ" />
            </Col>

            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>นามสกุล</label>
              <Input placeholder="นามสกุล" />
            </Col>
        </Row>
    
        <Row  gutter={[16, 12]}>
          <Col xs={24} md={3}>
            <label style= {{lineHeight: "2"}}>Name Prefix</label>
            <Select placeholder="Select" style={{ width: "100%" }}>
                <Option value="Master">Master</Option>
                <Option value="Miss">Miss</Option>
              <Option value="Mr.">Mr.</Option>
              <Option value="Ms.">Ms.</Option>
            </Select>
          </Col>

          <Col xs={24} md={9}>
            <label style= {{lineHeight: "2"}}>FirstName</label>
            <Input placeholder="FirstName" />
          </Col>

          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>lastName</label>
            <Input placeholder="lastName" />
          </Col> 
        </Row>
      
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>สถานะ</label>
            <Select placeholder="เลือก" style={{ width: "100%" }}>
              <Option value="โสด">โสด</Option>
              <Option value="สมรส">สมรส</Option>
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>เพศ</label>
            <Select placeholder="เลือก" style={{ width: "100%" }}>
              <Option value="ชาย">ชาย</Option>
              <Option value="หญิง">หญิง</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <label style= {{lineHeight: "2"}}>ชั้น</label>
          <p></p>

            <SelectGrade/>
            
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>ห้อง</label>
            <p></p>
            <SelectClass/>
            
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>สัญชาติ</label>
            <Input />
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>ศาสนา</label>
            <Input />
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>เบอร์ติดต่อ</label>
            <Input />
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>E-mail</label>
            <Input />
          </Col>
        </Row>
        <Row gutter={[16, 12]}>

          <Col xs={24} md={12}>
             <label style= {{lineHeight: "2"}}>ปพ.1</label>
             <p> </p>
            <Upload />
          </Col>

          <Col xs={24} md={12}>
             <label style= {{lineHeight: "2"}}>สำเนาทะเบียนบ้าน</label>
             <p></p>
            <Upload />
          </Col> 

          <Col xs={24} md={12}>
             <label style= {{lineHeight: "2"}}>สำเนาบัตรประชาชน</label>
                <p></p>
            <Upload />
          </Col>
          <Col xs={24} md={12}>
             <label style= {{lineHeight: "2"}}>Upload รูปภาพ</label>
            <UploadImages />
          </Col>
          
        </Row>
        
    </div>
    

  
<div style={{marginLeft : "calc(44% + 24px)"}}>
          <Space>
            <ModalSave />
            <MadalCancel />
          </Space>
          
      
    </div>
    
    
   
    
    
</div>
  );
};

export default AddInformation;
