import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Tabs, Upload, Row, Col, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

const AddStudent = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = (info: any) => {
    const reader = new FileReader();
    reader.onload = e => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(info.file.originFileObj);
  };

  const tabStyle = {
    background: '#eaf6ff',
    padding: 24,
    borderRadius: 16,
    width: 985,
    height: 700,
    overflow: 'auto',

  };

  return (
    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', padding: 24 }}>
      <div style={{ flex: 1 }}>
        <Tabs defaultActiveKey="1" centered>
          <Tabs.TabPane tab={<Button shape="round" style={{ background: '#cce6ff' }}>ข้อมูลทั่วไป</Button>} key="1">
            <div style={tabStyle}>
                <Title level={4}>ข้อมูลทั่วไป</Title>
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}><Form.Item label="เลขบัตรประชาชน" name="id"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="วันเกิด" name="dob"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                  <Col span={12}><Form.Item label="ชื่อ" name="fnameTH"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="นามสกุล" name="lnameTH"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="สถานะ" name="status"><Select><Option>โสด</Option><Option>สมรส</Option></Select></Form.Item></Col>
                  <Col span={12}><Form.Item label="เพศ" name="gender"><Select><Option>ชาย</Option><Option>หญิง</Option></Select></Form.Item></Col>
                  <Col span={12}><Form.Item label="ชั้นปี" name="year"><Select><Option>1</Option><Option>2</Option></Select></Form.Item></Col>
                  <Col span={12}><Form.Item label="ห้อง" name="room"><Select><Option>1</Option><Option>2</Option></Select></Form.Item></Col>
                  <Col span={12}><Form.Item label="Firstname" name="fnameEN"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="Lastname" name="lnameEN"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="สัญชาติ" name="nationality"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="ศาสนา" name="religion"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="เบอร์ติดต่อ" name="phone"><Input /></Form.Item></Col>
                  <Col span={12}><Form.Item label="E-mail" name="email"><Input /></Form.Item></Col>
                </Row>
              </Form>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<Button shape="round" style={{ background: '#cce6ff' }}>ข้อมูลผู้ปกครอง</Button>} key="2">
            <div style={tabStyle}>
              <Title level={4}>ข้อมูลมารดา</Title>
              <Row gutter={20}>
                <Col span={12}><Form.Item label="เลขบัตรประชาชน"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="วันเกิด"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={12}><Form.Item label="ชื่อ"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="นามสกุล"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="สถานะ"><Select><Option>มีชีวิต</Option><Option>เสียชีวิต</Option></Select></Form.Item></Col>
                <Col span={12}><Form.Item label="เบอร์ติดต่อ"><Input /></Form.Item></Col>
              </Row>
              <Title level={4}>ข้อมูลบิดา</Title>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="เลขบัตรประชาชน"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="วันเกิด"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={12}><Form.Item label="ชื่อ"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="นามสกุล"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="สถานะ"><Select><Option>มีชีวิต</Option><Option>เสียชีวิต</Option></Select></Form.Item></Col>
                <Col span={12}><Form.Item label="เบอร์ติดต่อ"><Input /></Form.Item></Col>
              </Row>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<Button shape="round" style={{ background: '#cce6ff' }}>ที่อยู่</Button>} key="3">
            <div style={tabStyle}>
              <Title level={4}>ที่อยู่ที่ติดต่อได้</Title>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="บ้านเลขที่"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="ถนน"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="ตำบล"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="อำเภอ"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="จังหวัด"><Select><Option>นครราชสีมา</Option></Select></Form.Item></Col>
                <Col span={12}><Form.Item label="รหัสไปรษณีย์"><Input /></Form.Item></Col>
              </Row>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>

      <div>
        <div
          style={{
            width: 180,
            height: 250,
            border: '1px solid #ccc',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
            background: '#060606ff',
          }}
        >
          {imageUrl ? <img src={imageUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'รูปภาพ'}
        </div>
        <Upload showUploadList={false} beforeUpload={() => false} onChange={handleUpload}>
          <Button block style={{ marginTop: 8,marginLeft:55 }}>เพิ่มรูปภาพ</Button>
        </Upload>
        <Button block style={{ marginTop: 8 }}>บันทึกรูปภาพ</Button>
        <Button type="primary" block style={{ marginTop: 32, background: '#cce6ff', color: '#000' }}>ยืนยัน</Button>
      </div>
    </div>
  );
};

export default AddStudent;