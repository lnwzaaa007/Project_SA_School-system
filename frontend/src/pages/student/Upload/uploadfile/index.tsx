// import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Modal,
  Card,
  Typography,
  Space,
  Divider,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { AssignmentAPI } from '../../../../services/https';
import type { AssignmentFormData } from '../../../../interfaces/Assignment';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:8088';

const AssignmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<AssignmentFormData>({
    status: '',
    description: '',
    openDate: '',
    closeDate: '',
    file: null,
    feedback: '',
  });

  const [submittedInfo, setSubmittedInfo] = useState<{
    status?: string;
    at?: string;
    url?: string;
    name?: string;
  } | null>(null);

  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);

  // โหลดรายละเอียดงานการบ้าน
  const fetchDetail = async () => {
    if (!id) return;
    try {
      const sid = Number(localStorage.getItem('IDstudent'));
      const res = await AssignmentAPI.getMySubmissionByAssignment(parseInt(id), sid);
      console.log('student submission', res);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const detail = res.data[0];
        setCourseId(detail.course_id);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const sub = res.data[0];
          setFormData(prev => ({ ...prev, status: sub.submit_status || 'ยังไม่ส่งงาน' }));
          setSubmittedInfo({
            status: sub.submit_status,
            at: sub.submit_at,
            url: `${API_BASE}/${sub.assignment_file}`,
            name: sub.assignment_file?.split('/').pop()
          });
        }
        const fmtDate = (s: string) => (s ? s.split('T')[0] : '');
        setFormData(prev => ({
          ...prev,
          title: detail.assignment_title,
          description: detail.description,
          openDate: fmtDate(detail.time_start),
          closeDate: fmtDate(detail.time_end),
          status: detail.submit_status || prev.status || 'ยังไม่ส่งงาน',
        }));

        if (detail.assignment_file) {
          setSubmittedInfo({
            status: detail.submit_status,
            at: detail.submit_at,
            url: `${API_BASE}/${detail.assignment_file}`,
            name: String(detail.assignment_file).split('/').pop(),
          });
        }
      } else {
        message.warning('ไม่พบข้อมูลการบ้านนี้');
      }
    } catch (err) {
      console.error(err);
      message.error('โหลดรายละเอียดการบ้านไม่สำเร็จ');
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ✅ ส่งงาน
  const onFinish = async (values: any) => {
    if (!formData.file) {
      message.error('กรุณาแนบไฟล์ก่อนส่ง');
      return;
    }
    const sid = localStorage.getItem('IDstudent');
    if (!sid) {
      message.error('ไม่พบรหัสนักเรียน (IDstudent)');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('assignment_title', formData.title || '');
      fd.append('description', formData.description || '');
      fd.append('student_comment', values.feedback || '');
      fd.append('submit_point_all', '0');
      fd.append('file', formData.file);
      fd.append('student_id', sid);
      if (courseId) fd.append('course_id', String(courseId));

      const res = await fetch(`${API_BASE}/submit-assignment`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('Submit failed', res.status, txt);
        message.error(txt || `ส่งงานไม่สำเร็จ (${res.status})`);
        return;
      }

      const payload = await res.json();
      const d = payload?.data;
      console.log('Backend response data', d);

      // ✅ อัปเดตสถานะทันที และโหลดข้อมูลจาก backend เพื่อความถูกต้อง
      setFormData(prev => ({ ...prev, status: 'ส่งงานแล้ว' }));
      setSubmittedInfo({
        status: 'ส่งงานแล้ว',
        at: new Date().toISOString(),
        url: payload?.file_url ? `${API_BASE}${payload.file_url}` :
             (d?.assignment_file ? `${API_BASE}/${d.assignment_file}` : undefined),
        name: d?.assignment_file ? String(d.assignment_file).split('/').pop() : formData.file.name,
      });

      Modal.success({
        title: 'ส่งงานสำเร็จ',
        content: `ส่งเมื่อ ${new Date().toLocaleString()}`,
        centered: true,
        onOk: fetchDetail, // โหลดข้อมูลจริงอีกครั้ง
      });

      form.resetFields(['feedback']);
    } catch (err) {
      console.error(err);
      message.error('อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 700,
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          padding: 24,
          background: '#fdfdfd',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          📝 ส่งงานการบ้าน
        </Title>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text><strong>หัวข้อการบ้าน:</strong> {formData.title || '-'}</Text>
          <Text><strong>คำอธิบาย:</strong> {formData.description || '-'}</Text>
          <Text><strong>วันที่เปิด:</strong> {formData.openDate || '-'}</Text>
          <Text><strong>วันที่ปิด:</strong> {formData.closeDate || '-'}</Text>
          <Text><strong>สถานะ:</strong> {formData.status || 'ยังไม่ส่งงาน'}</Text>

          {submittedInfo?.url && (
            <Card
              type="inner"
              title="ไฟล์ที่ส่งล่าสุด"
              style={{ background: '#f5faff', borderRadius: 12 }}
            >
              <Space direction="vertical">
                <a href={submittedInfo.url} target="_blank" rel="noreferrer">
                  {submittedInfo.name || 'ไฟล์แนบ'}
                </a>
                {submittedInfo.at && (
                  <Text type="secondary">
                    ส่งเมื่อ {new Date(submittedInfo.at).toLocaleString()}
                  </Text>
                )}
              </Space>
            </Card>
          )}

          <Divider />

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="แนบไฟล์" required>
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  setFormData(prev => ({ ...prev, file }));
                  return false;
                }}
                onRemove={() => setFormData(prev => ({ ...prev, file: null }))}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
              >
                <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="ความคิดเห็น (ไม่บังคับ)" name="feedback">
              <Input.TextArea rows={3} placeholder="เขียนข้อความถึงครู (ถ้าต้องการ)" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={uploading}
                disabled={uploading}
                style={{ width: 200, borderRadius: 8 }}
              >
                ส่งงาน
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default AssignmentForm;
