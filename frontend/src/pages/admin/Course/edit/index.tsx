import {Routes,Route, Link, useNavigate, useParams} from 'react-router-dom'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input,Select, message} from "antd";
import React ,{useEffect, useState} from "react";
import type { subjectGroupInterface } from '../../../../interfaces/course';
import { subjectGroupAPI, termAPI } from '../../../../services/https';
import { gradeAPI } from '../../../../services/https';
import type { GradeYearInterface } from '../../../../interfaces/Grade';
import type { GradeClassInterface} from '../../../../interfaces/Grade';
import type { TermInterface } from '../../../../interfaces/Term';
import {teacherAPI } from '../../../../services/https';
import type {Teacher} from '../../../../interfaces/Teacher';
import { courseAPI } from '../../../../services/https';
import SelectTerm from '../../../../components/SelectTerm';


const { Option } = Select;

interface SelectSubjectGroup {
    value: string | null;   
    onChange: (value: string) => void;
    }
const EditCourse:React.FC = () => {
    const [subjectGroups, setSubjectGroups] = useState<subjectGroupInterface[]>([]);
    const [grades, setGrades] = useState<GradeYearInterface[]>([]);
    const [class_, setClass_] = useState<GradeClassInterface[]>([]);
    const [teacher, setTeacher] = useState<Teacher[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [term, setTerm] = useState<TermInterface[]>([]);
    const [selectedGradeYear, setSelectedGradeYear] = useState<number | null>(null);
    const [selectedGradeClass, setSelectedGradeClass] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false); // เพิ่มสถานะการโหลดข้อมูล
    const { id } = useParams<{id : any}>(); // ดึง id จาก URL
    const [courseData, setCourseData] = useState<any>(null);
    
    
    if (!id) {
        messageApi.error("ไม่พบ ID ของรายวิชา");
        return null; // หรือแสดงข้อความอื่น ๆ ตามต้องการ
    }
    const classWithYear = class_.map((c) => {
    const grade = grades.find((g) => g.id === c.id);
    return {
        ...c,
        grade_year: grade ? grade.grade_year : undefined,
  };
});
    // ดึงข้อมูลกลุ่มสาระ
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
    // ดึงข้อมูลชั้นปี
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
          // ดึงข้อมูลห้อง
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
            //ดึงข้อมูลครู
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
        //ดึงข้อมูลเทอม
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
        const fetchCourseById = async (id: number) => {
            try {
              const res = await courseAPI.getCourseById(id);
                console.log("📌 Course By ID API response:", res)
                setCourseData(res); // เก็บข้อมูลรายวิชาใน state
                setDataLoaded(true);

                // กำหนดค่าให้กับฟอร์มที่นี่
                if (res) {
                   
                    setSelectedGradeYear(res.grade_year);
                    setSelectedGradeClass(res.grade_class);
                    

                    form.setFieldsValue({
                    course_code: res.data.course_code,     // ✅ map field backend -> form
                    course_name: res.data.course_name,
                    credit_num: res.data.credit_num,
                    teacher_id: res.data.teacher_name, // โชว์ชื่อครู
                    subject_group_id: res.data.subject_group_name, // โชว์ชื่อกลุ่มสาระ
                    grade_class: res.data.grade_class,
                    grade_year: res.data.grade_year,
                    class_in_week: res.data.class_in_week,
                    term_id: res.data.term_id,
                    grade_id: res.grade_id,
                    });
                    setSelectedGradeClass(res.grade_year);
                    // setDataLoaded(true); // กำหนดว่าข้อมูลถูกโหลดแล้ว
                } else {
                    messageApi.error("ไม่พบข้อมูลรายวิชา"); // ถ้าไม่เจอ course
                    navigate(-1); // ย้อนกลับไปหน้าก่อน
}
            }catch (err) {
              console.error('❌ โหลด Course By ID ผิดพลาด:', err);
              messageApi.error('เกิดข้อผิดพลาด');
            }
    };

    useEffect(() => {
        const loadAllData = async () => {
            await Promise.all([
                fetchSubjectGroups(),
                fetchGrades(),
                fetchClass(),
                fetchTeacherName(),
                fetchTerm(),
            ]);
            if (teacher.length > 0 && subjectGroups.length > 0 && courseData) {
                form.setFieldsValue({
                course_code: courseData.course_code,
                course_name: courseData.course_name,
                credit_num: courseData.credit_num,
                teacher_id: courseData.teacher_id,          // ✅ id
                subject_group_id: courseData.subject_group_id, // ✅ id
                grade_class: courseData.grade_class,
                grade_year: courseData.grade_year,
                class_in_week: courseData.class_in_week,
                term_id: courseData.term_id,
                grade_id: courseData.grade_id,
                });
            }
        
            if(id){
            await fetchCourseById(Number(id)); // ดึงข้อมูลรายวิชาตาม id
            }
        };
        loadAllData();
    }, [id]);
    const navigate = useNavigate();

  
const onFinish = async (values: any) => {
  try {
    setLoading(true); // แสดง loading spinner ถ้ามี
    //แปลงจากชื่อครูเป็น id
    let teacherId = values.teacher_id;
    if (typeof teacherId === "string") {
      teacherId = teacher.find(
        (t) => `${t.t_first_name} ${t.t_last_name}` === teacherId)?.id;
    }

    let subjectId = values.subject_group_id;
    if (typeof subjectId === "string") {
        subjectId = subjectGroups.find(
        (sg) => sg.subject_group_name === subjectId)?.id;
    }

    if (!selectedTerm) {
        messageApi.error("กรุณาเลือกเทอมก่อน");
        return;
    }

    // สร้าง payload จากค่า form
    const payload = {
    
        ...values,
        teacher_id: teacherId ?? courseData.teacher_id, // ส่ง id ถ้าไม่เลือก
        subject_group_id: subjectId ?? courseData.subject_group_id,
        term_id: selectedTerm ?? courseData.term_id,
        grade_class: values.grade_class ?? courseData.grade_class,
        grade_year: values.grade_year ?? courseData.grade_year,
        class_in_week: values.class_in_week ?? courseData.class_in_week,
        
    };
        
        console.log("Payload for update:", payload);
        await courseAPI.updateCourse(id, payload); 
        console.log("iddddddddddddddddd",payload);

        // แสดง success message และ navigate กลับหน้า course
        messageApi.success("แก้ไขข้อมูลสำเร็จ");
        navigate("/admin/course");

  } catch (error) {
    console.error("❌ บันทึกผิดพลาด:", error);
    messageApi.error("ไม่สามารถบันทึกข้อมูลได้");
  } finally {
    setLoading(false);
  }
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
            padding:'20px',
            
            fontWeight: 'normal' // เพิ่มบรรทัดนี้เพื่อให้ตัวไม่หนา
        }}>แก้ไขข้อมูลรายวิชา 
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
            <Divider/>
        </h2>
        
        <Col >
        <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 1500, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
            // initialValues={} // กำหนดค่าเริ่มต้นให้กับฟอร์ม
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
            <Input placeholder="เช่น คณิตศาสตร์ 1" style={{height:'48px'}}/>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ครูประจำรายวิชา</span>}
                name="teacher_id"
                rules={[{ required: true, message: "กรุณากรอกชื่อครูประจำรายวิชา" }]}
            >
                {/* <Input placeholder="เช่น ครูสมชาย ใจดี" style={{height:'48px'}}/> */}
                <Select placeholder = "เลือกครูผู้สอน" style={{width: '100%',height:'48px'}}
                        
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                {teacher.map((t) => (
                    <Option key={t.id ?? t.id} value={t.id}>
                        {t.t_first_name} {t.t_last_name}
                    </Option>
                ))}
                </Select>
            </Form.Item>

            <Form.Item
            label={<span style={{ fontSize: "18px" }}>หน่วยกิต</span>}
            name="credit_num"
            rules={[{ required: true, message: "กรุณากรอกจำนวนหน่วยกิต" }]}
            >
                <Select placeholder = "เลือกหน่วยกิต" style={{width: '100%',height:'48px'}}
                        onChange={(value) => {
                        console.log("เลือก:", value);
                }}>
                <Option value={0.5}>0.5</Option>
                <Option value={1.0}>1.0</Option>
                <Option value={1.5}>1.5</Option>

                </Select>
            </Form.Item>
            
            </Col>

            <Col span={12}>
            <Form.Item
                label={<span style={{ fontSize: "18px" }}>ระดับชั้น</span>}
                name="grade_year"
                rules={[{ required: true, message: "กรุณากรอกระดับชั้น" }]}
            >
                {/* <Input placeholder="เช่น ม.1" style={{height:'48px'}}/> */}
                <Select
                    placeholder="เลือกชั้นปี"
                    style={{ width: "100%", height: '48px' }}
                    value={selectedGradeYear ?? undefined}
                    onChange={(value) => setSelectedGradeYear(value)}
                    >
                    {grades.map((g) => (
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
                <Select
                placeholder="เลือกห้อง"
                style={{ width: "100%", height: '48px' }}
                // disabled={selectedGradeYear}
                value={selectedGradeClass ?? undefined}
                onChange={(value) => setSelectedGradeClass(value)}
                >
                {classWithYear
                    // .filter((c) => String(c.grade_year) === String(selectedGradeYear))
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
                {/* <Input placeholder="เช่น 4" style={{height:'48px'}}/> */}
                <Select placeholder="จำนวนคาบเรียน" style={{ width: "100%", height: '48px' }}>
                    <Option value={1}>1 คาบ</Option>
                    <Option value={2}>2 คาบ</Option>
                    <Option value={3}>3 คาบ</Option>
                </Select>
            </Form.Item>

             <Form.Item
                label={<span style={{ fontSize: "18px" }}>กลุ่มสาระ</span>}
                name="subject_group_id"
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