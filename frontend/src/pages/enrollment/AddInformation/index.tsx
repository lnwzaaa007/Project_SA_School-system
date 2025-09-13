// pages/AddInformation.tsx
import React, { useState } from "react";
import { Row, Col, Input, DatePicker, Select, Upload, Button, Modal,Card } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { EnrollmentAPI } from "../../../services/https";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectGender from "../../../components/SelectGender";
import SelectTitleTH from "../../../components/SelectTitleTH";
import SelectTitleENG from "../../../components/SelectTitleENG";
import School from "../../../assets/School.jpg"

const LOGIN_PATH = "/login";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOW_TYPES_PREFIX = ["image/", "application/pdf"];

type ValidateResult = { missing: string[]; invalid: string[]; firstId: string | null };

const AddInformation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  // ---------- states ----------
  const [citizenId, setCitizenId] = useState("");
  const [tel, setTel] = useState("");
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [age, setAge] = useState<number | null>(null); // <— NEW

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

  const [nationality, setNationality] = useState("");
  const [religious, setReligious] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [guardian, setGuardian] = useState("");

  const [fileTranscript, setFileTranscript] = useState<UploadFile | null>(null);
  const [fileHousehold, setFileHousehold] = useState<UploadFile | null>(null);
  const [fileCopyCid, setFileCopyCid] = useState<UploadFile | null>(null);
  const [fileImage, setFileImage] = useState<UploadFile | null>(null);

  // ---------- helper: คำนวณอายุ ----------
  const calcAge = (d: Dayjs): number => {
    const today = dayjs();
    let a = today.year() - d.year();
    if (today.month() < d.month() || (today.month() === d.month() && today.date() < d.date())) {
      a--;
    }
    return Math.max(a, 0);
  };

  // ---------- Upload helper ----------
  const pickFile = (setter: (f: UploadFile | null) => void) => ({
    beforeUpload: (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        modal.error({ title: "ไฟล์ใหญ่เกินไป", content: "ขนาดสูงสุด 10MB ต่อไฟล์" });
        return Upload.LIST_IGNORE;
      }
      if (!ALLOW_TYPES_PREFIX.some((p) => file.type?.startsWith(p))) {
        modal.error({ title: "ชนิดไฟล์ไม่ถูกต้อง", content: "อนุญาตเฉพาะรูปภาพหรือ PDF" });
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    maxCount: 1,
    onRemove: () => setter(null),
    onChange: ({ fileList }: { fileList: UploadFile[] }) => setter(fileList[0] ?? null),
  });

  // ---------- Modal helpers ----------
  const showErrorsModal = (errs: string[]) =>
    modal.error({
      centered: true,
      title: "กรอกข้อมูลไม่ครบหรือไม่ถูกต้อง",
      content: (
        <ul style={{ marginLeft: 18 }}>
          {errs.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ),
      okText: "ตรวจสอบอีกครั้ง",
      width: 560,
    });

  const showInvalidModal = (errs: string[]) =>
    modal.error({
      centered: true,
      title: "รูปแบบข้อมูลไม่ถูกต้อง",
      content: (
        <ul style={{ marginLeft: 18 }}>
          {errs.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ),
      okText: "แก้ไข",
      width: 560,
    });

  const showServerError = (msg: string) =>
    modal.error({
      centered: true,
      title: "บันทึกไม่สำเร็จ",
      content: msg || "เกิดข้อผิดพลาดจากระบบ",
      okText: "ปิด",
    });

  const resetForm = () => {
    setCitizenId(""); setTel(""); setDob(null); setAge(null);
    setThTitleId(null); setThFirst(""); setThLast("");
    setEnTitleId(null); setEnFirst(""); setEnLast("");
    setStatus(undefined); setGenderId(null);
    setGradeYear(null); setGradeClass(null);
    setNationality(""); setReligious(""); setEmail("");
    setAddress(""); setGuardian("");
    setFileTranscript(null); setFileHousehold(null);
    setFileCopyCid(null); setFileImage(null);
  };

  const showSuccess = () =>
    modal.success({
      centered: true,
      title: "บันทึกการสมัครสำเร็จ",
      content: "คุณสามารถตรวจสอบสถานะได้ที่หน้าเว็บไซต์",
      okText: "ตกลง",
      onOk: () => { resetForm(); navigate(LOGIN_PATH, { replace: true }); },
      afterClose: () => { resetForm(); navigate(LOGIN_PATH, { replace: true }); },
    });

  // ---------- validate ----------
  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const onlyDigits = (v: string) => /^\d+$/.test(v);

  const validate = (): ValidateResult => {
    const missing: string[] = [];
    const invalid: string[] = [];
    let firstId: string | null = null;

    const need = (cond: boolean, msg: string, id: string) => {
      if (cond) { missing.push(msg); if (!firstId) firstId = id; }
    };
    const bad = (cond: boolean, msg: string, id: string) => {
      if (cond) { invalid.push(msg); if (!firstId) firstId = id; }
    };

    need(!thTitleId, "กรุณาเลือกคำนำหน้า (ไทย)", "fld_title_th");
    need(!thFirst, "กรุณากรอกชื่อ (ไทย)", "fld_t_first");
    need(!thLast, "กรุณากรอกนามสกุล (ไทย)", "fld_t_last");
    need(!citizenId, "กรุณากรอกเลขบัตรประชาชน", "fld_citizen");
    need(!tel, "กรุณากรอกเบอร์ติดต่อ", "fld_tel");
    need(!dob, "กรุณาเลือกวันเกิด", "fld_dob");
    need(!genderId, "กรุณาเลือกเพศ", "fld_gender");
    need(!gradeYear, "กรุณาเลือกชั้น", "fld_grade_year");
    need(!gradeClass, "กรุณาเลือกห้อง", "fld_grade_class");
    need(!nationality, "กรุณากรอกสัญชาติ", "fld_nationality");
    need(!email, "กรุณากรอก E-mail", "fld_email");
    need(!guardian, "กรุณากรอกชื่อผู้ปกครอง", "fld_guardian");
    need(!address, "กรุณากรอกที่อยู่", "fld_address");
    // ไม่บังคับกรอก age เพราะคำนวณอัตโนมัติ

    if (missing.length > 0) return { missing, invalid, firstId };

    bad(!onlyDigits(citizenId) || citizenId.length !== 13, "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก", "fld_citizen");
    bad(!onlyDigits(tel) || tel.length < 9 || tel.length > 10, "เบอร์โทรศัพท์ไม่ถูกต้อง", "fld_tel");
    bad(!emailOk(email), "รูปแบบ E-mail ไม่ถูกต้อง", "fld_email");

    return { missing, invalid, firstId };
  };

  const scrollAndFocus = (id: string | null) => {
    if (!id) return;
    const root = document.getElementById(id);
    if (!root) return;
    root.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = root.querySelector<HTMLElement>("input, textarea, .ant-select-selector, button");
    focusable?.focus?.();
  };

  // ---------- submit ----------
  const handleSubmit = async () => {
    const { missing, invalid, firstId } = validate();
    if (missing.length > 0) { showErrorsModal(missing); setTimeout(() => scrollAndFocus(firstId), 0); return; }
    if (invalid.length > 0) { showInvalidModal(invalid); setTimeout(() => scrollAndFocus(firstId), 0); return; }

    try {
      const fd = new FormData();
      fd.append("title_id", String(thTitleId));
      fd.append("t_first_name", thFirst);
      fd.append("t_last_name", thLast);
      fd.append("e_first_name", enFirst);
      fd.append("e_last_name", enLast);
      fd.append("citizen_id", citizenId);
      fd.append("tel", tel);
      fd.append("date_of_birth", (dob ?? dayjs()).format("YYYY-MM-DD"));
      fd.append("gender_id", String(genderId));
      fd.append("nationality", nationality);
      fd.append("email", email);
      fd.append("religious", religious);
      fd.append("address", address);
      fd.append("guardian", guardian);
      fd.append("grade_year", String(gradeYear));
      fd.append("grade_class", String(gradeClass));
      fd.append("admin_id", "1");

      // (ออปชัน) ส่ง age ไปด้วย — ถ้า Backend ไม่อ่านฟิลด์นี้จะถูกละเลย
      const ageToSend = age ?? (dob ? calcAge(dob) : 0);
      fd.append("age", String(ageToSend));

      fd.append("transcript_of_records", fileTranscript!.originFileObj as File);
      fd.append("household_registration_certificate", fileHousehold!.originFileObj as File);
      fd.append("copy_citizen_id", fileCopyCid!.originFileObj as File);
      fd.append("student_image", fileImage!.originFileObj as File);

      setLoading(true);
      const res = await EnrollmentAPI.createEnrollment(fd);
      setLoading(false);

      if (res?.status >= 200 && res?.status < 300) {
        showSuccess();
      } else {
        const msg = res?.data?.error || res?.data?.message || res?.statusText || "";
        showServerError(msg);
      }
    } catch (e: any) {
      setLoading(false);
      showServerError(e?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล");
    }
  };

  return (
    <div style={{ background: "#000000ff", minHeight: "100vh", padding: 20 }}>
      <img
          src={School}
          alt="School Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: 0.4, 
          }}
/>
      {contextHolder}

      <Card 
      style={{ padding: 24, background: "#fff", maxWidth: "60%", margin: "20px auto", borderRadius: 32,marginTop:"5%" }}>
        <h1>ข้อมูลทั่วไป</h1>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_citizen">
            <label>เลขบัตรประชาชน</label>
            <Input value={citizenId} onChange={(e) => setCitizenId(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={6} id="fld_dob">
            <label>วันเกิด</label>
            <DatePicker
              style={{ width: "100%" }}
              value={dob}
              onChange={(d) => { setDob(d); setAge(d ? calcAge(d) : null); }} // <— อัปเดต age
              format="YYYY-MM-DD"
              disabled={loading}
            />
          </Col>
           <Col xs={24} md={6}>
            <label>อายุ (ปี)</label>
            <Input value={age ?? ""} readOnly disabled placeholder="คำนวณอัตโนมัติจากวันเกิด" />
          </Col>
        </Row>


        <Row gutter={[16, 12]}>
          <Col xs={24} md={3} id="fld_title_th">
            <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label>คำนำหน้า</label>
              <SelectTitleTH value={thTitleId} onChange={setThTitleId} />
            </div>
            
          </Col>
          <Col xs={24} md={9} id="fld_t_first">
            <label>ชื่อ</label>
            <Input value={thFirst} onChange={(e) => setThFirst(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_t_last">
            <label>นามสกุล</label>
            <Input value={thLast} onChange={(e) => setThLast(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={3}>
            <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label>Name Prefix</label>
            <SelectTitleENG value={enTitleId} onChange={setEnTitleId} />
            </div>
            
          </Col>
          <Col xs={24} md={9}>
            <label>FirstName</label>
            <Input value={enFirst} onChange={(e) => setEnFirst(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12}>
            <label>LastName</label>
            <Input value={enLast} onChange={(e) => setEnLast(e.target.value)} disabled={loading} />
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
                  <Col xs={24} md={12} id="fld_grade_year">
                  <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label>ชั้น</label>
                    <SelectGrade value={gradeYear} onChange={setGradeYear} />
                  </div>
                    
                  </Col>
                  <Col xs={24} md={12} id="fld_grade_class">
                  <div  style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label>ห้อง</label>
                    <SelectClass value={gradeClass} onChange={setGradeClass} />
                  </div>
                    
                  </Col>
                </Row>

                <Row gutter={[16, 12]}>
                  <Col xs={24} md={12} id="fld_nationality">
                    <label>สัญชาติ</label>
                    <Input value={nationality} onChange={(e) => setNationality(e.target.value)} disabled={loading} />
                  </Col>
                  <Col xs={24} md={12}>
                    <label>ศาสนา</label>
                    <Input value={religious} onChange={(e) => setReligious(e.target.value)} disabled={loading} />
                  </Col>
                </Row>

                <Row gutter={[16, 12]}>
                  <Col xs={24} md={12} id="fld_tel">
                    <label>เบอร์ติดต่อ</label>
                    <Input value={tel} onChange={(e) => setTel(e.target.value)} disabled={loading} />
                  </Col>
                  <Col xs={24} md={12} id="fld_email">
                    <label>E-mail</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                  </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_gender">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label>เพศ</label>
              <SelectGender value={genderId} onChange={setGenderId} />
            </div>
          </Col>
          <Col xs={24} md={12}>
                      <label>ผู้ปกครอง</label>
                      <Input
                        value={guardian}
                        onChange={(e) => setGuardian(e.target.value)}
                        placeholder="ชื่อ-สกุลผู้ปกครอง"
                        disabled={loading}
                      />
          </Col>
        </Row>

        <Row gutter={[16, 12]} id="fld_address">
          <Col xs={24} md={24}>
            <label>ที่อยู่</label>
            <Input.TextArea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        {/* Uploads */}
        <Row gutter={[16, 12]} id="fld_uploads">
          <Col xs={24} md={6}>
            <label>ปพ.1</label>
            <div>
              <Upload {...pickFile(setFileTranscript)} disabled={loading}>
              <Button disabled={loading}>เลือกไฟล์</Button>
            </Upload>
            </div>
            
          </Col>
          <Col xs={24} md={6}>
            <label>สำเนาทะเบียนบ้าน</label>
            <div>
              <Upload {...pickFile(setFileHousehold)} disabled={loading}>
              <Button disabled={loading}>เลือกไฟล์</Button>
            </Upload>
            </div>
            
          </Col>
          <Col xs={24} md={6}>
            <label>สำเนาบัตรประชาชน</label>
            <div>
              <Upload {...pickFile(setFileCopyCid)} disabled={loading}>
              <Button disabled={loading}>เลือกไฟล์</Button>
            </Upload>
            </div>
            
          </Col>
          <Col xs={24} md={6}>
            <label>Upload รูปภาพ</label>
            <div>
              <Upload {...pickFile(setFileImage)} accept="image/*" disabled={loading}>
              <Button disabled={loading}>เลือกรูป</Button>
            </Upload>
            </div>
            
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button type="primary" onClick={handleSubmit} loading={loading} disabled={loading}>
            บันทึกการสมัคร
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddInformation;
