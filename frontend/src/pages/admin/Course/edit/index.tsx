import {Routes,Route, Link, useNavigate} from 'react-router-dom'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input,Select, message} from "antd";
import React ,{useEffect, useState} from "react";
import type { subjectGroupInterface } from '../../../../interfaces/course';
import { subjectGroupAPI } from '../../../../services/https';
const { Option } = Select;

interface SelectSubjectGroup {
    value: string | null;   
    onChange: (value: string) => void;
    }
const EditCourse:React.FC = () => {
    const [subjectGroups, setSubjectGroups] = useState<subjectGroupInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const fetchSubjectGroups = async () => {
        try {
            const res =await subjectGroupAPI.getSubjectGroupAll();
            console.log("📌 SubjectGroup API response:", res);
            if (Array.isArray(res)) {
                setSubjectGroups(res);
            }else{
                messageApi.error('ไม่พบข้อมูลกลุ่มสาระ');
            }
        }catch (err) {
            console.error('❌ โหลด Subject Groups ผิดพลาด:', err);
        }
    };
    useEffect(() => {
        fetchSubjectGroups();
    }, []);
    const navigate = useNavigate();
    // ตัวอย่างข้อมูลรายวิชา
    const courseData = {
        courseCode: "101101",
        courseName: "คณิตศาสตร์พื้นฐาน",
        credit: "3",
        teacher: "ครูสมชาย ใจดี",
        subjectGroup: "คณิตศาสตร์",
        room: "ม.1/1",
        level: "ม.1",
        period: "4"
    };

    const onFinish = (values: any) => {
        // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
        // ตัวอย่าง: console.log(values);
        // เสร็จแล้วค่อย navigate กลับ
        navigate('/admin/course');
    };
    return(
        <>
        {contextHolder}
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
        }}>แก้ไขข้อมูลรายวิชา ปีการศึกษา 2568/1
            <Divider/>
        </h1>
        
        <Col >
        <Form
            layout="vertical"
            style={{ maxWidth: 1500, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
            initialValues={courseData} // กำหนดค่าเริ่มต้นให้กับฟอร์ม
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
                label={<span style={{ fontSize: "18px" }}>ครูประจำรายวิชา</span>}
                name="teacher"
                rules={[{ required: true, message: "กรุณากรอกชื่อครูประจำรายวิชา" }]}
            >
                <Input placeholder="เช่น ครูสมชาย ใจดี" style={{height:'48px'}}/>
            </Form.Item>

            <Form.Item
            label={<span style={{ fontSize: "18px" }}>หน่วยกิต</span>}
            name="credit"
            rules={[{ required: true, message: "กรุณากรอกจำนวนหน่วยกิต" }]}
            >
            <Input placeholder="เช่น 3" style={{height:'48px'}}/>
            </Form.Item>
            
            </Col>

            <Col span={12}>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ระดับชั้น</span>}
                name="level"
                rules={[{ required: true, message: "กรุณากรอกระดับชั้น" }]}
            >
                <Input placeholder="เช่น ม.1" style={{height:'48px'}}/>
            </Form.Item>
           
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ห้อง</span>}
                name="room"
                rules={[{ required: true, message: "กรุณากรอกห้อง" }]}
            >
                <Input placeholder="เช่น ม.1/1" style={{height:'48px'}}/>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>จำนวนคาบ</span>}
                name="period"
                rules={[{ required: true, message: "กรุณากรอกจำนวนคาบ" }]}
            >
                <Input placeholder="เช่น 4" style={{height:'48px'}}/>
            </Form.Item>

             <Form.Item
                label={<span style={{ fontSize: "18px" }}>กลุ่มสาระ</span>}
                name="subjectGroup"
                rules={[{ required: true, message: "กรุณากรอกกลุ่มสาระ" }]}
            >
                <Select placeholder = "เลือกกลุ่มสาระ" style={{width: '100%',height:'48px'}}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                {subjectGroups.map((sg,) => (
                    <Option key={sg.id ?? sg.id} value={sg.id}>
                        {sg.subject_group_name}
                    </Option>
                ))}
                </Select>
            </Form.Item>

            </Col>
            </Row>
            <Form.Item style={{textAlign:"right"}} >
                {/* <Link to='/course'> */}
                <Button type="primary" htmlType="button" style={{background:'#eae9e9',borderColor: '#eae9e9', color:'#000', }} onClick={() => navigate(-1)}>
                    ยกเลิก
                </Button>
                &nbsp; &nbsp;
                <Button type="primary" htmlType="submit">
                    บันทึกข้อมูล
                </Button>
                {/* </Link> */}
                </Form.Item>
        </Form>
        </Col>
        

        </div>
        
        </>
    );
};
export default EditCourse