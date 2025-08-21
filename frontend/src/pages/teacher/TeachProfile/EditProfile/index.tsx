import React from "react";
import { Form, Input, DatePicker, Select, Button, Card,Row,Col } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./EditProfile.css";

const { Option } = Select;

const EditProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const teacherData = location.state; // รับค่าจากหน้า Profile

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("ข้อมูลที่แก้ไขแล้ว:", values);
    // ส่งข้อมูลไปบันทึก API หรือ state manager
    navigate(-1); // กลับไปหน้าก่อน
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 50, fontSize:"24px" }}>
      <Card style={{ width: "100%", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" , fontSize:"24px" }}>
        <h2 style={{ marginBottom: 20 }}>แก้ไขข้อมูลครู</h2>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...teacherData,
            birthday: teacherData.birthday ? dayjs(teacherData.birthday) : null,
          }}
          onFinish={onFinish}
        > 
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item  name="id" label="รหัสครู" >
            <Input disabled />
          </Form.Item>
          </Col>
          <Col xs={24} md={12}>
          <Form.Item name="name" label="ชื่อ-นามสกุล" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
            <Input />
          </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item name="gender" label="เพศ" >
            <Select>
              <Option value="ชาย">ชาย</Option>
              <Option value="หญิง">หญิง</Option>
              <Option value="อื่นๆ">อื่นๆ</Option>
            </Select>
          </Form.Item>
          </Col>
          <Col xs={24} md={12}>
          <Form.Item name="citizenId" label="เลขบัตรประชาชน">
            <Input maxLength={13} />
          </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item name="birthday" label="วันเกิด">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          </Col>
          <Col xs={24} md={12}>
          <Form.Item name="status" label="สถานะ">
            <Select>
              <Option value="โสด">โสด</Option>
              <Option value="สมรส">สมรส</Option>
              <Option value="หย่า">หย่า</Option>
            </Select>
          </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item name="education" label="วุฒิการศึกษา">
            <Input />
          </Form.Item>
          </Col>

          <Col xs={24} md={12}>
          <Form.Item name="nationality" label="สัญชาติ">
            <Input />
          </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item name="religion" label="ศาสนา">
            <Input />
          </Form.Item>
          </Col>

          <Col xs={24} md={12}>
          <Form.Item name="email" label="อีเมล">
            <Input type="email" />
          </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
          <Form.Item name="phone" label="เบอร์โทร">
            <Input />
          </Form.Item>
          </Col>
        </Row>

          <Form.Item name="address" label="ที่อยู่">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              ยกเลิก
            </Button>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProfile;
