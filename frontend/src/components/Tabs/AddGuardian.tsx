import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Upload,
  Row,
  Col,
  Radio,
  Typography,

} from "antd";



type LivingWith = "parents" | "guardian";
const { Option } = Select;
const { Title } = Typography;
function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  // ถ้ายังไม่ถึงวันเกิดปีนี้ → ลบออก 1
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

function AddGuardian() {
  const [livingWith, setLivingWith] = useState<LivingWith>("parents");
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

const [isFatherInactive, setIsFatherInactive] = useState(false);
const [isMotherInactive, setIsMotherInactive] = useState(false);

const isInactiveStatus = (s: string) =>
  s.includes("เสียชีวิต") || s === "ติดต่อไม่ได้";

const DASH = {
  id: "-",
  title: "6",     // ค่า "-" ของคำนำหน้า (Option value="6")
  fnameTH: "-",
  lnameTH: "-",
  tel: "-",
  job: "-",
  dob: null,
  age: "-",
};

const handleStatusChange = (who: "father" | "mother" | "guardian", val: string) => {
  const inactive = isInactiveStatus(val);

  if (who === "father") setIsFatherInactive(inactive);
  if (who === "mother") setIsMotherInactive(inactive);

  if (inactive) {
    // ใส่ "-" และเคลียร์วันเกิดให้ทั้งก้อน
    form.setFieldsValue({ [who]: { ...DASH } } as any);
  } else {
    // ถ้าอยาก “ล้างเครื่องหมาย - ออก” เมื่อกลับมาเป็น "มีชีวิต"
    // ให้ปลดคอมเมนต์โค้ดนี้:
    const cur = form.getFieldValue(who) || {};
    const undash = (x: any) => (x === "-" ? undefined : x);
    form.setFieldsValue({
      [who]: {
        id: undash(cur.id),
        title: cur.title === "6" ? undefined : cur.title,
        fnameTH: undash(cur.fnameTH),
        lnameTH: undash(cur.lnameTH),
        Tel: undash(cur.Tel),
        job: undash(cur.job),
        dob: cur.dob ?? null,
        age: cur.age === "-" ? undefined : cur.age,
      },
    } as any);
  }
};
  

  const tabStyle = {
    background: "#ffffffff",
    padding: 24,
    borderRadius: 16,
    minwidth: "60vw",
    height: "flex",
    // justifyItems: "center",
    overflow: "auto",
  };

  const outerBox: React.CSSProperties = {
    width: 280,
    minHeight: 360,
    border: "1px solid #ccc",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    background: "#fff",
  };

  const imageBox: React.CSSProperties = {
    width: 200,
    height: 200,
    border: "1px solid #ccc",
    borderRadius: "50%",
    display: "flex",
    margin: "30px 0px 20px 0px",
    justifyContent: "center",
    alignItems: "center",
    background: "#717171",
    overflow: "hidden",
  };

  return (
    <div style={{ padding: 10 }}>
      {/* เนื้อหา AddGuardian */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={tabStyle}>
             <Form form={form} layout="vertical">
      {/* เลือกว่าอยู่กับใคร */}
      <Row gutter={16} justify="center">
        <Col span={24}>
          <Form.Item label="นักเรียนอาศัยอยู่กับ" name="livingWith" initialValue={livingWith}>
            <Radio.Group
              value={livingWith}
              onChange={(e) => {
                const v = e.target.value as LivingWith;
                setLivingWith(v);
                form.setFieldsValue({ livingWith: v });
                if (v === "parents") {
                  // ล้างค่าทั้งก้อนของผู้ปกครองเมื่อเลือกอยู่กับพ่อแม่
                  form.resetFields([["guardian"]]);
                }
              }}
            >
              <Radio value="parents">อยู่กับบิดามารดา</Radio>
              <Radio value="guardian">อยู่กับผู้ปกครอง</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      {/* --------- บิดา --------- */}
      <Title level={4} style={{ marginBottom: 20 }}>บิดา</Title>
      <Row gutter={16} justify="center">
        <Col span={10}>
          {/* แก้ name เป็นแบบซ้อน */}
          <Form.Item label="เลขบัตรประชาชน" name={["father","id"]}>
            <Input style={{ height: 35 }}  disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="คำนำหน้า" name={["father","title"]}>
            <Select style={{ height: 35 }}  disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}  >
              <Option value="1">นาย</Option>
              <Option value="2">นางสาว</Option>
              <Option value="3">นาง</Option>
              <Option value="4">เด็กชาย</Option>
              <Option value="5">เด็กหญิง</Option>
              <Option value="6">-</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item label="ชื่อ" name={["father","fnameTH"]}>
            <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}  />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="นามสกุล" name={["father","lnameTH"]}>
            <Input style={{ height: 35 }}  disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item label="เบอร์ติดต่อ" name={["father","tel"]}>
            <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="อาชีพ" name={["father","job"]}>
            <Input style={{ height: 35 }}  disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
          </Form.Item>
        </Col>

        <Col span={10}>
         <Form.Item label="วันเกิด" name={["father","dob"]}>
  <DatePicker
    style={{ width: "100%", height: 35 }}  disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} 
    onChange={(date) => {
      if (!date) return form.setFieldsValue({ father: { age: undefined } });
      const age = calculateAge(date.toDate());
      form.setFieldsValue({ father: { age } });
    }}
  />
</Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="อายุ" name={["father","age"]}>
            <Input disabled style={{ height: 35 }} />
          </Form.Item>
        </Col>

        <Col span={10}>
         <Form.Item label="สถานะ" name={["father","status"]}>
  <Select style={{ height: 35 }}
          onChange={(v) => handleStatusChange("father", v)}>
    <Option value="มีชีวิต">มีชีวิต</Option>
    <Option value="เสียชีวิต">เสียชีวิต</Option>
    <Option value="ติดต่อไม่ได้">ติดต่อไม่ได้</Option>
  </Select>
</Form.Item>
        </Col>
        <Col span={10}>
</Col>
      </Row>

      {/* --------- มารดา --------- */}
      <Title level={4} style={{ margin: "20px 0" }}>มารดา</Title>
      <Row gutter={16} justify="center">
        <Col span={10}>
          <Form.Item label="เลขบัตรประชาชน" name={["mother","id"]}>
            <Input style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}/>
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="คำนำหน้า" name={["mother","title"]}>
            <Select style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}>
              <Option value="1">นาย</Option>
              <Option value="2">นางสาว</Option>
              <Option value="3">นาง</Option>
              <Option value="4">เด็กชาย</Option>
              <Option value="5">เด็กหญิง</Option>
              <Option value="6">-</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item label="ชื่อ" name={["mother","fnameTH"]}>
            <Input style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}/>
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="นามสกุล" name={["mother","lnameTH"]}>
            <Input style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}/>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item label="เบอร์ติดต่อ" name={["mother","tel"]}>
            <Input style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}/>
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="อาชีพ" name={["mother","job"]}>
            <Input style={{ height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}/>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item label="วันเกิด" name={["mother","dob"]}>
            <DatePicker
              style={{ width: "100%", height: 35 }} disabled={isMotherInactive}
         placeholder={isMotherInactive ? "-" : undefined}
              onChange={(date) => {
                if (date) {
                  const age = calculateAge(date.toDate());
                  form.setFieldsValue({ mother: { age } });
                } else {
                  form.setFieldsValue({ mother: { age: undefined } });
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="อายุ" name={["mother","age"]}>
            <Input disabled style={{ height: 35 }} />
          </Form.Item>
        </Col>

        <Col span={10}>
         <Form.Item label="สถานะ" name={["mother","status"]}>
  <Select style={{ height: 35 }}
          onChange={(v) => handleStatusChange("mother", v)}>
    <Option value="มีชีวิต">มีชีวิต</Option>
    <Option value="เสียชีวิต">เสียชีวิต</Option>
    <Option value="ติดต่อไม่ได้">ติดต่อไม่ได้</Option>
  </Select>
</Form.Item>
        </Col>
        <Col span={10}>
</Col>
      </Row>

      {/* --------- ผู้ปกครอง (ซ่อนเมื่ออยู่กับพ่อแม่) --------- */}
      {livingWith === "guardian" && (
        <>
          <Title level={4} style={{ margin: "20px 0" }}>ผู้ปกครอง</Title>
          <Row gutter={16} justify="center">
            <Col span={10}>
              <Form.Item label="เลขบัตรประชาชน" name={["guardian","id"]}>
                <Input style={{ height: 35 }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="คำนำหน้า" name={["guardian","title"]}>
                <Select style={{ height: 35 }}>
                  <Option value="1">นาย</Option>
                  <Option value="2">นางสาว</Option>
                  <Option value="3">นาง</Option>
                  <Option value="4">เด็กชาย</Option>
                  <Option value="5">เด็กหญิง</Option>
                  <Option value="6">-</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item label="ชื่อ" name={["guardian","fnameTH"]}>
                <Input style={{ height: 35 }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="นามสกุล" name={["guardian","lnameTH"]}>
                <Input style={{ height: 35 }} />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item label="เบอร์ติดต่อ" name={["guardian","tel"]}>
                <Input style={{ height: 35 }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="อาชีพ" name={["guardian","job"]}>
                <Input style={{ height: 35 }} />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item label="วันเกิด" name={["guardian","dob"]}>
                <DatePicker
                  style={{ width: "100%", height: 35 }}
                  onChange={(date) => {
                    if (date) {
                      const age = calculateAge(date.toDate());
                      form.setFieldsValue({ guardian: { age } });
                    } else {
                      form.setFieldsValue({ guardian: { age: undefined } });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="อายุ" name={["guardian","age"]}>
                <Input disabled style={{ height: 35 }} />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item label="ความสัมพันธ์" name={["guardian","relation"]}>
                <Select style={{ height: 35 }}>
                  <Option value="ปู่">ปู่</Option>
                  <Option value="ย่า">ย่า</Option>
                  <Option value="ตา">ตา</Option>
                  <Option value="ยาย">ยาย</Option>
                  <Option value="ลุง">ลุง</Option>
                  <Option value="ป้า">ป้า</Option>
                  <Option value="น้า">น้า</Option>
                  <Option value="อา">อา</Option>
                  <Option value="พี่สาว">พี่สาว</Option>
                  <Option value="พี่ชาย">พี่ชาย</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
</Col>
          </Row>
        </>
      )}
    </Form>
          </div>
        </div>

        {/* อัปโหลด/ปุ่มด้านขวา */}
        <div style={outerBox}>
          <div style={imageBox}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "รูปภาพ"
            )}
          </div>

          {/* กลุ่มปุ่ม เรียงแนวตั้ง อยู่กลางกรอบ */}
          <Space
            direction="vertical"
            size="middle"
            style={{ width: "100%", alignItems: "center" }}
          >
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              // onChange={handleUpload}
              style={{ width: "100%" }}
            >
              <Button style={{ width: 150, height: 15 }}> เพิ่มรูปภาพ</Button>
            </Upload>

            <Button style={{ width: 150, height: 15, alignItems: "center" }}>
              บันทึกรูปภาพ
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}

export default AddGuardian;
