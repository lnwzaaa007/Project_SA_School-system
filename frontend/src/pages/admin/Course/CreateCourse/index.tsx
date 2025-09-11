import {Routes,Route, Link, useNavigate} from 'react-router-dom'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input,Select, message} from "antd";
import React, { useEffect, useState } from "react";
import { subjectGroupAPI, termAPI } from '../../../../services/https'
import type { subjectGroupInterface } from '../../../../interfaces/course';
import { courseAPI } from '../../../../services/https'
import { gradeAPI } from '../../../../services/https';
import type { GradeYearInterface } from '../../../../interfaces/Grade';
import type { GradeClassInterface } from '../../../../interfaces/Grade';
import type { TermInterface } from '../../../../interfaces/Term';
import { teacherAPI } from '../../../../services/https';
import type { Teacher } from '../../../../interfaces/Teacher';
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
    const [teacher, setTeacher] = useState<Teacher[]>([]);
    const [messageApi, contextHolder ]= message.useMessage();
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [term, setTerm] = useState<TermInterface[]>([]);
    const [selectedGradeYear, setSelectedGradeYear] = useState<number | null>(null);
    const [selectedGradeClass, setSelectedGradeClass] = useState<number | null>(null);
    // const [selectGrade ,setSelectedGrade] = useState<string | null>(null);
    // const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const classWithYear = class_.map((c) => {
    const grade = grades.find((g) => g.id === c.id);
    return {
        ...c,
        grade_year: grade ? grade.grade_year : undefined,
  };
});
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
          console.log("📌 Grade API response:", res);
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
            console.log("📌 Class API response:", res);
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
    const fetchTeacherName = async () => {
        try{
            const res = await teacherAPI.getNameTeacherAll();
            console.log("📌 Teacher API response:", res);
            if (Array.isArray(res)){
                setTeacher(res);
            }else{
                messageApi.error('ไม่พบข้อมูลครู')
            }
        }catch (err){
            console.error('❌ โหลด Teacher ผิดพลาด:', err);
            messageApi.error('เกิดข้อผิดพลาด');
        }
    };
    const fetchTerm = async () => {
        try{
            const res = await termAPI.getTermsAll();
            console.log("📌 Term API response:", res);
            if (Array.isArray(res)){
                setTerm(res);
            }else{
                messageApi.error('ไม่พบข้อมูลเทอม')
            }
        }catch (err){
            console.error('❌ โหลด Term ผิดพลาด:', err);
            messageApi.error('เกิดข้อผิดพลาด');
        }
    };
      
    useEffect(() => {
        fetchSubjectGroups();
        fetchGrades();
        fetchClass();
        fetchTeacherName();
        fetchTerm();
    }, []);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
        // ตัวอย่าง: console.log(values);
        // เสร็จแล้วค่อย navigate กลับ
    if (!selectedTerm) {
    messageApi.error("กรุณาเลือกเทอมก่อน");
    return;
    }
