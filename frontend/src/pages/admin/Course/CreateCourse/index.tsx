import {Routes,Route, Link, useNavigate} from 'react-router-dom'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input,Select, message} from "antd";
import React, { useEffect, useState } from "react";
import { subjectGroupAPI } from '../../../../services/https'
import type { subjectGroupInterface } from '../../../../interfaces/course';
import { courseAPI } from '../../../../services/https'
import { gradeAPI } from '../../../../services/https';
import type { GradeYearInterface } from '../../../../interfaces/Grade';
import type { GradeClassInterface } from '../../../../interfaces/Grade';
import type { teacherAPI } from '../../../../services/https';
// import { Teacher } from '../../../../interfaces/Teacher';

const { Option } = Select;
//อาจจะต้องมี
// interface SelectSubjectGroup { 
//     value: string | null;
//     onChange: (value: string) => void;
//   }
// interface SelectGrade{
//     value: string | null
//     onChange: (value: string) => void;
// }
const CreateCourse:React.FC = () => {
    
    const [subjectGroups, setSubjectGroups] = useState<subjectGroupInterface[]>([]);
    const [grades, setGrades] = useState<GradeYearInterface[]>([]);
    const [class_, setClass_] = useState<GradeClassInterface[]>([]);
    // const [teacher, setTeacher] = useState<Teacher[]>([]);
    const [messageApi, contextHolder ]= message.useMessage();

    // const [selectGrade ,setSelectedGrade] = useState<string | null>(null);
    // const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const fetchSubjectGroups = async () => {
        try {
            const res = await subjectGroupAPI.getSubjectGroupAll();
            console.log("📌 SubjectGroup API response:", res);
            if (Array.isArray(res)) {
                setSubjectGroups(res);
            }else{
                messageApi.error('ไม่พบข้อมูลกลุ่มสาระ');
            }
        } catch (err) {
            console.error('❌ โหลด Subject Groups ผิดพลาด:', err);
        }
    };
    const fetchGrades = async () => {
        try {
          const res = await gradeAPI.getGradesAll();
          if (Array.isArray(res)) {
            setGrades(res);
          } else {
            messageApi.error('ไม่พบข้อมูลชั้นปี');
          }
        } catch (err) {
          console.error('❌ โหลด grade ผิดพลาด:', err);
          messageApi.error('เกิดข้อผิดพลาด');
        }
      };
      const fetchClass = async () => {
          try {
            const res = await gradeAPI.getClassesAll();
            if (Array.isArray(res)) {
              setClass_(res);
            } else {
              messageApi.error('ไม่พบข้อมูลชั้นปี');
            }
          } catch (err) {
            console.error('❌ โหลด grade ผิดพลาด:', err);
            messageApi.error('เกิดข้อผิดพลาด');
          }
        };
      
    useEffect(() => {
        fetchSubjectGroups();
        fetchGrades();
        fetchClass();
    }, []);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
        // ตัวอย่าง: console.log(values);
        // เสร็จแล้วค่อย navigate กลับ
        try {
    console.log("📌 ค่าที่ได้จากฟอร์ม:", values);

    const res = await courseAPI.CreateCourseAll(values); // 👈 ส่งข้อมูลไป backend

    if (res) {
      messageApi.success("บันทึกข้อมูลรายวิชาสำเร็จ");
      navigate("/admin/course"); // กลับไปหน้ารายวิชา
    } else {
      messageApi.error("บันทึกข้อมูลไม่สำเร็จ");
    }
    }catch (error) {
        console.error("❌ Error saving course:", error);
        messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
        // navigate('/admin/course');
    };
    const handleCancle = () => {
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
            padding:'16px',
            fontWeight: 'normal',
            marginLeft:'-16px',
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
            name="course_code"
            rules={[{ required: true, message: "กรุณากรอกรหัสวิชา" }]}
            >
            <Input placeholder="เช่น 101101" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>ชื่อวิชา</span>}
            name="course_name"
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
            name="credit_num"
            rules={[{ required: true, message: "กรุณากรอกจำนวนหน่วยกิต" }]}
            >
            {/* <Input placeholder="เช่น 3" style={{height:'48px'}}/> */}
            <Select placeholder="จำนวนหน่วยกิต" style={{ width: "100%" ,height:'48px' }}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                <Option value={0.5}>0.5 หน่วยกิต</Option>
                <Option value={1.0}>1.0 หน่วยกิต</Option>
                <Option value={1.5}>1.5 หน่วยกิต</Option>
            </Select>
            </Form.Item>
            
            </Col>

            <Col span={12}>
            
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ระดับชั้น</span>}
                name="grade_year"
                rules={[{ required: true, message: "กรุณากรอกระดับชั้น" }]}
            >
                <Select placeholder="เลือกชั้นปี" style={{ width: "100%" ,height:'48px' }}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                {grades.map((g,) => (
                    <Option key={g.ID ?? g.ID} value={g.grade_year}>
                        มัธยมศึกษาปีที่ {g.grade_year}
                    </Option>
                ))}
                </Select>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ห้อง</span>}
                name="grade_class"
                rules={[{ required: true, message: "กรุณากรอกห้อง" }]}
            >
                {/* <Input placeholder="เช่น ม.1/1" style={{height:'48px'}}/> */}
                <Select placeholder="เลือกห้อง" style={{ width: "100%" ,height:'48px' }}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                {class_.map((g,) => (
                    <Option key={g.ID ?? g.ID} value={g.grade_class}>
                        ห้อง {g.grade_class}
                    </Option>
                ))}
                </Select>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>จำนวนคาบ</span>}
                name="class_in_week"
                rules={[{ required: true, message: "กรุณากรอกจำนวนคาบ" }]}
            >
                <Select placeholder="จำนวนคาบเรียน" style={{ width: "100%" ,height:'48px' }}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                <Option value={1}>1 คาบ</Option>
                <Option value={2}>2 คาบ</Option>
                <Option value={3}>3 คาบ</Option>
                </Select>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>กลุ่มสาระ</span>} //แก้
                name="subject_group_id"
                rules={[{ required: true, message: "กรุณาเลือกกลุ่มสาระ" }]}
            >
                {/* <Input placeholder="เช่น คณิตศาสตร์" style={{height:'48px'}}/> */}
                <Select placeholder="เลือกกลุ่มสาระ" style={{ width: "100%" ,height:'48px' }}
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
            <Form.Item style={{ textAlign: "right" }}>
                {/* <Link to='/course'> */}
                <Button  type='primary' htmlType="button" onClick = {handleCancle}style ={{ background:'#eae9e9',borderColor: '#eae9e9', color:'#000',}}>
                    ยกเลิก
                </Button>
                &nbsp;&nbsp;
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