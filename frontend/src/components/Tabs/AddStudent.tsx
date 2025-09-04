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
  Typography,
  AutoComplete,
  message,
  Modal,
  type AutoCompleteProps,
} from "antd";

// import type { UploadProps } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

// const handleUpload = (info: UploadChangeParam<UploadFile>) => {
//   const file = info.file.originFileObj as File | undefined;
//   if (!file) return;
//   setImageUrl(URL.createObjectURL(file));
// };
import ModalSave from "../Tabs/ModalSave";
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
// --- state สำหรับโหมดแก้ไขรูป ---

// ใช้รูปแสดงผลอยู่แล้ว: const [imageUrl, setImageUrl] = useState<string | null>(null);

// อัปเดตรูปตัวอย่างทันทีเมื่อเลือกไฟล์ (ยังไม่อัพขึ้นเซิร์ฟเวอร์)
// const handleUpload = (info: UploadChangeParam<UploadFile>) => {
//   const file = info.file.originFileObj as File | undefined;
//   if (!file) return;
//   const url = URL.createObjectURL(file);
//   setImageUrl(url);
// };

// ตอนกด “บันทึกรูปภาพ” ใน Modal → ที่นี่คือจุดเรียก API อัพโหลดจริงถ้าต้องการ
// const handleConfirmSave = async () => {
//   try {
//     // TODO: เรียก API อัพโหลด/บันทึกจริงที่นี่ (ถ้ามี)
//     // await api.post('/upload', formData)

//     message.success("บันทึกรูปภาพแล้ว");
//     setSaveModalOpen(false);
//     setIsEditingImage(false); // กลับไปโหมดปุ่มเดียว
//   } catch (e: any) {
//     message.error(e?.message || "บันทึกไม่สำเร็จ");
//   }
// };

// import { Route, Routes } from "react-router-dom";
const { Option } = Select;
const { Title } = Typography;
const onChange = (value: string) => {
  console.log(`selected ${value}`);
};

const onSearch = (value: string) => {
  console.log('search:', value);
};

