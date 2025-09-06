
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
import SelectProvince from "../../../../components/SelectProvince";
import SelectDistrict from "../../../../components/SelectDistrict";
import SelectSubdistrict from "../../../../components/SelectSubdistrict";
import SelectZipcode from "../../../../components/SelectZipcode";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleENG from "../../../../components/SelectTitleENG";
import SelectTitleTH from "../../../../components/SelectTitleTH";



const ManageTeacher = () => {
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);;
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [selectedTitleTH, setSelectedTitleTH] = useState<number | null>(null);
  const [selectedTitleENG, setSelectedTitleENG] = useState<number | null>(null);

    const handleProvinceChange = (value: React.SetStateAction<number | null>) => {
      setSelectedProvince(value);
      setSelectedDistrict(null); // reset อำเภอ
       setSelectedSubdistrict(null);
       setSelectedZipcode(null);
    };
  
    const handleDistrictChange = (value: React.SetStateAction<number |null>) => {
      setSelectedDistrict(value);
      setSelectedSubdistrict(null);
      setSelectedZipcode(null);
    };

  
    const handleSubdistrictChange = (value: React.SetStateAction<number |null>) => {
      setSelectedSubdistrict(value);
      setSelectedZipcode(null);
    };
    
    const handleZipcodeChange = (value: React.SetStateAction<number |null>) => {
      setSelectedZipcode(value);};

  
  return (
    <div >
      
      
        <div style={{justifyContent: "center", padding: '48px', background : "linear-gradient(to left, #ffffffff, #ffffffff)", minHeight: '80vh', maxWidth: '100%' ,borderRadius: "16px"}} >
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
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>จบการศึกษา (สาขา)</label>
            <p></p>
            <Input placeholder="Ex. วิทยาการคอมพิวเตอร์" />
          </Col>
          <Col xs={24} md={12}>
            <label style= {{lineHeight: "2"}}>แนบไฟล์วุฒิ</label>
            <p></p>
            <Upload />
            
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
             <label style= {{lineHeight: "2"}}>Upload รูปภาพ</label>
            <UploadImages />
          </Col>
          
        </Row>
        <h1>ที่อยู่ปัจจุบัน</h1>
        <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>บ้านเลขที่</label>
              <Input placeholder="กรอกบ้านเลขที่" />
            </Col>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>ถนน</label>
              <Input placeholder="กรอกถนน" />
            </Col>
          </Row>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>จังหวัด</label>
              <div></div>
              <SelectProvince value={selectedProvince} onChange={handleProvinceChange} />
          
            </Col>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>อำเภอ/เขต</label>
              <div></div>
              <SelectDistrict 
                provinceId={selectedProvince}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              
               />
          
            </Col>
             </Row>
             <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>ตำบล</label>
        <SelectSubdistrict
          
          districtId={selectedDistrict}
          onChange={handleSubdistrictChange}
          value={selectedSubdistrict}
          disabled={!selectedDistrict}
        />
        </Col>

        <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>รหัสไปรษณีย์</label>
              <SelectZipcode
          subdistrictId={selectedSubdistrict}
          onChange={handleZipcodeChange}
          value={selectedZipcode}
          disabled={!selectedSubdistrict}
        /></Col>
        </Row>
           
         
          <div style={{display:"flex", justifyContent:"end",marginTop:"16px"}}>
          <Space>
            <ModalSave />
            <MadalCancel />
          </Space>
      
    </div>
    </div>
    

  


    
    
    
  </div>
  );

};
export default ManageTeacher;
