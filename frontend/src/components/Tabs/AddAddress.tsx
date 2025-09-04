import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Space,  Upload, Row, Col, Typography } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import ModalSave from '../../ModalSave';
// import { Link } from 'react-router-dom';
const { Option } = Select;
const { Title } = Typography;

const AddAddress = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = (info: any) => {
    const reader = new FileReader();
    reader.onload = e => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(info.file.originFileObj);
  };

  const tabStyle = {
    background: "#ffffffff",
    padding: 24,
    borderRadius: 16,
    minwidth: '60vw',
    minheight: "1000",
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
  borderRadius: '50%',
  display: "flex",
  margin: '30px 0px 20px 0px',
  justifyContent: "center",
  alignItems: "center",
  background: "#717171",
  overflow: "hidden",
};


return (
    <div style={{ padding: 10}}>

      {/* เนื้อหา AddAddress */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", minHeight:"80vh" }}>
        <div style={{ flex: 1  }}>
          <div style={tabStyle}>
            <Title level={4} style={{ marginBottom: "40px" }}>
            ที่อยู่ที่ติดต่อได้
            </Title>
             <Form form={form} layout="vertical">
                          <Row gutter={16} justify="center">
                            <Col span={10}>
                              <Form.Item label="รายละเอียด" name="detail">
                                <Input style={{ height: "35px" }} />
                              </Form.Item>
                            </Col>
            
                            <Col span={10}>
                              <Form.Item label="ถนน" name="road">
                                <Input style={{ height: "35px" }} />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="ตำบล" name="status">
                                <Select style={{ height: "35px" }}>
                                  <Option value="single">โสด</Option>
                                  <Option value="married">สมรส</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="อำเภอ" name="gender">
                                <Select style={{ height: "35px" }}>
                                  <Option value="male">ชาย</Option>
                                  <Option value="female">หญิง</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="จังหวัด" name="year">
                                <Select style={{ height: "35px" }}>
                                  <Option>1</Option>
                                  <Option>2</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item label="ไปรษณีย์" name="room">
                                <Select style={{ height: "35px" }}>
                                  <Option>1</Option>
                                  <Option>2</Option>
                                </Select>
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
          <Space direction="vertical" size="middle" style={{ width: "100%" , alignItems: 'center'}}>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
              style={{ width: "100%" }}
            >
              <Button style = {{width: 150 , height: 15}}> เพิ่มรูปภาพ</Button>
            </Upload>

            <Button style = {{width: 150 , height: 15, alignItems: 'center'}}>บันทึกรูปภาพ</Button>
          
              {/* <ModalSave style= {{ width: 150 , height: 15,marginTop: 240, background: "#ffffffff", color: "#000", border: "1px solid #808080ff" }}/> */}

          </Space>
        </div>
      </div>
    </div>
  );
}

export default AddAddress;