import React, { useRef, useState, useEffect } from "react";
import {
  Form, Input, Select, DatePicker, Button, Space, Upload, Row, Col, Typography,
  AutoComplete, message, type AutoCompleteProps
} from "antd";
import type { UploadProps } from "antd/es/upload";
// import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";
import { studentCRUD, gradeCRUD } from "../../services/https";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title } = Typography;

// แปลง path สัมพัทธ์ให้เป็น Absolute URL
const API_HOST = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const toUrl = (p?: string) => {
  if (!p) return "";
  if (/^(https?:|blob:|data:)/i.test(p)) return p;          // full, blob, data
  return `${API_HOST}/${String(p).replace(/^\/+/, "")}`;    // /uploads/... -> http://host/uploads/...
};

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// อ่านไฟล์เป็น dataURL (base64) เพื่อส่งเข้า backend
const fileToDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function Edit() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
const [serverImagePath, setServerImagePath] = useState<string>(""); // รูปที่มาจาก DB/API
const [imageUrl, setImageUrl] = useState<string | null>(null); 
  const { id } = useParams<{ id?: string }>();
  const editingStudentId = id ? Number(id) : undefined;

   // ⬅️ ดึง imageBase64 ออกมาด้วย (เอาไว้ส่งให้ backend และใช้ตอน “บันทึกรูปภาพ”)
  const { setStudent, imageBase64, setImageBase64, saveAll, saving } = useStudentCreate();
 // รูปที่มาจาก DB/API

  //picture
 // objectURL สำหรับพรีวิวทันที
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const previewUrlRef = useRef<string | null>(null);


  const [natOpen, setNatOpen] = useState(false);

  // ตัวเลือกสัญชาติ (จะเพิ่มภายหลังก็ใส่เพิ่มได้)
  const nationalityOptions = [
    { value: "ไทย" },
    { value: "ลาว" },
    { value: "กัมพูชา" }
  ];

 const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);

  // cleanup objectURL ตอน component unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

const [gradeOptions, setGradeOptions] = useState<{ value: number; label: string }[]>([]);

useEffect(() => {
  (async () => {
    try {
      const res = await gradeCRUD.list();
      console.log("GET /grades ->", res.status, res.data); // <-- เช็คตรงนี้
      const list = res?.data?.data ?? res?.data ?? [];
      setGradeOptions(list.map((g: any) => ({
        value: Number(g.id), 
        label: `ม. ${g.grade_year} / ${g.grade_class}`,
      })));
    } catch (e: any) {
      message.error(e?.message || "โหลดชั้น/ห้องไม่สำเร็จ");
    }
  })();
}, []);


const hydratedRef = useRef(false);

