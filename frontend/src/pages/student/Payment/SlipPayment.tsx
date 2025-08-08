import React from "react";
import { Form, Input, DatePicker, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function SlipPayment() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
  if (!values.paymentProof && values.paymentProof.length === 0) {
    message.error('กรุณาแนบไฟล์ก่อนกดบันทึก');
    return;
  }
  const file = values.paymentProof[0].originFileObj;
    console.log('ไฟล์ที่อัพโหลด:', file);
    message.success('บันทึกข้อมูลสำเร็จ');
    form.resetFields();
    };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <Form
        form={form}
        labelCol={{ style: { width: 120 } }}
        wrapperCol={{ span: 16 }}
        style={{
          width: 500,
          padding: 24,
          border: "3px solid #91ceffff",
          marginTop: -150,
          borderRadius: 8,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label="วันที่จ่าย"
          name="paymentDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่จ่าย" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="จำนวนเงิน"
          name="amount"
          rules={[{ required: true, message: "กรุณากรอกจำนวนเงิน" }]}
        >
          <Input type="number" min={0} placeholder="เช่น 1000" />
        </Form.Item>

        <Form.Item
        label="ส่งไฟล์"
        name="paymentProof"   // ตั้งชื่อ field ใน form
        valuePropName="fileList"  // บอกว่าค่าที่จะเก็บคือ fileList
        getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
            return e;
            }
            return e && e.fileList;
        }}
        rules={[{ required: true, message: 'กรุณาแนบไฟล์' }]}  // validation
        >
        <Upload
            beforeUpload={() => false}  // ไม่ให้ auto upload
            maxCount={1}
        >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
        </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit">
            ยืนยัน
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SlipPayment;
