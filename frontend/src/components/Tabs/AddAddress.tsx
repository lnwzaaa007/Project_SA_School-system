import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Typography, message } from "antd";
import { addressCRUD_N } from "../../services/https"; // ปรับ path ให้ตรงของคุณ


import SelectProvince from "../../components/SelectProvince";
import SelectDistrict from "../../components/SelectDistrict";
import SelectSubdistrict from "../../components/SelectSubdistrict";
import SelectZipcode from "../../components/SelectZipcode";
import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";

const { Title } = Typography;

const AddAddress: React.FC = () => {
  const [form] = Form.useForm();

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);;
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);
  const { setAddress } = useStudentCreate();

   const onChange = (_: any, all: any) => {
    setAddress({
      address_number: (all.address_number || "").trim(),
      road: (all.road || "").trim(),
      province_id: all?.province_id ? Number(all.province_id) : undefined,
      district_id: all?.district_id ? Number(all.district_id) : undefined,
      subdistrict_id: all?.subdistrict_id ? Number(all.subdistrict_id) : undefined,
      zipcode_id: all?.zipcode_id ? Number(all.zipcode_id) : undefined,
    });
  };

  // --- handlers: อัปเดตทั้ง state และค่าในฟอร์ม ---
  const handleProvinceChange = (value: number | null) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setSelectedZipcode(null);
    form.setFieldsValue({
      province_id: value ?? undefined,
      district_id: undefined,
      subdistrict_id: undefined,
      zipcode_id: undefined,
    });
  };

  const handleDistrictChange = (value: number | null) => {
    setSelectedDistrict(value);
    setSelectedSubdistrict(null);
    setSelectedZipcode(null);
    form.setFieldsValue({
      district_id: value ?? undefined,
      subdistrict_id: undefined,
      zipcode_id: undefined,
    });
  };

  const handleSubdistrictChange = (value: number | null) => {
    setSelectedSubdistrict(value);
    setSelectedZipcode(null);
    form.setFieldsValue({
      subdistrict_id: value ?? undefined,
      zipcode_id: undefined,
    });
  };

  const handleZipcodeChange = (value: number | null) => {
    setSelectedZipcode(value);
    form.setFieldsValue({ zipcode_id: value ?? undefined });
  };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Title level={4} style={{ margin: 0 }}>ที่อยู่ที่ติดต่อได้</Title>
            </div>

            <Form form={form} layout="vertical" onValuesChange={onChange} style={{ marginTop: 24 }}>
              <Row gutter={16} justify="center">
                <Col span={10}>
                  <Form.Item label="รายละเอียด" name="address_number">
                    <Input type="text" style={{ height: 35 }} placeholder="เช่น เลขที่/หมู่/ซอย" />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ถนน" name="road">
                    <Input style={{ height: 35 }} placeholder="ถนน" />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="จังหวัด" name="province_id">
                    <SelectProvince value={selectedProvince} onChange={handleProvinceChange} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="อำเภอ" name="district_id">
                    <SelectDistrict 
              
                provinceId={selectedProvince}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              
                    />
                  </Form.Item>
                </Col>


                <Col span={10}>
<Form.Item label="ตำบล" name="subdistrict_id">
 <SelectSubdistrict
          
          districtId={selectedDistrict}
          onChange={handleSubdistrictChange}
          value={selectedSubdistrict}
          disabled={!selectedDistrict}
        />
</Form.Item>

                </Col>

                <Col span={10}>
                  <Form.Item label="ไปรษณีย์" name="zipcode_id">
                     <SelectZipcode
              
                      subdistrictId={selectedSubdistrict}
                      onChange={handleZipcodeChange}
                      value={selectedZipcode}
                      disabled={!selectedSubdistrict}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
