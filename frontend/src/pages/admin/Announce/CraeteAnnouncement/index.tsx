import { useNavigate } from "react-router-dom";
import { Col, Row, Card, Form, Input, Button, DatePicker, Select, TimePicker} from "antd";
import {EyeOutlined} from '@ant-design/icons';
const { Option } = Select;
const format = 'HH:mm';
const CreateAnnouncement = () => {
    
    const navigate = useNavigate();
    
    const onFinish = (values: any) => {
        // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
        // ตัวอย่าง: console.log(values);
        // เสร็จแล้วค่อย navigate กลับ
        navigate('/admin/announce');
    };
    return(
    <> 
        <div>
            
        <h2 style={{ fontSize:'26px', fontWeight: 'normal',color: '#015c91',padding:'16px',marginLeft:'-16px',}}>
            สร้างประกาศ
        </h2>
        <Col >
        <Card style={{ padding: 6, margin: "0 auto", maxWidth: 1690, }}>
        
        <Form
            layout="vertical"
            style={{ maxWidth: 1700, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
        >
            <Row gutter={24}>
            <Col span={12}>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>เรื่อง</span>}
            name="courseCode"
            rules={[{ required: true, message: "กรุณากรอกหัวข้อประกาศ" }]}
            >
            <Input placeholder="เช่น 101101" style={{height:'48px'}}/>
            </Form.Item>
            
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>รายละเอียด</span>}
                name="subjectGroup"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียดเนื้อหา" }]}
            >
                <Input.TextArea placeholder="เช่น คณิตศาสตร์" style={{height:'370px', resize:'none'}}/>
            </Form.Item>
            </Col>

            <Col span={12}>
            <Form.Item 
            label={<span style={{ fontSize: "18px" }}>หมวดหมู่</span>}
            name="category"
            rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}>
                <Select placeholder="เลือก" style={{ width: "100%" ,height:'48px' }}>
                    <Option value="ข่าวสาร">ข่าวสาร</Option>
                    <Option value="กิจกรรม">กิจกรรม</Option>
                    <Option value="ประชาสัมพันธ์">ประชาสัมพันธ์</Option>
                    <Option value="ด่วน">ด่วน</Option>
                    <Option value="อื่นๆ">อื่นๆ</Option>
                </Select>
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>วันที่เผยแพร่</span>}
            name="dateCreate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
            <DatePicker style={{ width: "100%", height:'48px' }} />
            {/* <Input placeholder="เช่น คณิตศาสตร์พื้นฐาน" style={{height:'48px'}}/> */}
            </Form.Item>
            <Form.Item 
            label={<span style={{ fontSize: "18px" }}>เวลาที่เผยแพร่</span>}
            name="timeCreate"
            rules={[{ required: true, message: "กรุณาเลือกเวลา" }]}>
                <TimePicker  format={format}
                            style={{width:'100%',height:'48px'}} />
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>วันหมดอายุ</span>}
            name="dateEnd"
            rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
            <DatePicker style={{ width: "100%", height:'48px' }} />
            </Form.Item>

            <Form.Item
            label={<span style={{ fontSize: "18px" }}>กลุ่มเป้าหมาย</span>}
            name="credit"
            rules={[{ required: true, message: "กรุณาเลือกกลุ่มเป้าหมาย" }]}
            >
            {/* <Input placeholder="เช่น 3" style={{height:'48px'}}/> */}
            <Select placeholder="เลือก" style={{ width: "100%" ,height:'48px' }}>
                <Option value="นักเรียน">นักเรียน</Option>
                <Option value="คุณครู">ครูและบุคลากร</Option>
                <Option value="ผู้ปกครอง">ผู้ปกครอง</Option>
                <Option value="ทุกคน">ทุกคน</Option>
            </Select>
            </Form.Item>
            </Col>
            </Row>
            <Form.Item style={{ textAlign: "right" }}>
                {/* <Link to='/course'> */}

                <Button icon={<EyeOutlined/>} type='primary' htmlType="button"style ={{ background:'#eae9e9',borderColor: '#eae9e9', color:'#000',}}>
                    ดูตัวอย่าง
                </Button>
                &nbsp;&nbsp;
                <Button type="primary" htmlType="submit">
                    บันทึกเป็นฉบับร่าง
                </Button>
                &nbsp;&nbsp;
                <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                    เผยแพร่
                </Button>
                
                {/* </Link> */}
            </Form.Item>
        </Form>
        </Card>
        </Col>
        </div>
    </>
    );
}
export default CreateAnnouncement;