useEffect(() => {
  if (!editingStudentId || hydratedRef.current) return;
  hydratedRef.current = true;
  (async () => {
    try {
      const res = await studentCRUD.getById(editingStudentId);
      const s = res?.data?.data ?? res?.data;
      if (!s) return;

      // ⬇⬇ ใช้คีย์รูปจากหลังบ้าน (ปรับชื่อให้ตรงกับของคุณได้)
      const pathFromDb =
        s.student_image || s.Student_image || s.image || s.photo || "";

      if (pathFromDb) {
        setServerImagePath(toUrl(pathFromDb));     // path สัมพัทธ์ -> absolute
      } else {
        // fallback ไป endpoint ของคุณ (ควรให้มันคืน absolute อยู่แล้ว ถ้าไม่ใช่ก็ครอบ toUrl ได้)
        setServerImagePath(toUrl(studentCRUD.imageUrl(editingStudentId)));
      }

      form.setFieldsValue({
        student_id: s.student_id,
        title_id: s.title_id,
        t_first_name: s.t_first_name,
        t_last_name: s.t_last_name,
        e_first_name: s.e_first_name,
        e_last_name: s.e_last_name,
        citizen_id: s.citizen_id,
        tel: s.tel,
        date_of_birth: s.date_of_birth ? dayjs(s.date_of_birth) : undefined,
        age: s.date_of_birth ? calculateAge(new Date(s.date_of_birth)) : undefined,
        gender: s.gender === "หญิง" ? "female" : s.gender === "ชาย" ? "male" : undefined,
        nationality: s.nationality,
        email: s.email,
        religious: s.religious,
        grade_id: s.grade_id,
      });

      setStudent({
        student_id: s.student_id,
        title_id: s.title_id,
        t_first_name: s.t_first_name,
        t_last_name: s.t_last_name,
        e_first_name: s.e_first_name,
        e_last_name: s.e_last_name,
        citizen_id: s.citizen_id,
        tel: s.tel,
        date_of_birth: s.date_of_birth,
        gender: s.gender === "หญิง" ? "female" : s.gender === "ชาย" ? "male" : "",
        nationality: s.nationality,
        email: s.email,
        religious: s.religious,
        grade_id: s.grade_id,
      });
    } catch (e: any) {
      message.error(e?.message || "โหลดข้อมูลนักเรียนไม่สำเร็จ");
    }
  })();
}, [editingStudentId]);


  // อัปโหลดรูป: พรีวิวทันทีด้วย objectURL + เก็บ base64 (dataURL) สำหรับส่งหลังบ้าน
 const handleUpload: UploadProps["onChange"] = async (info) => {
  const file = (info.file.originFileObj || info.fileList[0]?.originFileObj) as File | undefined;
  if (!file) return;

  if (!file.type?.startsWith("image/")) return message.error("กรุณาเลือกไฟล์รูปภาพ");
  if (file.size > 3 * 1024 * 1024) return message.error("ขนาดรูปต้องไม่เกิน 3MB");

  const previewUrl = URL.createObjectURL(file);
  if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  previewUrlRef.current = previewUrl;
  setImageUrl(previewUrl);

  try {
    const dataUrl = await fileToDataURL(file);
    setImageBase64(dataUrl);
    message.success("โหลดรูปภาพสำเร็จ");
  } catch {
    message.error("อ่านไฟล์รูปไม่สำเร็จ");
  }
};

  // บันทึกรูปอย่างเดียว (เฉพาะตอนมี student id แล้ว)
 const handleSaveOnlyImage = async () => {
  if (!imageBase64) return;

  if (!editingStudentId) {
    message.info("รูปจะถูกบันทึกเมื่อกด 'บันทึกทั้งหมด'");
    setIsEditingImage(false);
    return;
  }

  try {
    setSavingImage(true);
    await studentCRUD.update(editingStudentId, { student_image: imageBase64 });
    message.success("อัปเดตรูปนักเรียนสำเร็จ");

    // กัน cache: อัปเดต URL ใน state (อย่าคำนวณใน JSX)
    const base = toUrl(studentCRUD.imageUrl(editingStudentId));
    setServerImagePath(`${base}${base.includes("?") ? "&" : "?"}t=${Date.now()}`);

    // กลับไปใช้รูปจากเซิร์ฟเวอร์แทนพรีวิว
    setImageUrl(null);
    setIsEditingImage(false);
  } catch (e: any) {
    message.error(e?.message || "อัปเดตรูปไม่สำเร็จ");
  } finally {
    setSavingImage(false);
  }
};

