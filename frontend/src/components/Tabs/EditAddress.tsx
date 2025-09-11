// components/Tabs/EditAddress/index.tsx
import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Row, Col, Typography, message } from "antd";
import { useParams } from "react-router-dom";
import { addressCRUD_N, studentCRUD } from "../../services/https";
import SelectProvince from "../../components/SelectProvince";
import SelectDistrict from "../../components/SelectDistrict";
import SelectSubdistrict from "../../components/SelectSubdistrict";
import SelectZipcode from "../../components/SelectZipcode";
import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";

const { Title } = Typography;

const EditAddress: React.FC = () => {
  const [form] = Form.useForm();
  const { setAddress } = useStudentCreate();
  const params = useParams();
  const editingStudentId = params.id ? Number(params.id) : undefined;
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);

const loadedRef = useRef(false)
  useEffect(() => {
     if (!editingStudentId) return;
  if (loadedRef.current) return;     // ⬅️ กันรันซ้ำตอน provider re-render
  loadedRef.current = true;
    (async () => {
      try {
        const sres = await studentCRUD.getById(editingStudentId);
        const s = sres?.data?.data ?? sres?.data;
        const addrId = s?.address_id;
        if (!addrId) return;

        const ares = await addressCRUD_N.get(addrId); // GET /addressesN/:id
        const a = ares?.data?.data ?? ares?.data;
        if (!a) return;

        setSelectedProvince(Number(a.thai_province_id));
        setSelectedDistrict(Number(a.thai_district_id));
        setSelectedSubdistrict(Number(a.thai_subdistrict_id));
        setSelectedZipcode(null);

        form.setFieldsValue({
          address_number: a.address_number,
          road: a.road,
          province_id: Number(a.thai_province_id),
          district_id: Number(a.thai_district_id),
          subdistrict_id: Number(a.thai_subdistrict_id),
          zipcode_id: undefined, // entity ไม่มี zip ให้ปล่อยว่างได้
        });

        setAddress({
          address_number: a.address_number,
          road: a.road,
          province_id: Number(a.thai_province_id),
          district_id: Number(a.thai_district_id),
          subdistrict_id: Number(a.thai_subdistrict_id),
        });
      } catch (e: any) {
        message.error(e?.message || "โหลดที่อยู่ไม่สำเร็จ");
      }
    })();
  }, [editingStudentId]);

  const onChange = (_: any, all: any) => {
    setAddress({
      address_number: (all.address_number || "").trim(),
      road: (all.road || "").trim(),
      province_id: all?.province_id ? Number(all.province_id) : undefined,
      district_id: all?.district_id ? Number(all.district_id) : undefined,
      subdistrict_id: all?.subdistrict_id ? Number(all.subdistrict_id) : undefined,
      // zipcode_id: ไม่ได้ใช้เซฟใน entity นี้
    });
  };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0 }}>ที่อยู่ที่ติดต่อได้</Title>
          </div>

          <Form form={form} layout="vertical" onValuesChange={onChange} style={{ marginTop: 24 }}>
            <Row gutter={16} justify="center">
              <Col span={10}>
                <Form.Item label="รายละเอียด" name="address_number">
                  <Input style={{ height: 35 }} placeholder="เลขที่/หมู่/ซอย" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="ถนน" name="road">
                  <Input style={{ height: 35 }} placeholder="ถนน" />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item label="จังหวัด" name="province_id" rules={[{ required: true, message: "เลือกจังหวัด" }]}>
                  <SelectProvince
                    value={selectedProvince}
                    onChange={(v) => {
                      setSelectedProvince(v);
                      setSelectedDistrict(null);
                      setSelectedSubdistrict(null);
                      setSelectedZipcode(null);
                      form.setFieldsValue({ district_id: undefined, subdistrict_id: undefined, zipcode_id: undefined });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item label="อำเภอ" name="district_id" rules={[{ required: true, message: "เลือกอำเภอ" }]}>
                  <SelectDistrict
                    provinceId={selectedProvince}
                    value={selectedDistrict}
                    onChange={(v) => {
                      setSelectedDistrict(v);
                      setSelectedSubdistrict(null);
                      setSelectedZipcode(null);
                      form.setFieldsValue({ subdistrict_id: undefined, zipcode_id: undefined });
                    }}
                    disabled={!selectedProvince}
                  />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item label="ตำบล" name="subdistrict_id" rules={[{ required: true, message: "เลือกตำบล" }]}>
                  <SelectSubdistrict
                    districtId={selectedDistrict}
                    value={selectedSubdistrict}
                    onChange={(v) => {
                      setSelectedSubdistrict(v);
                      setSelectedZipcode(null);
                      form.setFieldsValue({ zipcode_id: undefined });
                    }}
                    disabled={!selectedDistrict}
                  />
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item label="รหัสไปรษณีย์" name="zipcode_id">
                  <SelectZipcode
                    subdistrictId={selectedSubdistrict}
                    value={selectedZipcode}
                    onChange={(v) => setSelectedZipcode(v)}
                    disabled={!selectedSubdistrict}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditAddress;
