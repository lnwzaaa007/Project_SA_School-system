import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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
  const [uploading, setUploading] = useState(false); // สำหรับปุ่ม

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
          const formatDate = (dateStr: string) =>
            dateStr ? dateStr.split("T")[0] : '';

          setFormData(prev => ({
            ...prev,
            title: detail.assignment_title,
            description: detail.description,
            openDate: formatDate(detail.time_start),
            closeDate: formatDate(detail.time_end)
          }));
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

  const onFinish = async (values: any) => {
    console.log("📝 onFinish values:", values);

    if (!formData.file) {
      message.error("กรุณาแนบไฟล์ก่อนส่ง");
      console.warn("⚠️ ไม่มีไฟล์แนบตอน submit");
      return;
    }

    try {
      setUploading(true);

      // ✅ อัปโหลดไฟล์ไป /upload
      const fd = new FormData();
      fd.append("file", formData.file); // ชื่อคีย์ต้องตรงกับ backend UploadFileOnly

      const res = await fetch("http://localhost:8088/upload", {
        method: "POST",
        body: fd, // อย่าตั้ง Content-Type เอง
      });
      if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
      const data = await res.json();
      console.log("✅ Upload response:", data);

      Modal.success({
        title: 'ส่งงานสำเร็จ',
        content: `อัปโหลดไฟล์เรียบร้อย\nไฟล์: ${data.filename ?? formData.file.name}\nที่เก็บ: ${data.path ?? '-'}`,
        centered: true,
      });

      // เคลียร์เฉพาะสิ่งที่เกี่ยวข้อง
      setFormData(prev => ({ ...prev, file: null, feedback: '' }));
      form.resetFields(['feedback']);

    } catch (err) {
      console.error(err);
      message.error("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#d1eaff', borderRadius: 10, width: 500, marginTop: 20 }}>
      <h2>ส่งงาน</h2>
      <div>หัวข้อการบ้าน: {formData.title || '-'}</div>
      <div>คําอธิบาย: {formData.description || '-'}</div>
      <div>วันที่เปิด: {formData.openDate || '-'}</div>
      <div>วันที่ปิด: {formData.closeDate || '-'}</div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="ไฟล์" required>
          <Upload
            maxCount={1}
            // ✅ ได้ File ดิบทุกครั้งที่เลือก
            beforeUpload={(file) => {
              setFormData(prev => ({ ...prev, file }));
              return false; // กันอัปโหลดอัตโนมัติ
            }}
            onRemove={() => {
              setFormData(prev => ({ ...prev, file: null }));
            }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
          >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="ความคิดเห็น (ไม่บังคับ)" name="feedback" initialValue="">
          <Input.TextArea rows={2} placeholder="พิมพ์ข้อความถึงครู (ถ้าต้องการ)" />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary" loading={uploading} disabled={uploading}>
            ส่งงาน
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AssignmentForm;
