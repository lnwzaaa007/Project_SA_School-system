// import React, { useEffect, useState } from 'react';
// import { Form, Input, Button, Upload, message, Modal } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { useParams } from 'react-router-dom';
// import { AssignmentAPI } from '../../../../services/https';
// import type { AssignmentFormData } from '../../../../interfaces/Assignment';

// const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:8088';

// const AssignmentForm: React.FC = () => {
//   const { id } = useParams<{ id: string }>();

//   const [formData, setFormData] = useState<AssignmentFormData>({
//     status: '',
//     description: '',
//     openDate: '',
//     closeDate: '',
//     file: null,
//     feedback: '',
//   });

//   const [courseId, setCourseId] = useState<number | null>(null);
//   const [submittedInfo, setSubmittedInfo] = useState<{
//     status?: string;
//     at?: string;
//     url?: string;
//     name?: string;
//   } | null>(null);

//   const [form] = Form.useForm();
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     // โหลดรายละเอียดงานเพื่อโชว์หัวข้อ/ช่วงเวลา + ค่าที่เคยส่ง (ถ้ามี)
//     console.log("start");
//     const fetchDetail = async () => {
//       if (!id) return;
//       try {
//         const res = await AssignmentAPI.getAssignmentById(parseInt(id));
//         if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
//           const detail = res.data[0];
//           const fmtDate = (s: string) => (s ? s.split('T')[0] : '');

//           setFormData(prev => ({
//             ...prev,
//             title: detail.assignment_title,
//             description: detail.description,
//             openDate: fmtDate(detail.time_start),
//             closeDate: fmtDate(detail.time_end),
//             status: detail.submit_status || prev.status || 'ยังไม่ส่งงาน',
//           }));

//           if (detail.course_id) setCourseId(detail.course_id);

//           // ถ้าเคยส่งแล้ว ให้โชว์ลิงก์ไฟล์และเวลาที่ส่ง
//           if (detail.assignment_file) {
//             setSubmittedInfo({
//               status: detail.submit_status,
//               at: detail.submit_at,
//               url: `${API_BASE}/${detail.assignment_file}`,
//               name: String(detail.assignment_file).split('/').pop(),
//             });
//           }
//         } else {
//           message.warning('ไม่พบข้อมูลการบ้านนี้');
//         }
//       } catch (err) {
//         console.error(err);
//         message.error('โหลดรายละเอียดการบ้านไม่สำเร็จ');
//       }
//     };
//     fetchDetail();
//   }, [id]);

//   const onFinish = async (values: any) => {
//     if (!formData.file) {
//       message.error('กรุณาแนบไฟล์ก่อนส่ง');
//       return;
//     }
//     console.log("Step 1");

//     // 👉 ดึงข้อมูลผู้ใช้/เทอมจาก localStorage (คุณสามารถปรับให้ดึงจาก context/redux ได้)
//     // const studentId = (localStorage.getItem('student_id') || 0);
//     // const gradeId   = Number(localStorage.getItem('grade_id') || 0);
//     // const teacherId = Number(localStorage.getItem('teacher_id') || 0);
//     // const termId    = Number(localStorage.getItem('term_id') || 0);
//     // const token     = localStorage.getItem('token') || '';

//     // console.log(studentId)


//     console.log("Step 2");

//     try {
//       setUploading(true);

//       // ✅ ส่งงานจริงไปที่ /submit-assignment (ไม่ใช่ /upload)
//       const fd = new FormData();
//       // fd.append('grade_id', String(gradeId));
//       // fd.append('course_id', String(courseId));
//       // fd.append('teacher_id', String(teacherId));
//       // fd.append('term_id', String(termId));
//       // fd.append('student_id', String(studentId));
//       fd.append('assignment_title', formData.title ?? '');
//       fd.append('description', formData.description ?? '');
//       fd.append('student_comment', values.feedback ?? '');
//       fd.append('submit_point_all', String(0)); // ถ้ามีคะแนนเต็มจริงค่อยใส่
//       fd.append('file', formData.file);         // ชื่อคีย์ต้องตรงกับ backend
      