//   const hydratedRef = React.useRef(false);
useEffect(() => {
  if (!editingStudentId || hydratedRef.current) return;
  hydratedRef.current = true;
  (async () => {
    try {
      const res = await studentCRUD.getById(editingStudentId);
      const s = res?.data?.data ?? res?.data;
      if (!s) return;

      // ดึงพาธรูปจาก DB ถ้ามี, ไม่มีก็ค่อย fallback ไป endpoint
      const pathFromDb = s.student_image || s.Student_image || s.image || s.photo || "";
      if (pathFromDb) {
        setServerImagePath(toUrl(pathFromDb));
      } else {
        setServerImagePath(toUrl(studentCRUD.imageUrl(editingStudentId)));
      }

      // ... setFieldsValue / setStudent ตามเดิม ...
    } catch (e: any) {
      message.error(e?.message || "โหลดข้อมูลนักเรียนไม่สำเร็จ");
    }
  })();
}, [editingStudentId]);


  const handleSearch = (value: string) => {
    if (!value || value.includes("@")) return setOptions([]);
    const domains = ["gmail.com", "hotmail.com", "icloud.com"];
    setOptions(domains.map((d) => ({ label: `${value}@${d}`, value: `${value}@${d}` })));
  };

  // push ค่า form → context ตลอด (tab อื่นๆ กดไปมา ค่าไม่หาย)
   const pushToContext = (_: any, all: any) => {
    const dob = all?.date_of_birth ? dayjs(all.date_of_birth).format("YYYY-MM-DD") : undefined;
    setStudent({
      student_id: String(all.student_id || "").trim(),
      title_id: all?.title_id ? Number(all.title_id) : undefined,
      t_first_name: String(all.t_first_name || "").trim(),
      t_last_name: String(all.t_last_name || "").trim(),
      e_first_name: String(all.e_first_name || "").trim(),
      e_last_name: String(all.e_last_name || "").trim(),
      citizen_id: String(all.citizen_id || "").trim(),
      tel: String(all.tel || "").trim(),
      date_of_birth: dob,
      gender: all.gender,
      nationality: String(all.nationality || "").trim(),
      email: String(all.email || "").trim(),
      religious: String(all.religious || "").trim(),
      grade_id: all?.grade_id ? Number(all.grade_id) : undefined, // รับ PK จาก Select เดียว
    });
  };


  const tabStyle = { background: "#fff", padding: 24, borderRadius: 16 };
  const outerBox: React.CSSProperties = { width: 280, minHeight: 360, border: "1px solid #ccc", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, background: "#fff" };
  const imageBox: React.CSSProperties = { width: 200, aspectRatio: "1 / 1", border: "1px solid #ccc", borderRadius: "50%", display: "flex", margin: "30px 0 20px", justifyContent: "center", alignItems: "center", background: "#717171", overflow: "hidden" };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={tabStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Title level={4} style={{ margin: 0 }}>ข้อมูลทั่วไป</Title>
      <Button
  type="primary"
  loading={saving}
  onClick={async () => {
    try {
      await form.validateFields();
      const ok = await saveAll(editingStudentId); // ส่ง id ตอนแก้ไข
      if (ok) {
              setTimeout(() => {
        navigate("/admin/ManageStudent");
      }, 1200);
      }
    } catch (e) { /* ignore */ }
  }}
>
  บันทึกทั้งหมด
</Button>
            </div>

            <Form form={form} layout="vertical" onValuesChange={pushToContext}>
              <Row gutter={16} justify="center">
                <Col span={20}>
                  <Form.Item label="รหัสนักเรียน" name="student_id" rules={[{ required: true, message: "กรอก รหัสนักเรียน" }]}>
                    <Input style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                 <Form.Item
  label="เลขบัตรประชาชน"
  name="citizen_id"
  normalize={(v) => String(v ?? "").replace(/\D/g, "").slice(0, 13)}
  rules={[
    { required: true, message: "กรอก เลขบัตรประชาชน" },
    { pattern: /^\d+$/, message: "ต้องเป็นตัวเลขเท่านั้น" },
    { len: 13, message: "ต้องมีความยาว 13 หลัก" },
  ]}
>
  <Input
    inputMode="numeric"
    maxLength={13}
    style={{ height: 35 }}
  />
</Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="คำนำหน้า" name="title_id" >
                    <Select style={{ height: 35 }}>
                      <Option value={3}>นาย</Option>
                      <Option value={4}>นางสาว</Option>
                      <Option value={5}>นาง</Option>
                      <Option value={1}>เด็กชาย</Option>
                      <Option value={2}>เด็กหญิง</Option>
                      <Option value={6}>-</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ชื่อ" name="t_first_name">
                    <Input style={{ height: 35 }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="นามสกุล" name="t_last_name" >
                    <Input style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="วันเกิด" name="date_of_birth" >
                    <DatePicker
                      style={{ width: "100%", height: 35 }}
                      onChange={(date) => {
                        if (date) {
                          const age = calculateAge(date.toDate());
                          form.setFieldsValue({ age });
                        } else {
                          form.setFieldsValue({ age: undefined });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="อายุ" name="age">
                    <Input disabled style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="เพศ" name="gender">
                    <Select style={{ height: 35 }}>
                      <Option value="male">ชาย</Option>
                      <Option value="female">หญิง</Option>
                    </Select>
                  </Form.Item>
                </Col>
               <Col span={10}>
 <Form.Item label="ชั้น/ห้อง" name="grade_id" rules={[{ required: true, message: "เลือกชั้น/ห้อง" }]}>
  <Select
    options={gradeOptions}
    style={{ height: 35 }}
    showSearch
    optionFilterProp="label"
    onChange={(pk: number) => setStudent({ grade_id: pk })} // ส่งเป็น PK id
  />
</Form.Item>
</Col>

                <Col span={10}>
                  <Form.Item label="Firstname" name="e_first_name">
                    <Input style={{ height: 35 }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="Lastname" name="e_last_name">
                    <Input style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="สัญชาติ" name="nationality">
  <AutoComplete
    style={{ width: "100%" }}
    options={nationalityOptions}
    // เปิด dropdown ทันทีเมื่อโฟกัส (ไม่ต้องพิมพ์ก่อน)
    open={natOpen}
    onFocus={() => setNatOpen(true)}
    onBlur={() => setNatOpen(false)}
    // กรองตัวเลือกตามที่พิมพ์ (แต่ยังพิมพ์ค่าอื่นที่ไม่มีในลิสต์ได้)
    filterOption={(input, option) =>
      (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
    }
  />
</Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ศาสนา" name="religious">
                    <Select
                      optionFilterProp="label"
                      options={[
                        { value: "พุทธ", label: "พุทธ" },
                        { value: "คริสต์", label: "คริสต์" },
                        { value: "อิสลาม", label: "อิสลาม" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col span={10}>
                 <Form.Item
  label="เบอร์ติดต่อ"
  name="tel"
   normalize={(v) => String(v ?? "").replace(/\D/g, "").slice(0, 10)}
  rules={[
    { required: true, message: "กรอก เบอร์ติดต่อ" },
    { pattern: /^\d+$/, message: "ต้องเป็นตัวเลขเท่านั้น" },
    { len: 10, message: "ต้องมีความยาว 10 หลัก" },
  ]}
>
  <Input
    inputMode="numeric"
    maxLength={10}
    style={{ height: 35 }}
  />
</Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="Email" name="email">
                    <AutoComplete style={{ width: "100%" }} options={options} onSearch={handleSearch} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>

        {/* อัปโหลด/รูป */}
        <div style={outerBox}>
<div style={imageBox}>
  {imageUrl ? (
    // พรีวิวจากไฟล์ที่เพิ่งเลือก (blob/data)
    <img
      src={imageUrl}
      alt="profile"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : serverImagePath ? (
    // รูปจากหลังบ้าน (absolute แล้ว)
    <img
      src={serverImagePath}
      alt="profile"
      // อย่าล้าง state ทิ้งใน onError ไม่งั้นรูปหาย ให้แค่ log เตือน
      onError={() => console.warn("Cannot load image:", serverImagePath)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    "รูปภาพ"
  )}
</div>

          <Space direction="vertical" size="middle" style={{ width: "100%", alignItems: "center" }}>
           {!isEditingImage ? (
  <Button style={{ width: 150, height: 32 }} onClick={() => setIsEditingImage(true)}>
    แก้ไขรูปภาพ
  </Button>
) : (
  <>
    <Upload accept="image/*" showUploadList={false} beforeUpload={() => false} onChange={handleUpload}>
      <Button>อัปโหลดรูปภาพ</Button>
    </Upload>
    <Space direction="vertical" size="middle" style={{ width: "100%", alignItems: "center" }}>
      <Button type="primary" loading={savingImage} style={{ width: 150, height: 32 }}
        onClick={handleSaveOnlyImage} disabled={!imageBase64}>
        บันทึกรูปภาพ
      </Button>
      <Button style={{ width: 120, height: 32 }} onClick={() => setIsEditingImage(false)}>
        ยกเลิก
      </Button>
    </Space>
  </>
)}
          </Space>
        </div>
      </div>
    </div>
  );
}
