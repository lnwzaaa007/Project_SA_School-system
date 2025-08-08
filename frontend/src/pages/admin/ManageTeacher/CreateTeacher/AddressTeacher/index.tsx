import { Gradient } from "@mui/icons-material";
import { Space, Table, Button, Col, Row, Divider, message, DatePicker, Input, Select } from "antd";
const { Option } = Select;
import { Link, Route, useNavigate,Outlet } from "react-router-dom";
import { PlusOutlined, DeleteOutlined, FormOutlined, IdcardOutlined ,PushpinFilled   } from "@ant-design/icons";
import BackButton from "../../../../../components/BackButton";
import React, { useState } from "react";
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
    <div>
      <BackButton />
      <div style={{marginLeft : "13%", padding: '24px', background : "linear-gradient(to left, #83b1ffff, #ffffffff)", minHeight: '50vh', maxWidth: '75%' ,borderRadius: "32px" }}>
        <h1>ที่อยู่ปัจจุบัน</h1>
        <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <label style= {{lineHeight: "2"}}>เลขบัตรประชาชน</label>
              <Input placeholder="กรอกเลขบัตรประชาชน" />
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
            <Button type="primary" style={{ marginTop: '16px' }} onClick={() => navigate(-2)}>บันทึก</Button>
            <Button type="default" style={{ marginLeft: '8px', marginTop: '16px' }} onClick={() => navigate(-1)}>ยกเลิก</Button>
      </div>

    
    
    
    
      
    </div>
  );
};
export default ManageTeacher;