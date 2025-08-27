import {Routes,Route, Link, useNavigate} from 'react-router-dom'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input,} from "antd";
const CreateCourse = () => {
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
        // ตัวอย่าง: console.log(values);
        // เสร็จแล้วค่อย navigate กลับ
        navigate('/admin/course');
    };
    return(
        <>
        <div style = {{
            background:"#fff",
            minHeight:"100vh",
            marginLeft:"6px",
            marginRight:"6px",
            borderRadius:"6px",
            }}>
        <h1 style={{
            padding:'20px',
            //fontFamily:'Kanit, sans-serif',
            //fontWeight: 200 // เพิ่มบรรทัดนี้เพื่อให้ตัวไม่หนา
        }}>เพิ่มข้อมูลรายวิชา ปีการศึกษา 2568/1
            {/* <Divider/> */}
        </h1>
        
        <Col >
        <Card style={{ padding: 10, margin: "0 auto", maxWidth: 1500 }}>
        
        <Form
            layout="vertical"
            style={{ maxWidth: 1500, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
        >
            <Row gutter={24}>
            <Col span={12}>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>รหัสวิชา</span>}
            name="courseCode"
            rules={[{ required: true, message: "กรุณากรอกรหัสวิชา" }]}
            >
            <Input placeholder="เช่น 101101" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>ชื่อวิชา</span>}
            name="courseName"
            rules={[{ required: true, message: "กรุณากรอกชื่อวิชา" }]}
            >
            <Input placeholder="เช่น คณิตศาสตร์พื้นฐาน" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>หน่วยกิต</span>}
            name="credit"
            rules={[{ required: true, message: "กรุณากรอกจำนวนหน่วยกิต" }]}
            >
            <Input placeholder="เช่น 3" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ครูประจำรายวิชา</span>}
                name="teacher"
                rules={[{ required: true, message: "กรุณากรอกชื่อครูประจำรายวิชา" }]}
            >
                <Input placeholder="เช่น ครูสมชาย ใจดี" style={{height:'48px'}}/>
            </Form.Item>
            </Col>

            <Col span={12}>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>กลุ่มสาระ</span>}
                name="subjectGroup"
                rules={[{ required: true, message: "กรุณากรอกกลุ่มสาระ" }]}
            >
                <Input placeholder="เช่น คณิตศาสตร์" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ห้อง</span>}
                name="room"
                rules={[{ required: true, message: "กรุณากรอกห้อง" }]}
            >
                <Input placeholder="เช่น ม.1/1" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ระดับชั้น</span>}
                name="level"
                rules={[{ required: true, message: "กรุณากรอกระดับชั้น" }]}
            >
                <Input placeholder="เช่น ม.1" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>จำนวนคาบ</span>}
                name="period"
                rules={[{ required: true, message: "กรุณากรอกจำนวนคาบ" }]}
            >
                <Input placeholder="เช่น 4" style={{height:'48px'}}/>
            </Form.Item>
            </Col>
            </Row>
            <Form.Item>
                {/* <Link to='/course'> */}
                <Button type="primary" htmlType="submit">
                    บันทึกข้อมูล
                </Button>
                {/* </Link> */}
                </Form.Item>
        </Form>
        </Card>
        </Col>
        

        </div>
        
        </>
    );
};
export default CreateCourse