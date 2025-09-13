import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Col, Row, Card, Form, Input, Button, DatePicker, Select, TimePicker, message} from "antd";
import {EyeOutlined} from '@ant-design/icons';
// import { annoncementAPI} from '../../../../services/https'
import { announcementAPI, targetGroupAPI } from "../../../../services/https";
import type { TargetGroupInterface } from "../../../../interfaces/targetgroup";
import { Tune } from "@mui/icons-material";
const { Option } = Select;
interface SelectTargetGroup {
    value: string | null;
    onChange: (value: string) => void;
  }
const format = 'HH:mm';
const CreateAnnouncement:React.FC = () => {
    // const [SelectTargetGroup] = useState<string | null>(null);
    const [targetGroups, setTargetGroups] = useState<TargetGroupInterface[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
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

    useEffect(() => {
        fetchTargetGroups();
    }, []);

    const navigate = useNavigate();
    
//     const handleSave = async (isDraft: boolean) => {
//     try {
//         // ถ้าเป็น published → validate ทุก field
//         // ถ้าเป็น draft → validateเฉพาะบาง field
//         const fieldsToValidate = isDraft 
//             ? ['title', 'end_date']   // ตัวอย่าง: draft ต้องกรอกเฉพาะหัวข้อและวันหมดอายุ
//             : undefined;             // undefined = validate ทุก field

//         const values = await form.validateFields(fieldsToValidate);
//          console.log("✅ ผ่าน validation แล้ว ได้ค่า:", values);

//         // เรียก onFinish พร้อม status draft/published
//         await onFinish(values, isDraft );

//     } catch (error) {
//         // ถ้า validate fail จะไม่เรียก onFinish
//         console.log('❌ Validate failed:', error);
//     }
// };
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
    // const onFinish = async (values: any ,isDraft: boolean = false) => {
    //     // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
    //     // ตัวอย่าง: console.log(values);
    //     // เสร็จแล้วค่อย navigate กลับ
    //     console.log(" values0",values)
    //     try {
    //         console.log("ค่าที่ได้จากฟอร์ม:",values);
    //         //เพิ่ม state ว่าเป็น draft หรือ published
    //         const payload = {
    //             create_date: values.create_date ? values.create_date.format("YYYY-MM-DD") : null,
    //             end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
    //             time_create: values.time_create ? values.time_create.format("HH:mm:ss") : null,
    //             status: isDraft ? "draft" : "published",
                
    //         };
    //         console.log(" values1",values)

    //         const res = await announcementAPI.createAnnouncement(payload);
    //         console.log("sdfgfdsdfghgfdsdfghgfd",res)
    //         if (res){
    //             messageApi.success(isDraft ? "บันทึกฉบับร่างสำเร็จ" : "บันทึกสำเร็จ");
    //             setTimeout(() => {
    //                 navigate('/admin/announce');
    //             },1200);
    //         }else{
    //             messageApi.error("บันทึกข้อมูลไม่สำเร็จ");
    //         }
    //     }catch (error) {
    //     console.error("❌ Error saving course:", error);
    //     messageApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    // }
    //     // navigate('/admin/announce');
    // };
const formatValues = (values: any) => {
  return {
    ...values,
    create_date: values.create_date?.format("YYYY-MM-DD") || "",
    end_date: values.end_date?.format("YYYY-MM-DD") || "",
    time_create: values.time_create?.format("HH:mm") || "",
  };
};

    const onFinish = async (values: any, isDraft: boolean = false) => {
  try {
    console.log("ค่าที่ได้จากฟอร์ม (raw):", values);

    const payload = {
      ...formatValues(values),
        status: isDraft ? "ฉบับร่าง" : "เผยแพร่แล้ว", // ให้ตรงกับ backend
    };

    console.log("📌 payload ที่จะส่งไป backend:", payload);

    const res = await announcementAPI.createAnnouncement(payload);
    if (res) {
      messageApi.success(isDraft ? "บันทึกฉบับร่างสำเร็จ" : "บันทึกสำเร็จ");
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
        <div>
            
        <h2 style={{ fontSize:'26px', fontWeight: 'normal',color: '#015c91',padding:'16px',marginLeft:'-16px',}}>
            สร้างประกาศ
        </h2>
        <Col >
        <Card style={{ padding: 6, margin: "0 auto", maxWidth: 1690, }}>
        
        <Form
            form={form}   // ✅ ต้องใส่
            layout="vertical"
            style={{ maxWidth: 1700, margin: "0 auto", }} 
            requiredMark={false}// เพิ่ม requiredMark ที่นี่
            onFinish={onFinish}
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
                <Input.TextArea placeholder="เช่น เปิดเรียนภาคการศึกษาที่ 1 ปีการศึกษา 2568 ในวันที่ 15 พฤษภาคม 2568" style={{height:'370px', resize:'none'}}/>
            </Form.Item>
            </Col>

            <Col span={12}>
            <Form.Item 
            label={<span style={{ fontSize: "18px" }}>หมวดหมู่</span>}
            name="category"
            rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}>
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
            {/* <Input placeholder="เช่น คณิตศาสตร์พื้นฐาน" style={{height:'48px'}}/> */}
            </Form.Item>

            <Form.Item 
            label={<span style={{ fontSize: "18px" }}>เวลาที่เผยแพร่</span>}
            name="time_create"
            rules={[{ required: true, message: "กรุณาเลือกเวลา" }]}>
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
            {/* <Input placeholder="เช่น 3" style={{height:'48px'}}/> */}
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
            <Form.Item style={{ textAlign: "right" }}>
                {/* <Link to='/course'> */}

                <Button  type='primary' htmlType="button"
                                            onClick={handleCancle}
                                            style ={{ background:'#eae9e9',borderColor: '#eae9e9', color:'#000',}}>
                    ยกเลิก
                </Button>
                &nbsp;&nbsp;
                <Button type="default" htmlType="button" onClick={() => handleSave(true)}>
                    บันทึกเป็นฉบับร่าง
                </Button>
                &nbsp;&nbsp;
                <Button type="primary" htmlType="button"
                        onClick={() => handleSave(false)} 
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
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