//       console.log("---- FormData values ----");
// for (const [key, value] of fd.entries()) {
//   if (value instanceof File) {
//     console.log(`${key} (filename):`, value.name);
//     console.log(`${key} (size):`, value.size, "bytes");
//     console.log(`${key} (type):`, value.type);
//   } else {
//     console.log(`${key}:`, value);
//   }
// }
// console.log("-------------------------");
//       console.log("-------------------------");

//       const res = await fetch(`${API_BASE}/submit-assignment`, {
//         method: 'POST',
//         body: fd,
//         // headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       });
//       if (!res.ok) throw new Error(`Submit failed ${res.status}`);
//       const payload = await res.json();
//       const d = payload?.data;

//       // อัปเดตสถานะ/ไฟล์/เวลาให้ผู้ใช้เห็นทันที
//       setFormData(prev => ({ ...prev, status: d?.submit_status || 'ส่งงานแล้ว' }));
//       setSubmittedInfo({
//         status: d?.submit_status || 'ส่งงานแล้ว',
//         at: d?.submit_at,
//         url: d?.assignment_file ? `${API_BASE}/${d.assignment_file}` : undefined,
//         name: d?.assignment_file ? String(d.assignment_file).split('/').pop() : formData.file.name,
//       });

//       Modal.success({
//         title: 'ส่งงานสำเร็จ',
//         content: (
//           <>
//             <div>สถานะ: {d?.submit_status || 'ส่งงานแล้ว'}</div>
//             <div>ส่งเมื่อ: {d?.submit_at ? new Date(d.submit_at).toLocaleString() : '-'}</div>
//             {d?.assignment_file && (
//               <div>
//                 ไฟล์ที่ส่ง:{' '}
//                 <a href={`${API_BASE}/${d.assignment_file}`} target="_blank" rel="noreferrer">
//                   {String(d.assignment_file).split('/').pop()}
//                 </a>
//               </div>
//             )}
//           </>
//         ),
//         centered: true,
//       });

//       // เคลียร์เฉพาะช่องคอมเมนต์; เก็บไฟล์/สถานะไว้ให้เห็น
//       form.resetFields(['feedback']);
//     } catch (e) {
//       console.error(e);
//       message.error('อัปโหลดไม่สำเร็จ');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20, background: '#d1eaff', borderRadius: 10, width: 520, marginTop: 20 }}>
//       <h2>ส่งงาน</h2>
//       <div>หัวข้อการบ้าน: {formData.title || '-'}</div>
//       <div>คําอธิบาย: {formData.description || '-'}</div>
//       <div>วันที่เปิด: {formData.openDate || '-'}</div>
//       <div>วันที่ปิด: {formData.closeDate || '-'}</div>
//       <div>สถานะ: {formData.status || 'ยังไม่ส่งงาน'}</div>

//       {/* เคยส่งแล้ว → โชว์ไฟล์ล่าสุดให้เปิดดูได้ทันที */}
//       {submittedInfo?.url && (
//         <div style={{ marginTop: 8 }}>
//           <b>ไฟล์ที่ส่งล่าสุด:</b>{' '}
//           <a href={submittedInfo.url} target="_blank" rel="noreferrer">
//             {submittedInfo.name || 'ไฟล์แนบ'}
//           </a>
//           {submittedInfo.at && (
//             <span style={{ marginLeft: 8, color: '#555' }}>
//               (เมื่อ {new Date(submittedInfo.at).toLocaleString()})
//             </span>
//           )}
//         </div>
//       )}

//       <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 12 }}>
//         <Form.Item label="ไฟล์" required>
//           <Upload
//             maxCount={1}
//             beforeUpload={(file) => {
//               setFormData(prev => ({ ...prev, file }));
//               return false; // ไม่ให้อัปเอง
//             }}
//             onRemove={() => setFormData(prev => ({ ...prev, file: null }))}
//             accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
//           >
//             <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
//           </Upload>
//         </Form.Item>

//         <Form.Item label="ความคิดเห็น (ไม่บังคับ)" name="feedback" initialValue="">
//           <Input.TextArea rows={2} placeholder="พิมพ์ข้อความถึงครู (ถ้าต้องการ)" />
//         </Form.Item>

//         <Form.Item>

//           <Button htmlType="submit" type="primary" loading={uploading} disabled={uploading}>

