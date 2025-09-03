import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, Modal, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload';
import '@ant-design/v5-patch-for-react-19';
import { useLocation, useParams } from 'react-router-dom';
import { AssignmentAPI } from '../../../../services/https';

interface AssignmentFormData {
  status: string;
  openDate: string;
  closeDate: string;
  file: File | null;
  feedback: string;
}

const AssignmentForm: React.FC = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const { assignment_id } = useParams();

  const [formData, setFormData] = useState<AssignmentFormData>({
    status: '',
    openDate: '',
    closeDate: '',
    file: null,
    feedback: '',
  });

  console.log("📌 Assignment Detail ID:", assignment_id);
  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        if (!assignment_id) return;

        const res = await AssignmentAPI.getAssignmentById(parseInt(assignment_id));
        console.log("📌 Assignment Detail:", res.data);

        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            openDate: res.data.time_start || '',
            closeDate: res.data.time_end || '',
          }));
        }
      } catch (err) {
        console.error("❌ โหลดรายละเอียดการบ้านผิดพลาด:", err);
        message.error("ไม่สามารถโหลดรายละเอียดการบ้านได้");
      }
    };

    fetchAssignmentDetail();
  }, [assignment_id]);

  const handleFileChange: UploadProps['onChange'] = (info) => {
    if (info.file.status !== 'removed') {
      const file = info.file.originFileObj as File;
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const onFinish = (values: any) => {
    if (!formData.file) {
      message.error('กรุณาแนบไฟล์ก่อนกดบันทึก');
      return;
    }

    const data: AssignmentFormData = {
      status: formData.status,
      openDate: formData.openDate,
      closeDate: formData.closeDate,
      file: formData.file,
      feedback: values.feedback,
    };

    console.log("📤 Data ที่จะส่ง:", data);

    Modal.success({
      title: 'ส่งงานสำเร็จ',
      content: 'ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว',
      centered: true,
      okButtonProps: { style: { display: 'none' } },
    });

    setTimeout(() => {
      Modal.destroyAll();
    }, 1000);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 50,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        }}
        style={{
          backgroundColor: '#d1eaff',
          padding: 20,
          borderRadius: 10,
          width: '500px',
        }}
      >
        <h2>ส่งงาน</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <strong style={{ width: '100px' }}>สถานะ</strong>
          <span>:</span>
          <span>{formData.status}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <strong style={{ width: '100px' }}>วันที่เปิด</strong>
          <span>:</span>
          <span>{formData.openDate || '-'}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <strong style={{ width: '100px' }}>วันที่ปิด</strong>
          <span>:</span>
          <span>{formData.closeDate || '-'}</span>
        </div>

        <Form.Item label="ส่งไฟล์" required>
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
          {!formData.file && (
            <div style={{ color: 'red', marginTop: 5 }}>
              * กรุณาแนบไฟล์
            </div>
          )}
        </Form.Item>

        <Form.Item
          label="ความคิดเห็น"
          name="feedback"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AssignmentForm;
