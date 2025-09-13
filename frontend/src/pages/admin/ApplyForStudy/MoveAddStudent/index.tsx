// src/pages/admin/MoveAddStudent.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Row, Col, Input, DatePicker, Select, Space, message, Button, Image, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import SelectGrade from "../../../../components/SelectGrade";
import SelectClass from "../../../../components/SelectClass";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleTH from "../../../../components/SelectTitleTH";
import SelectTitleENG from "../../../../components/SelectTitleENG";
import Upload from "../../../../components/Upload";
import UploadImages from "../../../../components/UploadImages";
import ModalSave from "../../../../components/ModalSeve";
import MadalCancel from "../../../../components/ModalCancel";
import { EnrollmentAPI } from "../../../../services/https";

const { Option } = Select;

const API_HOST = import.meta.env.VITE_API_KEY || "http://localhost:8088";

const toUrl = (p?: string) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return `${API_HOST}/${p.replace(/^\/+/, "")}`;
};
const isImage = (p?: string) => !!p && /\.(png|jpe?g|gif|webp|bmp)$/i.test(p);
const isPdf = (p?: string) => !!p && /\.pdf($|\?)/i.test(p);

// ---------- NEW: helper คำนวณอายุ ----------
const calcAge = (d: Dayjs): number => {
  const today = dayjs();
  let a = today.year() - d.year();
  if (today.month() < d.month() || (today.month() === d.month() && today.date() < d.date())) {
    a--;
  }
  return Math.max(a, 0);
};

