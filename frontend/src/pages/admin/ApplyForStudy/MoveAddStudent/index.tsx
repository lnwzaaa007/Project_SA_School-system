
import { Link, Route, useNavigate,Outlet } from "react-router-dom";
import { Space, Table, Button, Col, Row, Divider, message, DatePicker, Input, Select } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined, IdcardOutlined ,PushpinFilled, ArrowLeftOutlined   } from "@ant-design/icons";
import { Gradient } from "@mui/icons-material";
const { Option } = Select;
import BackButton from "../../../../components/BackButton";
import Upload from "../../../../components/Upload";
import React, { useState } from "react";
import ModalSave from "../../../../components/ModalSeve";
import MadalCancel from "../../../../components/ModalCancel";
import UploadImages from "../../../../components/UploadImages";
import SelectGrade from "../../../../components/SelectGrade";
import SelectClass from "../../../../components/SelectClass";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleTH from "../../../../components/SelectTitleTH";
import SelectTitleENG from "../../../../components/SelectTitleENG";


const MoveAddStudent = () => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [selectedTitleTH, setSelectedTitleTH] = useState<number | null>(null);
  const [selectedTitleENG, setSelectedTitleENG] = useState<number | null>(null);
  const navigate = useNavigate();
  
  return (
 
      <div>
      
        
          <h1>ข้อมูลทั่วไป</h1>
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
              <SelectTitleTH value={selectedTitleTH} onChange={setSelectedTitleTH}/>

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
            <SelectTitleENG value={selectedTitleENG} onChange={setSelectedTitleENG}/>

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
            <p></p>
            <SelectGender value={selectedGender} onChange={setSelectedGender} />
          </Col>
        </Row>
        <Row gutter={[16, 12]} >
          <Col  xs={24} md={12} >
          <label style= {{lineHeight: "2"}}>ชั้น</label>
          <p></p>

            <SelectGrade value={selectedGrade} onChange={setSelectedGrade}/>
            
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>ห้อง</label>
            <p></p>
            <SelectClass value={selectedClass} onChange={setSelectedClass}/>
            
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

          <Col xs={24} md={6}>
             <label style= {{lineHeight: "2"}}>ปพ.1</label>
             <p> </p>
            <Upload />
          </Col>
<Col xs={24} md={6} style={{marginTop:"40px"}}>
             <label style= {{lineHeight: "2"}}>Upload รูปภาพ</label>
            <UploadImages />
          </Col>

 
        </Row>
        <Row gutter={[16, 12]} style={{marginTop:"-80px"}}>
          <Col xs={24} md={6}>
             <label style= {{lineHeight: "2"}}>สำเนาบัตรประชาชน</label>
                <p></p>
            <Upload />
          </Col>
          
          
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={6}>
             <label style= {{lineHeight: "2"}}>สำเนาทะเบียนบ้าน</label>
             <p></p>
            <Upload />
          </Col>
        </Row>
        
        <div style={{display:"flex",justifyContent:"end",marginLeft : "calc(44% + 24px)"}}>
          <Space>
            <ModalSave />
            <MadalCancel />
          </Space>
      
    </div>

    

  


   </div> 
    
    

  );
};

export default MoveAddStudent;