function AddStudent() {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const handleConfirmSave = async () => {
  try {
    // TODO: เรียก API อัพโหลด/บันทึกจริงที่นี่ (ถ้ามี)
    // await api.post('/upload', formData)

    message.success("บันทึกรูปภาพแล้ว");
    setSaveModalOpen(false);
    setIsEditingImage(false); // กลับไปโหมดปุ่มเดียว
  } catch (e: any) {
    message.error(e?.message || "บันทึกไม่สำเร็จ");
  }
};
const handleUpload = (info: UploadChangeParam<UploadFile>) => {
  const file = info.file.originFileObj as File | undefined;
  if (!file) return;
  setImageUrl(URL.createObjectURL(file));
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
    // height: 200,
    aspectRatio: '1 / 1',   
    border: "1px solid #ccc",
    borderRadius: "50%",
    display: "flex",
    margin: "30px 0px 20px 0px",
    justifyContent: "center",
    alignItems: "center",
    background: "#717171",
    overflow: "hidden",
  };
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const domains = ["gmail.com", "hotmail.com", "icloud.com"];
  const handleSearch = (value: string) => {
  if (!value || value.includes("@")) {
  setOptions([]);
    return;
  }
  setOptions(
    domains.map((domain) => ({
      label: `${value}@${domain}`,
      value: `${value}@${domain}`,
    }))
  );
};
  return (
    <div style={{ padding: 10 }}>
      {/* เนื้อหา AddStudent */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={tabStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
  <Title level={4} style={{ margin: 0 }}>
    ข้อมูลทั่วไป
  </Title>
         <ModalSave
              style={{
                // width: 150,
                // height: 15,
                // marginTop: 240,
                background: "#ffffffff",
                color: "#000",
                border: "1px solid #ccc",
              }}
            />
</div>

            <Form form={form} layout="vertical">
              <Row gutter={16} justify="center">
                <Col span={20}>
                  <Form.Item label="รหัสนักศึกษา" name="student_id">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="เลขบัตรประชาชน" name="citizen_id">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
              
 <Col span={10}>
                  <Form.Item label="คำนำหน้า" name={["Guardian", "title_id"]}>
                    <Select style={{ height: "35px" }}>
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
                  <Form.Item label="ชื่อ" name="t_first_name">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="นามสกุล" name="t_last_name">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
<Col span={10}>
                 <Form.Item label="วันเกิด" name="date_of_birth">
  <DatePicker
    style={{ width: "100%" ,height: "35px"}}
    onChange={(date) => {
      if (date) {
        const jsDate = date.toDate(); // แปลง Dayjs → JS Date
        const age = calculateAge(jsDate);
        form.setFieldsValue({ age }); // อัปเดตฟิลด์อายุในฟอร์ม
      }
    }}
  />
</Form.Item>
 </Col>
 <Col span={10}>
<Form.Item label="อายุ" name="age">
  <Input disabled style={{ height: "35px" }}/>
</Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="สถานะ" name="status">
                    <Select style={{ height: "35px" }}>
                      <Option value="single">โสด</Option>
                      <Option value="married">สมรส</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="เพศ" name="gender">
                    <Select style={{ height: "35px" }}>
                      <Option value="male">ชาย</Option>
                      <Option value="female">หญิง</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ชั้นปี" name="grade_year">
                    <Select style={{ height: "35px" }}>
                      <Option>1</Option>
                      <Option>2</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="ห้อง" name="glade_class">
                    <Select style={{ height: "35px" }}>
                      <Option>1</Option>
                      <Option>2</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="Firstname" name="e_first_name">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="Lastname" name="e_last_name">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="สัญชาติ" name="nationality">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="ศาสนา" name="religious">
                    <Select
                  showSearch
                  // placeholder="Select a person"
                  optionFilterProp="label"
                  onChange={onChange}
                  onSearch={onSearch}
                  options={[
                    {
                      value: 'พุทธ',
                      label: 'พุทธ',
                    },
                    {
                      value: 'คริสต์',
                      label: 'คริสต์',
                    }, 
                    {
                      value: 'อิสลาม',
                      label: 'อิสลาม',
                    },
                  ]}
                />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="เบอร์ติดต่อ" name="tel">
                    <Input style={{ height: "35px" }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                <Form.Item label="Email" name="email">
    <AutoComplete
      style={{ width: "100%" }}      // แนะนำใช้ width มากกว่า height
      options={options}
      onSearch={handleSearch}
      // placeholder="พิมพ์ชื่อก่อน @ เช่น attapinya"
      // onSelect={(v) => form.setFieldValue('email', v)} // ถ้าอยากอัปเดตฟิลด์ทันทีเมื่อคลิกรายการ
    />
  </Form.Item>
                </Col>
              </Row>
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
           <Space direction="vertical" size="middle" style={{ width: "100%", alignItems: "center" }}>
    {!isEditingImage ? (
      // สเต็ป 1: มีปุ่มเดียว
      <Button style={{ width: 150, height: 32 }} onClick={() => setIsEditingImage(true)}>
        แก้ไขรูปภาพ
      </Button>
    ) : (
      <>
        {/* สเต็ป 2: โชว์ 2 ปุ่ม อัปโหลด + บันทึก */}
       <Upload
  showUploadList={false}
  beforeUpload={() => false}
  onChange={handleUpload}   // <- ตรงนี้
>
  <Button>อัปโหลดรูปภาพ</Button>
</Upload>
    <Space
  direction="vertical"
  size="middle"
  style={{ width: "100%", alignItems: "center" }}  // จัดกลาง
>
  <Button
    type="primary"
    style={{ width: 150, height: 32 }}
    onClick={() => setSaveModalOpen(true)}
    disabled={!imageUrl}
  >
    บันทึกรูปภาพ
  </Button>

  <Button
    style={{ width: 120, height: 32 }}
    onClick={() => setIsEditingImage(false)}
  >
    ยกเลิก
  </Button>
</Space>
      </>
    )}
  </Space>
{/* Modal ยืนยันการบันทึก */}
  <Modal
    open={saveModalOpen}
    title="บันทึกรูปภาพ?"
    onOk={handleConfirmSave}
    onCancel={() => setSaveModalOpen(false)}
    okText="บันทึก"
    cancelText="ยกเลิก"
  >
    ต้องการบันทึกรูปภาพนี้หรือไม่
  </Modal>
</div>
      </div>
    </div>
  );
}

export default AddStudent;