const MoveAddStudent: React.FC = () => {
const FilePreview: React.FC<{
  path?: string;
  width?: number;
  height?: number;
}> = ({ path, width = 180, height = 240 }) => {
  if (!path) return <div>—</div>;
  const url = toUrl(path);

  if (isImage(path)) {
    // Ant Design <Image> ขยายได้ด้วยตัวเองเมื่อคลิก
    return <Image width={width} src={url} style={{ borderRadius: 8 }} />;
  }

  if (isPdf(path)) {
    return (
      <div>
        <iframe
          src={url}
          width={width}
          height={height}
          style={{ border: "1px solid #eee", borderRadius: 8 }}
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <Button type="primary" onClick={() => setPdfPreview(url)}>
            ขยายดู
          </Button>
          <Button href={url} target="_blank" rel="noopener noreferrer">
            เปิดแท็บใหม่
          </Button>
        </div>
        <Modal
          open={!!pdfPreview}
          onCancel={() => setPdfPreview(null)}
          footer={null}
          width="50%"
          height="180%"
          style={{ top: 24 }}
          bodyStyle={{ padding: 0 }}
          destroyOnClose
        >
          {pdfPreview && (
            <iframe
              src={pdfPreview}
              width="100%"
              height="800 px"
              style={{ border: "none", borderRadius: 8 }}
            />
          )}
        </Modal>

      </div>
    );
  }

  return (
    <Button href={url} target="_blank" rel="noopener noreferrer">
      เปิดไฟล์
    </Button>
  );
};

  const [search] = useSearchParams();
  const navigate = useNavigate();
  const viewId = search.get("id");

  // ---------- form states ----------
  const [citizenId, setCitizenId] = useState("");
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [thTitleId, setThTitleId] = useState<number | null>(null);
  const [thFirst, setThFirst] = useState("");
  const [thLast, setThLast] = useState("");
  const [enTitleId, setEnTitleId] = useState<number | null>(null);
  const [enFirst, setEnFirst] = useState("");
  const [enLast, setEnLast] = useState("");
  const [status, setStatus] = useState<"โสด" | "สมรส" | undefined>();
  const [genderId, setGenderId] = useState<number | null>(null);
  const [gradeYear, setGradeYear] = useState<number | null>(null);
  const [gradeClass, setGradeClass] = useState<number | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);

  const [nationality, setNationality] = useState("");
  const [religious, setReligious] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  // ✅ ใหม่
  const [guardian, setGuardian] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  // ---------- Modal states ----------
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  // ---------- file path states ----------
  const [fileTranscript, setFileTranscript] = useState<string>("");
  const [fileHousehold, setFileHousehold]   = useState<string>("");
  const [fileCopyCid, setFileCopyCid]       = useState<string>("");
  const [fileImage, setFileImage]           = useState<string>("");

  const [newTranscript, setNewTranscript] = useState<File | null>(null);
  const [newHousehold, setNewHousehold]   = useState<File | null>(null);
  const [newCopyCid, setNewCopyCid]       = useState<File | null>(null);
  const [newImage, setNewImage]           = useState<File | null>(null);
  
  // แสดง Modal ยืนยันการบันทึก
  const handleShowSaveModal = () => {
    setShowSaveConfirmModal(true);
  };

  // ยืนยันการบันทึก
  const handleConfirmSave = async () => {
    setShowSaveConfirmModal(false);
    await handleSave();
  };

  // ยกเลิกการบันทึก
  const handleCancelSave = () => {
    setShowSaveConfirmModal(false);
  };

  const handleSave = async () => {
  if (!viewId) return;

  try {
    setLoading(true);

    // ส่งเป็น FormData เสมอ (backend PUT รองรับทั้งข้อความ/ไฟล์)
    const fd = new FormData();

    // ใส่เฉพาะค่าาที่มีจริง เพื่อไม่ไปทับด้วยค่าว่างโดยไม่ตั้งใจ
    const appendIf = (k: string, v: any) => {
      if (v !== undefined && v !== null && `${v}` !== "") fd.append(k, String(v));
    };

    appendIf("title_id", thTitleId);
    appendIf("t_first_name", thFirst);
    appendIf("t_last_name", thLast);
    appendIf("e_first_name", enFirst);
    appendIf("e_last_name", enLast);
    appendIf("citizen_id", citizenId);
    appendIf("tel", tel);
    appendIf("email", email);
    appendIf("nationality", nationality);
    // religious: ส่ง "" เพื่อล้างค่าได้ ตาม controller ที่เขียนไว้
    fd.append("religious", religious ?? "");
    appendIf("gender_id", genderId);
    appendIf("grade_year", gradeYear);
    appendIf("grade_class", gradeClass);
    appendIf("guardian", guardian);
    appendIf("address", address);

    if (dob) {
      fd.append("date_of_birth", dob.format("YYYY-MM-DD"));
      // ส่ง age ไปด้วยก็ได้ แต่ถ้าเปลี่ยนวันเกิด backend จะคำนวณใหม่ให้เอง
      if (age != null) appendIf("age", age);
    }

    // ---------- แนบไฟล์เฉพาะที่เลือกใหม่ ----------
    if (newTranscript) fd.append("transcript_of_records", newTranscript);
    if (newHousehold)  fd.append("household_registration_certificate", newHousehold);
    if (newCopyCid)    fd.append("copy_citizen_id", newCopyCid);
    if (newImage)      fd.append("student_image", newImage);

    const res = await EnrollmentAPI.updateEnrollment(viewId, fd);

    if (!res || (res as any).error) {
      message.error((res as any)?.error || "อัปเดตไม่สำเร็จ");
      return;
    }
    message.success("บันทึกข้อมูลสำเร็จ");
    // กลับไปหน้าเดิม
    navigate(-1);
  } catch (e: any) {
    message.error(e?.message || "อัปเดตไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};

  const pick = (o: any, ...keys: string[]) => {
    for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
    return undefined;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!viewId) return;
      try {
        setLoading(true);
        const data = await EnrollmentAPI.getEnrollmentById(viewId);
        if (!data || (data as any).error) {
          message.error("ไม่พบข้อมูลผู้สมัคร");
          return;
        }

        setThTitleId(pick(data, "title_id", "TitleID") ?? null);
        setThFirst(pick(data, "t_first_name", "TFirst_Name") ?? "");
        setThLast(pick(data, "t_last_name", "TLast_Name") ?? "");
        setEnFirst(pick(data, "e_first_name", "EFirst_Name") ?? "");
        setEnLast(pick(data, "e_last_name", "ELast_Name") ?? "");
        setCitizenId(pick(data, "citizen_id", "Citizen_ID") ?? "");
        setTel(pick(data, "tel", "Tel") ?? "");
        setEmail(pick(data, "email", "Email") ?? "");
        setNationality(pick(data, "nationality", "Nationality") ?? "");
        setReligious(pick(data, "religious", "Religious") ?? "");
        setGenderId(pick(data, "gender_id", "GenderID") ?? null);
        setGradeYear(pick(data, "grade_year", "Grade_Year") ?? null);
        setGradeClass(pick(data, "grade_class", "Grade_Class") ?? null);

        // ✅ ผู้ปกครอง / ที่อยู่
        setGuardian(pick(data, "guardian", "Guardian") ?? "");
        setAddress(pick(data, "address", "Address") ?? "");

        //วันเกิด
       const dobRaw = pick(data, "date_of_birth", "DateOfBirth");
      const dobVal = dobRaw ? dayjs(dobRaw) : null;
      setDob(dobVal);
        //อายุ
      const ageRaw = pick(data, "age", "Age");
      if (typeof ageRaw === "number") {
        setAge(ageRaw);
      } else {
        setAge(dobVal ? calcAge(dobVal) : null);
      }

        // English title (fallback เป็น title_id ถ้าไม่ส่ง en_title_id)
        const enTidRaw =
          pick(data, "en_title_id", "EnTitleID") ??
          pick(data, "title_id", "TitleID");
        setEnTitleId(enTidRaw != null ? Number(enTidRaw) : null);

        // files
        setFileTranscript(pick(data, "transcript_of_records", "Transcript_of_Records") ?? "");
        setFileHousehold(pick(data, "household_registration_certificate", "Household_Registration_Certificate") ?? "");
        setFileCopyCid(pick(data, "copy_citizen_id", "Copy_Citizen_ID") ?? "");
        setFileImage(pick(data, "student_image", "Student_image") ?? "");
      } catch (e: any) {
        message.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [viewId]);

  return (
    <div>
      <h1>ข้อมูลทั่วไป</h1>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>เลขบัตรประชาชน</label>
          <Input value={citizenId} onChange={(e) => setCitizenId(e.target.value)} disabled={loading} />
        </Col>
        <Col xs={24} md={6}>
          <label style={{ lineHeight: "2" }}>วันเกิด</label>
          <DatePicker
            style={{ width: "100%" }}
            value={dob}
            onChange={(d) => { setDob(d); setAge(d ? calcAge(d) : null); }}
            disabled={loading}
          />
        </Col>
        <Col xs={24} md={6}>
          <label style={{ lineHeight: "2" }}>อายุ (ปี)</label>
          <Input value={age ?? ""} readOnly placeholder="—" />
        </Col>
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={3}>
          <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ lineHeight: "2" }}>คำนำหน้า</label>          
          <SelectTitleTH value={thTitleId} onChange={setThTitleId}  />
          </div>
          
          
          
        </Col>
        <Col xs={24} md={9}>
          <label style={{ lineHeight: "2" }}>ชื่อ</label>
          <Input value={thFirst} onChange={(e) => setThFirst(e.target.value)} disabled={loading} />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>นามสกุล</label>
          <Input value={thLast} onChange={(e) => setThLast(e.target.value)} disabled={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={3}>
        <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ lineHeight: "2" }}>Name Prefix</label>
          <SelectTitleENG value={enTitleId} onChange={setEnTitleId} /> 
        </div>
          
         
        </Col>
        <Col xs={24} md={9}>
          <label style={{ lineHeight: "2" }}>FirstName</label>
          <Input value={enFirst} onChange={(e) => setEnFirst(e.target.value)} disabled={loading} />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>LastName</label>
          <Input value={enLast} onChange={(e) => setEnLast(e.target.value)} disabled={loading} />
        </Col>
      </Row>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ lineHeight: "2" }}>ชั้น</label>
            <SelectGrade value={gradeYear} onChange={setGradeYear} />
          </div>
          
        </Col>
        <Col xs={24} md={12}>
          <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ lineHeight: "2" }}>ห้อง</label>
            <SelectClass value={gradeClass} onChange={setGradeClass} />
          </div>
          
        </Col>
      </Row>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>สัญชาติ</label>
          <Input value={nationality} onChange={(e) => setNationality(e.target.value)} disabled={loading} />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>ศาสนา</label>
          <Input value={religious} onChange={(e) => setReligious(e.target.value)} disabled={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>เบอร์ติดต่อ</label>
          <Input value={tel} onChange={(e) => setTel(e.target.value)} disabled={loading} />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>E-mail</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        </Col>
      </Row>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ lineHeight: "2" }}>เพศ</label>
            <SelectGender value={genderId} onChange={setGenderId} />
          </div>
          
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>ผู้ปกครอง</label>
          <Input
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            placeholder="ชื่อ-สกุลผู้ปกครอง"
            disabled={loading}
          />
        </Col>
      </Row>

      

      

      {/* ✅ ผู้ปกครอง / ที่อยู่ */}
      <Row gutter={[16, 12]}>
        
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={24}>
          <label style={{ lineHeight: "2" }}>ที่อยู่</label>
          <Input.TextArea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </Col>
      </Row>

      {/* ----------- ไฟล์เดิมที่อัปโหลด ----------- */}
      <h3 style={{ marginTop: 16 }}>ไฟล์ที่เคยอัปโหลด</h3>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={6}>
          <label>ปพ.1 (ไฟล์เดิม)</label>
          <div><FilePreview path={fileTranscript} /></div>
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setNewTranscript(e.target.files?.[0] || null)}  // ✅ ปพ.1 -> setNewTranscript
              disabled={loading}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>สำเนาทะเบียนบ้าน (ไฟล์เดิม)</label>
          <div><FilePreview path={fileHousehold} /></div>
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setNewHousehold(e.target.files?.[0] || null)}   // ✅ ทะเบียนบ้าน -> setNewHousehold
              disabled={loading}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>สำเนาบัตรประชาชน (ไฟล์เดิม)</label>
          <div><FilePreview path={fileCopyCid} /></div>
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setNewCopyCid(e.target.files?.[0] || null)}     // ✅ บัตร ปชช. -> setNewCopyCid
              disabled={loading}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>รูปภาพนักเรียน (ไฟล์เดิม)</label>
          <div><FilePreview path={fileImage} /></div>
          <div style={{ marginTop: 8 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewImage(e.target.files?.[0] || null)}
            disabled={loading}
          />
          </div>
        </Col>
      </Row>

      {/* Modal ยืนยันการบันทึก */}
      <Modal
        title="ยืนยันการแก้ไข"
        open={showSaveConfirmModal}
        onCancel={handleCancelSave}
        width={400}
        footer={[
           <Button key="confirm" type="primary" onClick={handleConfirmSave} loading={loading}>
            ยืนยัน
          </Button>,
          <Button key="cancel" onClick={handleCancelSave}>
            ยกเลิก
          </Button>
        ]}
        centered
        maskClosable={false}
      >
        <p>คุณต้องการแก้ไขข้อมูลนี้หรือไม่?</p>
      </Modal>

  <div style={{ display: "flex", justifyContent: "end", marginLeft: "calc(44% + 24px)" }}>
      <Space>
        <Button type="primary" loading={loading} onClick={handleShowSaveModal} style={{ marginTop: '16px' }}>
          บันทึก
        </Button>
        <MadalCancel />
      </Space>
</div>

    </div>
  );
};

export default MoveAddStudent;