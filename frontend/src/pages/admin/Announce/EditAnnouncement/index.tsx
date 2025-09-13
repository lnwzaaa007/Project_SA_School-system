import {Routes,Route, Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input, DatePicker, Select, TimePicker, message} from "antd";
import { announcementAPI, targetGroupAPI } from "../../../../services/https";
import type { TargetGroupInterface } from "../../../../interfaces/targetgroup";
import type { AnnouncementInterface} from "../../../../interfaces/announcement"
const {Option} = Select;
const format = 'HH:mm';
import dayjs from "dayjs";
interface SelectTargetGroup{
    value: string | null;
    onChange: (value: string) => void;
}

const EditAnnouncement:React.FC = () => {
    const [targetGroups, setTargetGroups] = useState<TargetGroupInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const {id} = useParams();
    const [announcementData, setAnnouncementData] = useState<any>(null);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const fetchTargetGroups = async () => {
        try {
            const res = await targetGroupAPI.getTargetGroupAll();
            console.log("📌 TargetGroup API response:", res);
                if (Array.isArray(res)) {
                    setTargetGroups(res);
                }else{
                    messageApi.error('ไม่พบข้อมูลกลุ่มเป้าหมาย');
                }
            } catch (err) {
                console.error('❌ โหลด Target Groups ผิดพลาด:', err);
            }
    };

    const fetchAnnouncementByID = async (id: number) => { 
        try{
            const res = await announcementAPI.getAnnouncementByID(id);
            console.log("📌announcement By ID API response:", res)
            setAnnouncementData(res);
            setDataLoaded(true);

            if(res){
                form.setFieldsValue({
                    // title: res.data.title,
                    // content: res.data.content,
                    // category: res.data.category,
                    // create_date: res.data.create_date,
                    // end_date: res.data.end_date,
                    // time_create: res.data.time_create,
                    // target_group_id: res.data.group_name,
                    title: res.data.title,
                    content: res.data.content,
                    category: res.data.category,
                    create_date: res.data.create_date
                        ? dayjs(res.data.create_date)
                        : null,
                    end_date: res.data.end_date ? dayjs(res.data.end_date) : null,
                    time_create: res.data.time_create
                        ? dayjs(res.data.time_create, "HH:mm")
                        : null,
                    target_group_id: res.data.target_group.ID,


                });
            }else {
                    messageApi.error("ไม่พบข้อมูลรายวิชา"); // ถ้าไม่เจอ course
                    navigate(-1); // ย้อนกลับไปหน้าก่อน
}
            }catch (err) {
                    console.error('❌ โหลด Course By ID ผิดพลาด:', err);
                    messageApi.error('เกิดข้อผิดพลาด');
            }
        };

    useEffect(() => {
            fetchTargetGroups();
            if (id){
                fetchAnnouncementByID(Number(id));
            }
    }, [id]);

    const navigate = useNavigate();


    const handleSave = async (isDraft: boolean) => {
        try {
            let values;
            if (isDraft) {
            // validate เฉพาะ title กับ end_date
            await form.validateFields(["title", "end_date","content", "create_date", "time_create", "category", "target_group_id"]);

            // ดึงค่าทุก field ไม่ว่าจะ validate หรือไม่
            values = form.getFieldsValue();
            } else {
            // publish → validate ทุก field
            values = await form.validateFields();
            }

            console.log("✅ ผ่าน validation แล้ว ได้ค่า:", values);

            // เรียก onFinish พร้อม status draft/published
            await onFinish(values, isDraft);
        } catch (error) {
            console.log('❌ Validate failed:', error);
        }
    };
    const formatValues = (values: any) => {
    return {
        ...values,
        create_date: values.create_date?.format("YYYY-MM-DD") || "",
        end_date: values.end_date?.format("YYYY-MM-DD") || "",
        time_create: values.time_create?.format("HH:mm") || "",
        };
    };

    // const onFinish = (values: any) => {
    //     // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
    //     // ตัวอย่าง: console.log(values);
    //     // เสร็จแล้วค่อย navigate กลับ
    //     navigate('/admin/announce');
    // };
    const onFinish = async (values: any, isDraft: boolean = false) => {
      try {
        console.log("ค่าที่ได้จากฟอร์ม (raw):", values);
        const formattedValues = formatValues(values);
        const payload = {
        //   ...formatValues(values),
            // status: isDraft ? "ฉบับร่าง" : "เผยแพร่แล้ว", // ให้ตรงกับ backend
            title: formattedValues.title ?? announcementData.title,
            content: formattedValues.content ?? announcementData.content,
            category: formattedValues.category ?? announcementData.category,
            create_date: formattedValues.create_date || dayjs(announcementData.create_date).format("YYYY-MM-DD"),
            end_date: formattedValues.end_date || dayjs(announcementData.end_date).format("YYYY-MM-DD"),
            time_create: formattedValues.time_create || dayjs(announcementData.time_create).format("HH:mm"),
            target_group_id: formattedValues.target_group_id ?? announcementData.target_group_id,
            status: announcementData.status, // ✅ ใช้สถานะเดิม ถ้าไม่ได้เปลี่ยน

        };
    
        console.log("📌 payload ที่จะส่งไป backend:", payload);
        console.log("📌หลัง:", values);
    
        const res = await announcementAPI.updateAnnouncement(Number(id),payload);
        if (res !== undefined) {
        //   messageApi.success(isDraft ? "บันทึกฉบับร่างสำเร็จ" : "บันทึกสำเร็จ");
            messageApi.success("บันทึกข้อมูลสำเร็จ");
          setTimeout(() => {
            navigate("/admin/announce");
          }, 1200);
        } else {
          messageApi.error("บันทึกข้อมูลไม่สำเร็จ");
        }
      } catch (error) {
        console.error("❌ Error saving course:", error);
        messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    };
    const handleCancle = () => {
        navigate('/admin/announce');
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
            color:"#015c91",
            fontSize:"26px",
            //fontFamily:'Kanit, sans-serif',
            //fontWeight: 200 // เพิ่มบรรทัดนี้เพื่อให้ตัวไม่หนา
        }}>แก้ไขข้อมูลประกาศ 
            <Divider/>
        </h2>
        
        <Col >
        <Form
            form ={form}
            layout="vertical"
            style={{ maxWidth: 1500, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
            // initialValues={courseData} // กำหนดค่าเริ่มต้นให้กับฟอร์ม
        >
            <Row gutter={24}>
            <Col span={12}>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>เรื่อง</span>}
            name="title"
            rules={[{ required: true, message: "กรุณากรอกหัวข้อประกาศ" }]}
            >
            <Input placeholder="เช่น วันเปิดเรียน" style={{height:'48px'}}/>
            </Form.Item>

            <Form.Item
            label={<span style={{ fontSize: "18px" }}>รายละเอียด</span>}
            name="content"
            rules={[{ required: true, message: "กรุณากรอกรายละเอียดเนื้อหา" }]}
            >
            <Input.TextArea placeholder="เช่น เปิดเรียนภาคการศึกษาที่ 1 ปีการศึกษา 2568 ในวันที่ 15 พฤษภาคม 2568" style={{height:'370px',resize:'none'}}/>
            </Form.Item>

            </Col>

            <Col span={12}>
            <Form.Item
            label={<span style={{ fontSize: "18px" }}>หมวดหมู่</span>}
            name="category"
            rules={[{ required: true, message: "กรุณากรอกเลือกหมวดหมู่" }]}
            >
                <Select placeholder="เลือก" style={{ width: "100%" ,height:'48px' }}
                onChange={(value) => {
                    console.log("เลือก",value);
                    }}>                   
                    <Option value="ข่าวสาร">ข่าวสาร</Option>
                    <Option value="กิจกรรม">กิจกรรม</Option>
                    <Option value="ประชาสัมพันธ์">ประชาสัมพันธ์</Option>
                    <Option value="ด่วน">ด่วน</Option>
                    <Option value="อื่นๆ">อื่นๆ</Option>
                </Select>
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>วันที่เผยแพร่</span>}
                name="create_date"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
            <DatePicker style={{ width: "100%", height:'48px' }} 
                        onChange={(date, dateString) => {
                            console.log("date object:", date);       // Moment object
                            console.log("Selected date:", dateString); // string เช่น "14:30"
                        }}/>
                
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>เวลาที่เผยแพร่</span>}
                name="time_create"
                rules={[{ required: true, message: "กรุณาเลือกเวลา" }]}
            >
                <TimePicker  format={format}
                        style={{width:'100%',height:'48px'}} 
                        onChange={(date, dateString) => {
                        console.log("date object:", date);       // Moment object
                        console.log("Selected date:", dateString); // string เช่น "14:30"
                        }}
                />
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>วันหมดอายุ</span>}
                name="end_date"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
                <DatePicker style={{ width: "100%", height:'48px' }} 
                        onChange={(time, timeString) => {
                        console.log("Time object:", time);       // Moment object
                        console.log("Selected time:", timeString);
                        }} // string เช่น "14:30"
                />
            </Form.Item>

            <Form.Item
                label={<span style={{ fontSize: "18px" }}>กลุ่มเป้าหมาย</span>}
                name="target_group_id"
                rules={[{ required: true, message: "กรุณาเลือกกลุ่มเป้าหมาย" }]}
            >
                <Select placeholder="เลือกกลุ่มเป้าหมาย" style={{ width: "100%" ,height:'48px' }} 
                        onChange={(value) => {
                            console.log("เลือก:", value);
                        }}>
                        {targetGroups.map((tg,) => (
                        <Option key={tg.id ?? tg.id} value={tg.id}>
                            {tg.group_name}
                        </Option>
                        ))}
                                
                </Select>
            </Form.Item>

            </Col>
            </Row>
            <Form.Item style ={{ textAlign: "right"}}>

                {/* <Link to='/course'> */}
                <Button  type='primary' htmlType="button"
                    onClick={handleCancle}
                    style ={{ background:'#eae9e9',borderColor: '#eae9e9', color:'#000',}}>
                    ยกเลิก
                </Button>
                &nbsp;&nbsp;
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
export default EditAnnouncement