//             ส่งงาน
//           </Button>
//         </Form.Item>
//       </Form>
//     </div>
//   );
// };

// export default AssignmentForm;

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { AssignmentAPI } from '../../../../services/https';
import type { AssignmentFormData } from '../../../../interfaces/Assignment';

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

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const res = await AssignmentAPI.getAssignmentById(parseInt(id));
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const detail = res.data[0];
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
    fetchDetail();
  }, [id]);

  const onFinish = async (values: any) => {
    if (!formData.file) {
      message.error('กรุณาแนบไฟล์ก่อนส่ง');
      return;
    }

    try {
      setUploading(true);

      // ✅ โหมดทดลอง: ไม่ส่ง studentId / courseId / termId / teacherId
      const fd = new FormData();
      fd.append('assignment_title', formData.title ?? '');
      fd.append('description', formData.description ?? '');
      fd.append('student_comment', values.feedback ?? '');
      fd.append('submit_point_all', String(0));
      fd.append('file', formData.file);

      // Debug: ดูค่าที่ส่งจริง
      console.log('---- FormData values ----');
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) {
          console.log(`${key} (filename):`, value.name, '| size:', value.size, '| type:', value.type);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log('-------------------------');

      const res = await fetch(`${API_BASE}/submit-assignment`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error(`Submit failed ${res.status}`);
      const payload = await res.json();
      const d = payload?.data;

      // อัปเดตสถานะ/ไฟล์/เวลาให้ผู้ใช้เห็นทันที
      setFormData(prev => ({ ...prev, status: d?.submit_status || 'ส่งงานแล้ว' }));
      setSubmittedInfo({
        status: d?.submit_status || 'ส่งงานแล้ว',
        at: d?.submit_at,
        url: payload?.file_url ? `${API_BASE}${payload.file_url}` :
             (d?.assignment_file ? `${API_BASE}/${d.assignment_file}` : undefined),
        name: d?.assignment_file ? String(d.assignment_file).split('/').pop() : formData.file.name,
      });

      Modal.success({
        title: 'ส่งงานสำเร็จ',
        content: (
          <>
            <div>สถานะ: {d?.submit_status || 'ส่งงานแล้ว'}</div>
            <div>ส่งเมื่อ: {d?.submit_at ? new Date(d.submit_at).toLocaleString() : '-'}</div>
            {(payload?.file_url || d?.assignment_file) && (
              <div>
                ไฟล์ที่ส่ง:{' '}
                <a
                  href={payload?.file_url ? `${API_BASE}${payload.file_url}` : `${API_BASE}/${d.assignment_file}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {d?.assignment_file ? String(d.assignment_file).split('/').pop() : formData.file.name}
                </a>
              </div>
            )}
          </>
        ),
        centered: true,
      });

      form.resetFields(['feedback']);
    } catch (e) {
      console.error(e);
      message.error('อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#d1eaff', borderRadius: 10, width: 520, marginTop: 20 }}>
      <h2>ส่งงาน</h2>
      <div>หัวข้อการบ้าน: {formData.title || '-'}</div>
      <div>คําอธิบาย: {formData.description || '-'}</div>
      <div>วันที่เปิด: {formData.openDate || '-'}</div>
      <div>วันที่ปิด: {formData.closeDate || '-'}</div>
      <div>สถานะ: {formData.status || 'ยังไม่ส่งงาน'}</div>

      {submittedInfo?.url && (
        <div style={{ marginTop: 8 }}>
          <b>ไฟล์ที่ส่งล่าสุด:</b>{' '}
          <a href={submittedInfo.url} target="_blank" rel="noreferrer">
            {submittedInfo.name || 'ไฟล์แนบ'}
          </a>
          {submittedInfo.at && (
            <span style={{ marginLeft: 8, color: '#555' }}>
              (เมื่อ {new Date(submittedInfo.at).toLocaleString()})
            </span>
          )}
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 12 }}>
        <Form.Item label="ไฟล์" required>
          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              setFormData(prev => ({ ...prev, file }));
              return false; // ไม่ให้อัปเอง
            }}
            onRemove={() => setFormData(prev => ({ ...prev, file: null }))}
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
