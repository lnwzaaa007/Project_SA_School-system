
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
 const provinces = [
  {
    name: "กรุงเทพมหานคร",
    districts: [{ name: "เขตพระนคร", subdistricts: [{name : "พระบรมมหาราชวัง" ,postcode: ["10100"]},{ name : "วังบูรพาภิรมย์", postcode: ["10200", "10300"] },]},
                { name: "เขตดุสิต", subdistricts: [{name :"สวนจิตรลดา", postcode: [10300]},{name : "ดุสิต",postcode: [10400]}],
      }
    ]
  },
  {
    name: "เชียงใหม่",
    districts: [
      {
        name: "เมืองเชียงใหม่",
        subdistricts: [{name :"ศรีภูมิ", postcode: [50200]}, {name:"ช้างเผือก",postcode: [50200]}],
      }
    ]
  }
];

const ManageTeacher = () => {
  // const navigate = useNavigate();
  // return (
  //   <div style={{ padding: "16px",marginLeft: "34%"}}>
  //     <Row justify="space-between" align="middle" style={{ marginBottom: 24, marginTop: 24 }}>
              
  //             <Col>
  //               <Space>
  //                 <Button icon={<ArrowLeftOutlined />} style={{padding: "32px 32px"}} onClick={() => navigate(-1)}>
  //                   กลับ
  //                 </Button >
  //                 <Link to="DataTeacher">
  //                   <Button  icon={<IdcardOutlined />} style={{padding: "32px 32px"}} >
  //                     ข้อมูลทั่วไป
  //                   </Button>
  //                 </Link>

  //                  <Link to="AddressTeacher">
  //                   <Button  icon={<PushpinFilled />} style={{padding: "32px 32px"}}>
  //                     ที่อยู่
  //                   </Button>
  //                 </Link>
  //               </Space>
  //             </Col>
  //     </Row>
      
          
          
        

  //   </div>
  // );

  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedSubdisistrict, setSelectedSubdisistrict] = useState(null);
  
    const handleProvinceChange = (value: React.SetStateAction<null>) => {
      setSelectedProvince(value);
      setSelectedDistrict(null); // reset อำเภอ
    };
  
    const handleDistrictChange = (value: React.SetStateAction<null>) => {
      setSelectedDistrict(value);
    };
  
    const handleSubdistrictChange = (value: React.SetStateAction<null>) => {
      setSelectedSubdisistrict(value);
    };
  
    const getDistricts = () => {
      const province = provinces.find((p) => p.name === selectedProvince);
      return province ? province.districts : [];
    };
  
    const getSubdistricts = () => {
      const district = getDistricts().find((d) => d.name === selectedDistrict);
      return district ? district.subdistricts : [];
    };
  
    const getPostcode = () => {
    const subdistrict = getSubdistricts().find((s) => s.name === selectedSubdisistrict);
    return subdistrict ? subdistrict.postcode : [];
  };
  return (
    <div >
      <BackButton />
      
        <div style={{justifyContent: "center",boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: '24px', background : "linear-gradient(to left, #ffffffff, #ffffffff)", minHeight: '80vh', maxWidth: '60%' ,borderRadius: "32px" ,marginLeft : "20%"}} >
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
              <Select placeholder="เลือก" style={{ width: "100%" }}>
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
              <Select style={{ width: "100%" }} placeholder="เลือกจังหวัด" onChange={handleProvinceChange} value={selectedProvince}>
                {provinces.map((province) => (<Option key={province.name} value={province.name}>
                  {province.name}
            </Option>
          ))}
        </Select>
          
            </Col>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>อำเภอ</label>
        <Select
          style={{ width: "100%" }}
          placeholder="เลือกอำเภอ"
          onChange={handleDistrictChange}
          value={selectedDistrict}
          disabled={!selectedProvince}
        >
          {getDistricts().map((district) => (
            <Option key={district.name} value={district.name}>
              {district.name}
            </Option>
          ))}
        </Select>
            </Col>
          </Row>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>ตำบล</label>
        <Select
          style={{ width: "100%" }}
          placeholder="เลือกตำบล"
          onChange={handleSubdistrictChange}
          value={selectedSubdisistrict}
          disabled={!selectedDistrict}
        >
          {getSubdistricts().map((subdistrict) => (
            <Option key={subdistrict.name} value={subdistrict.name}>
              {subdistrict.name}
            </Option>
          ))}
        </Select>
            </Col>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>รหัสไปรษณีย์</label>
              <Select
          style={{ width: "100%" }}
          placeholder="เลือกรหัสไปรษณีย์"
          disabled={!selectedSubdisistrict}
        >
          {getPostcode().map((postcode) => (
            <Option key={postcode} value={postcode}>
              {postcode}
            </Option>
          ))}
        </Select>
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

export default ManageTeacher;