//   const foundGrade = grades.find(
//     (g) =>
//       String(g.grade_year) === String(selectedGradeYear) &&
//       String(g.grade_class) === String(selectedGradeClass)
//   );
//   if (!foundGrade) {
//     messageApi.error("ไม่พบข้อมูลชั้นปีและห้องที่เลือก");
//     return;
//   }
    try {
    console.log("📌 ค่าที่ได้จากฟอร์ม:", values);

    const res = await courseAPI.CreateCourseAll({...values, 
        // grade_id: foundGrade.id,
        term_id: selectedTerm,       
    }); // 👈 ส่งข้อมูลไป backend

    if (res) {
      messageApi.success("บันทึกข้อมูลรายวิชาสำเร็จ");
      setTimeout(() => {
        navigate("/admin/course");
      }, 1200); // รอ 1.2 วินาที ให้ message แสดงก่อน
    //   navigate("/admin/course"); // กลับไปหน้ารายวิชา
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
        <h2 style={{
            padding:'16px',
            fontWeight: 'normal',
            marginLeft:'-16px',
            gap:8,
            //fontFamily:'Kanit, sans-serif',
            //fontWeight: 200 // เพิ่มบรรทัดนี้เพื่อให้ตัวไม่หนา
        }}>เพิ่มข้อมูลรายวิชา    

            <Select placeholder="เลือกเทอม"
                    style={{ width: 300, marginBottom: 16,marginLeft:8, }}
                    value={selectedTerm}
                    onChange={(value) =>{
                        setSelectedTerm(value);
                        console.log("เลือกเทอม:", value);
                    }}>
                {term.map((tm) => (
                    <Option key={tm.id} value={tm.id}>
                        เทอม {tm.semester} ปีการศึกษา {tm.academic_year}
                    </Option>
                ))}
                
            </Select>
            {/* <Divider/> */}
        </h2>
        
        <Col >
        <Card style={{ padding: 10, margin: "0 auto", maxWidth: 1500 }}>
        
        <Form
            layout="vertical"
            style={{ maxWidth: 1500, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            // onFinish={onFinish}

            onFinish={(values) => {
                if (!selectedTerm) {
                    messageApi.error("กรุณาเลือกเทอมก่อน");
                    return;
                }
                // ส่ง selectedTerm ไปกับ values
                onFinish({ ...values, term_id: selectedTerm });
  }}
        >
            <Row gutter={24}>
            <Col span={12}>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>รหัสวิชา</span>}
            name="course_code"
            rules={[{ required: true, message: "กรุณากรอกรหัสวิชา" }]}
            >
            <Input placeholder="เช่น ค21101" style={{height:'48px'}}/>
            </Form.Item>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>ชื่อวิชา</span>}
            name="course_name"
            rules={[{ required: true, message: "กรุณากรอกชื่อวิชา" }]}
            >
            <Input placeholder="เช่น คณิตศาสตร์พื้นฐาน 1" style={{height:'48px'}}/>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ครูประจำรายวิชา</span>}
                name="teacher_id"
                rules={[{ required: true, message: "กรุณากรอกชื่อครูประจำรายวิชา" }]}
            >
                {/* <Input placeholder="เช่น ครูสมชาย ใจดี" style={{height:'48px'}}/> */}
                <Select placeholder="ครูประจำรายวิชา" style={{ width: "100%" ,height:'48px' }}
                    onChange ={(value) => {
                        console.log("เลือกครูid:", value);
                    }}>
                    {teacher.map((t) => (
                        <Option key={t.id} value={t.id}>
                        {t.t_first_name} {t.t_last_name} 
                        {/* {JSON.stringify(t)} */}
                        </Option>
                    ))}
                </Select>
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
                        value={selectedGradeYear ?? undefined}
                        onChange={(value) => setSelectedGradeYear(value)}
                        onSelect={(value) => {
                        console.log("เลือก:", value);
                }}
                >
                {grades.map((g,) => (
                    <Option key={g.id ?? g.id} value={String(g.grade_year)}>
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
                <Select placeholder="เลือกห้อง" style={{ width: "100%" ,height:'48px',}}
                        disabled={!selectedGradeYear} // ปิดการใช้งานถ้ายังไม่เลือกชั้นปี
                        value={selectedGradeClass ?? undefined}
                        onChange={(value) => setSelectedGradeClass(value)}
                        //
                        onSelect={(value) => {
                        console.log("เลือก:", value);
                }}
                >
                {/* {class_.map((g,) => (
                    <Option key={g.id ?? g.id} value={g.grade_class}>
                        ห้อง {g.grade_class}
                    </Option>
                ))} */}
                {classWithYear
                    // .filter((c) => String(c.grade_year?.id)=== selectedGradeYear) // กรองห้องตามชั้นปีที่เลือก
                    .map((c) => (
                        <Option key={c.id} value={c.grade_class}>
                            ห้อง {c.grade_class}
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
                <Button type="primary" htmlType="submit" disabled={!selectedTerm} // ปุ่มจะกดไม่ได้ถ้ายังไม่เลือกเทอม
                >
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