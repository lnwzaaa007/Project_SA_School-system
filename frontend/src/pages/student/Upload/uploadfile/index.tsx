
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload';
import { useParams } from 'react-router-dom';
import { AssignmentAPI } from '../../../../services/https';
import type { AssignmentFormData } from '../../../../interfaces/Assignment';



const AssignmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<AssignmentFormData>({
    status: '',
    description: '',
    openDate: '',
    closeDate: '',
    file: null,
    feedback: ''
  });

  const [form] = Form.useForm();

  useEffect(() => {
    console.log("📌 AssignmentForm mounted with ID:", id);
  }, [id]);

 useEffect(() => {
  const fetchDetail = async () => {
    if (!id) return;
    try {
      console.log("🔍 กำลังโหลด Assignment ID:", id);
      const res = await AssignmentAPI.getAssignmentById(parseInt(id));
      console.log("✅ Assignment API Response:", res);

      if (res.data && res.data.length > 0) {
        const detail = res.data[0];

        // 📌 ฟังก์ชันตัดเวลาออก ให้เหลือแค่วันที่
        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          return dateStr.split("T")[0]; // ตัดหลัง T
        };

        setFormData(prev => ({
          ...prev,
          title: detail.assignment_title,
          description: detail.description,
          openDate: formatDate(detail.time_start),
          closeDate: formatDate(detail.time_end)
        }));

        console.log("📌 FormData หลังโหลด:", {
          openDate: formatDate(detail.time_start),
          closeDate: formatDate(detail.time_end)
        });
      } else {
        console.warn("⚠️ ไม่มีข้อมูล assignment ใน response");
      }
    } catch (err) {
      console.error("❌ โหลดรายละเอียดการบ้านผิดพลาด:", err);
      message.error("ไม่สามารถโหลดรายละเอียดการบ้านได้");
    }
  };
  fetchDetail();
}, [id]);


  const handleFileChange: UploadProps['onChange'] = info => {
    console.log("📂 FileChange Event:", info);
  
    if (info.file) {
      setFormData(prev => {
        const newData = { ...prev, file: info.file as unknown as  File || null };
        console.log("📌 FormData หลังเลือกไฟล์:", newData);
        return newData;
      });
    } 
  };

  const onFinish = (values: any) => {
    console.log("📝 onFinish values:", values);
    if (!formData.file) {
      message.error("กรุณาแนบไฟล์ก่อนส่ง");
      console.warn("⚠️ ไม่มีไฟล์แนบตอน submit");
      return;
    }

    const feedback = values.feedback ?? ""; // ถ้าไม่ได้กรอก = ""
    const finalData = { ...formData, feedback };
    console.log("📤 Data ที่จะส่งไป backend:", finalData);

    Modal.success({
      title: 'ส่งงานสำเร็จ',
      content: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      centered: true,
      okButtonProps: { style: { display: 'none' } }
    });

    setTimeout(() => Modal.destroyAll(), 1000);
  };

    

  return (
    <div style={{ padding: 20, background: '#d1eaff', borderRadius: 10, width: 500, marginTop: 20 }}>
      <h2>ส่งงาน</h2>
      <div>หัวข้อการบ้าน: {formData.title || '-'}</div>
      <div>คําอธิบาย: {formData.description || '-'}</div>
      <div>วันที่เปิด: {formData.openDate || '-'}</div>
      <div>วันที่ปิด: {formData.closeDate || '-'}</div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item  label="ไฟล์" required>
          <Upload beforeUpload={() => false} onChange={handleFileChange} maxCount={1}>
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
        </Form.Item>
        {/* <Form.Item label="ไฟล์" required>
          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              // ได้ไฟล์ดิบแน่นอน
              setFormData(prev => ({ ...prev, file }));
              return false; // กันอัปโหลดอัตโนมัติ
            }}
            onRemove={() => {
              setFormData(prev => ({ ...prev, file: null }));
            }}
          >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
        </Form.Item> */}

        <Form.Item label="ความคิดเห็น (ไม่บังคับ)" name="feedback" initialValue="">
          <Input.TextArea rows={2} placeholder="พิมพ์ข้อความถึงครู (ถ้าต้องการ)" />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary">ส่งงาน</Button>
        </Form.Item>

      </Form>
    </div>
  );
};

export default AssignmentForm;



