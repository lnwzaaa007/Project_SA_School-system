// src/pages/admin/ManageTeacher.tsx
import React, { useEffect, useState } from "react";
import { Row, Col, Input, DatePicker, Space, Upload, Button, Modal, Image, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import SelectProvince from "../../../../components/SelectProvince";
import SelectDistrict from "../../../../components/SelectDistrict";
import SelectSubdistrict from "../../../../components/SelectSubdistrict";
import SelectZipcode from "../../../../components/SelectZipcode";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleENG from "../../../../components/SelectTitleENG";
import SelectTitleTH from "../../../../components/SelectTitleTH";

import { teacherAPI, AddressAPI, addressCRUD_N } from "../../../../services/https";

type ValidateResult = { missing: string[]; invalid: string[]; firstId: string | null };

// ---------- helpers ----------
const API_HOST = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const toUrl = (p?: string) => (p ? (/^https?:\/\//i.test(p) ? p : `${API_HOST}/${p.replace(/^\/+/, "")}`) : "");
const isImage = (p?: string) => !!p && /\.(png|jpe?g|gif|webp|bmp)$/i.test(p);
const isPdf = (p?: string) => !!p && /\.pdf($|\?)/i.test(p);
const pick = (o: any, keys: string[]) => {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
};

// preview เดิม (รูป/ไฟล์)
const FilePreview: React.FC<{ path?: string; width?: number; height?: number }> = ({ path, width = 180, height = 240 }) => {
  if (!path) return <div>—</div>;
  const url = toUrl(path);
  if (isImage(path)) return <Image width={width} src={url} style={{ borderRadius: 8 }} />;
  if (isPdf(path)) {
    return (
      <iframe src={url} width={width} height={height} style={{ border: "1px solid #eee", borderRadius: 8 }} />
    );
  }
  return (
    <Button href={url} target="_blank" rel="noopener noreferrer">
      เปิดไฟล์
    </Button>
  );
};

const ManageTeacher: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // อ่าน id ได้ทั้ง /ManageTeacher/:id และ ?id=...
  const { id: idFromPath } = useParams();
  const [search] = useSearchParams();
  const viewId = idFromPath ?? search.get("id") ?? "";

  // ---------- ฟิลด์ ----------
  const [teacherId, setTeacherId] = useState("");
  const [titleThId, setTitleThId] = useState<number | null>(null);
  const [titleEngId, setTitleEngId] = useState<number | null>(null);
  const [tFirst, setTFirst] = useState("");
  const [tLast, setTLast] = useState("");
  const [eFirst, setEFirst] = useState("");
  const [eLast, setELast] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [tel, setTel] = useState("");
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [genderId, setGenderId] = useState<number | null>(null);
  const [nationality, setNationality] = useState("");
  const [email, setEmail] = useState("");
  const [religious, setReligious] = useState("");
  const [qualification, setQualification] = useState("");

  // address (UI)
  const [addressId, setAddressId] = useState<number | null>(null);
  const [addrNumber, setAddrNumber] = useState("");
  const [road, setRoad] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);
  const readZipNum = (z: any): number | null => {
  if (!z) return null;
  const arr = Array.isArray(z) ? z : [];
  const raw = arr[0]?.thai_zip_code;           // ⭐ ใช้ thai_zip_code
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

  // files (ใหม่: เก็บพาธไฟล์เดิมไว้แสดงผล)
  const [fileTeacherPath, setFileTeacherPath] = useState<string>("");
  const [fileQualPath, setFileQualPath] = useState<string>("");

  // อัปโหลดไฟล์ใหม่ (ตอนบันทึก)
  const [teacherImage, setTeacherImage] = useState<File | null>(null);
  const [qualImage, setQualImage] = useState<File | null>(null);

  

  // ---------- preload ข้อมูลเมื่อมี id ----------
  useEffect(() => {
    const run = async () => {
      if (!viewId) return; // โหมดสร้างใหม่
      try {
        setLoading(true);
        const data = await teacherAPI.getTeacherDetail(viewId); // ต้องเป็น object เดียวตามที่แก้ backend แล้ว

        if (!data || (data as any)?.error) {
          message.error("ไม่พบข้อมูลครู");
          return;
        }

        // map field รองรับหลายคีย์
        setTeacherId(pick(data, ["teacher_id", "Teacher_ID"]) || "");
        setTitleThId(pick(data, ["title_id", "TitleID"]) ?? null);
        // en title ไม่มีในตาราง -> fallback เป็น title_id
        setTitleEngId(pick(data, ["en_title_id", "EnTitleID", "title_id"]) ?? null);

        setTFirst(pick(data, ["t_first_name", "tfirst_name", "TFirst_Name"]) || "");
        setTLast(pick(data, ["t_last_name", "tlast_name", "TLast_Name"]) || "");
        setEFirst(pick(data, ["e_first_name", "efirst_name", "EFirst_Name"]) || "");
        setELast(pick(data, ["e_last_name", "elast_name", "ELast_Name"]) || "");
        setCitizenId(pick(data, ["citizen_id", "Citizen_ID"]) || "");
        setTel(pick(data, ["tel", "Tel"]) || "");
        setNationality(pick(data, ["nationality", "Nationality"]) || "");
        setEmail(pick(data, ["email", "Email"]) || "");
        setReligious(pick(data, ["religious", "Religious"]) || "");
        setQualification(pick(data, ["qualification", "Qualification"]) || "");
        setGenderId(pick(data, ["gender_id", "GenderID"]) ?? null);

        const dobRaw = pick(data, ["date_of_birth", "dateofbirth", "DateOfBirth"]);
        setDob(dobRaw ? dayjs(dobRaw) : null);

        
        // address
        setAddressId(pick(data, ["address_id", "AddressID"]) ?? null);
        setAddrNumber(pick(data, ["address_number"]) || "");
        setRoad(pick(data, ["road"]) || "");
        const prov = pick(data, ["thai_province_id"]);
        const dist = pick(data, ["thai_district_id"]);
        const subd = pick(data, ["thai_subdistrict_id"]);
        setSelectedProvince(prov ?? null);
        setSelectedDistrict(dist ?? null);
        setSelectedSubdistrict(subd ?? null);
       
        if (subd) {
      try {
        const zipRes = await AddressAPI.getZipcode(Number(subd));
        setSelectedZipcode(readZipNum(zipRes));
      } catch {
        setSelectedZipcode(null);
      }
    } else {
      setSelectedZipcode(null);
    }

        // files (เดิม)
        setFileTeacherPath(pick(data, ["teacher_image", "Teacher_image"]) || "");
        setFileQualPath(pick(data, ["qualification_image", "QualImage", "qualificationImage"]) || "");
      } catch (e: any) {
        console.error(e);
        message.error(e?.message || "โหลดข้อมูลครูไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [viewId]);

  // ---------- ตัวช่วยตรวจสอบ ----------
  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const onlyDigits = (v: string) => /^\d+$/.test(v);
  const phoneOk = (v: string) => onlyDigits(v) && v.length >= 9 && v.length <= 10;
  const thaiCidOk = (id: string) => {
    const s = id.replace(/\D/g, "");
    if (s.length !== 13) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(s[i], 10) * (13 - i);
    const check = (11 - (sum % 11)) % 10;
    return check === parseInt(s[12], 10);
  };

  const validate = (): ValidateResult => {
    const missing: string[] = [];
    const invalid: string[] = [];
    let firstId: string | null = null;
    const need = (cond: boolean, msg: string, id: string) => { if (cond) { missing.push(msg); if (!firstId) firstId = id; } };
    const bad  = (cond: boolean, msg: string, id: string) => { if (cond) { invalid.push(msg); if (!firstId) firstId = id; } };

    need(!teacherId, "กรุณากรอกรหัสครู", "fld_teacher_id");
    need(!titleThId, "กรุณาเลือกคำนำหน้า (TH)", "fld_title_th");
    need(!tFirst, "กรุณากรอกชื่อ (TH)", "fld_t_first");
    need(!titleEngId, "กรุณาเลือกคำนำหน้า (อังกฤษ)", "fld_title_en");
    need(!eFirst, "กรุณากรอก FirstName (EN)", "fld_e_first");
    need(!eLast, "กรุณากรอก LastName (EN)", "fld_e_last");
    need(!tLast, "กรุณากรอกนามสกุล (TH)", "fld_t_last");
    need(!citizenId, "กรุณากรอกเลขบัตรประชาชน", "fld_citizen");
    need(!tel, "กรุณากรอกเบอร์ติดต่อ", "fld_tel");
    need(!dob, "กรุณาเลือกวันเกิด", "fld_dob");
    need(!genderId, "กรุณาเลือกเพศ", "fld_gender");
    need(!nationality, "กรุณากรอกสัญชาติ", "fld_nationality");
    need(!email, "กรุณากรอก E-mail", "fld_email");

    need(!addrNumber, "กรุณากรอกบ้านเลขที่", "fld_addr_number");
    need(!selectedProvince, "กรุณาเลือกจังหวัด", "fld_province");
    need(!selectedDistrict, "กรุณาเลือกอำเภอ/เขต", "fld_district");
    need(!selectedSubdistrict, "กรุณาเลือกตำบล", "fld_subdistrict");
    need(!selectedZipcode, "กรุณาเลือกรหัสไปรษณีย์", "fld_zipcode");
    need(!qualification, "กรุณากรอกสาขาที่จบการศึกษา", "fld_qualification");

    if (missing.length > 0) return { missing, invalid, firstId };
    bad(!thaiCidOk(citizenId), "เลขบัตรประชาชนไม่ถูกต้อง (13 หลัก + เลขตรวจ)", "fld_citizen");
    bad(!phoneOk(tel), "เบอร์ติดต่อควรเป็นตัวเลข 9–10 หลัก", "fld_tel");
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

  // ---------- Handlers ----------
  const handleProvinceChange = (value: number | null) => {
    setSelectedProvince(value); setSelectedDistrict(null); setSelectedSubdistrict(null); setSelectedZipcode(null);
  };
  const handleDistrictChange = (value: number | null) => {
    setSelectedDistrict(value); setSelectedSubdistrict(null); setSelectedZipcode(null);
  };
  const handleSubdistrictChange = async (value: number | null) => {
    setSelectedSubdistrict(value); setSelectedZipcode(null);
     if (value) {
    try {
      const zipRes = await AddressAPI.getZipcode(value);
      setSelectedZipcode(readZipNum(zipRes));  // ⭐
    } catch {
      setSelectedZipcode(null);
    }
  }
  };
  const handleZipcodeChange = (value: number | null) => setSelectedZipcode(value);

  const oneFileOnly = { beforeUpload: () => false, maxCount: 1 };
  const onTeacherImgChange = ({ fileList }: { fileList: UploadFile[] }) =>
    setTeacherImage((fileList[0]?.originFileObj as File) || null);
  const onQualImgChange = ({ fileList }: { fileList: UploadFile[] }) =>
    setQualImage((fileList[0]?.originFileObj as File) || null);

  // ---------- Submit (ยังคงทำงานโหมดสร้าง/อัปเดตตามที่คุณจะต่อเพิ่ม) ----------
  const onSave = async () => {
  const { missing, invalid, firstId } = validate();
  if (missing.length > 0) {
    modal.error({ title: "กรอกข้อมูลไม่ครบ", content: <ul style={{ marginLeft: 18 }}>{missing.map((m,i)=><li key={i}>{m}</li>)}</ul> });
    setTimeout(() => scrollAndFocus(firstId), 0);
    return;
  }
  if (invalid.length > 0) {
    modal.error({ title: "รูปแบบข้อมูลไม่ถูกต้อง", content: <ul style={{ marginLeft: 18 }}>{invalid.map((m,i)=><li key={i}>{m}</li>)}</ul> });
    setTimeout(() => scrollAndFocus(firstId), 0);
    return;
  }

  try {
    setLoading(true);

    // ---------- สร้าง payload ครู: เลือก JSON หรือ FormData ----------
    const asJSON = !(teacherImage || qualImage); // ไม่มีไฟล์ -> JSON, มีไฟล์ -> multipart
    let teacherPayload: any;

    if (asJSON) {
      teacherPayload = {
        teacher_id: teacherId,
        title_id: Number(titleThId),
        t_first_name: tFirst,
        t_last_name: tLast,
        e_first_name: eFirst,
        e_last_name: eLast,
        citizen_id: citizenId,
        tel: tel,
        date_of_birth: (dob ?? dayjs()).format("YYYY-MM-DD"),
        gender_id: Number(genderId),
        nationality,
        email,
        religious,
        qualification,
        // address_id ไม่ต้องเซ็ตที่นี่ (จัดการ Address แยก)
      };
    } else {
      const fd = new FormData();
      fd.append("teacher_id", teacherId);
      fd.append("title_id", String(titleThId));
      fd.append("t_first_name", tFirst);
      fd.append("t_last_name", tLast);
      fd.append("e_first_name", eFirst);
      fd.append("e_last_name", eLast);
      fd.append("citizen_id", citizenId);
      fd.append("tel", tel);
      fd.append("date_of_birth", (dob ?? dayjs()).format("YYYY-MM-DD"));
      fd.append("gender_id", String(genderId));
      fd.append("nationality", nationality);
      fd.append("email", email);
      fd.append("religious", religious);
      fd.append("qualification", qualification);
      if (teacherImage)     fd.append("teacher_image", teacherImage);
      if (qualImage)        fd.append("qualification_image", qualImage);
      teacherPayload = fd;
    }

    // ---------- โหมด "แก้ไข" เมื่อมี viewId ----------
    if (viewId) {
      // 1) อัปเดตครู
      const up = await teacherAPI.updateTeacher(viewId, teacherPayload);
      if (up?.error) throw new Error(up?.error || "อัปเดนครูไม่สำเร็จ");

      // 2) อัปเดตที่อยู่ (มี addressId ถึงจะอัปเดต, ถ้าไม่มีให้สร้างใหม่)
      const addrPayload = {
        address_number: addrNumber,
        road: road || "",
        thai_province_id: Number(selectedProvince),
        thai_district_id: Number(selectedDistrict),
        thai_subdistrict_id: Number(selectedSubdistrict),
      };

      if (addressId) {
        const upAddr = await addressCRUD_N.update(addressId, addrPayload);
        if (upAddr?.error) throw new Error(upAddr?.error || "อัปเดตที่อยู่ไม่สำเร็จ");
      } else {
        // เผื่อครูยังไม่มี address — ให้สร้างใหม่แล้วหลังบ้านไปผูก teacher.address_id เองตามที่คุณออกแบบไว้
        await AddressAPI.createAddress({ ...addrPayload, teacher_id: Number(viewId) });
      }

      setLoading(false);
      modal.success({
        title: "อัปเดตสำเร็จ",
        content: "บันทึกการแก้ไขข้อมูลครูและที่อยู่เรียบร้อยแล้ว",
        okText: "กลับ",
        onOk: () => navigate(-1),
        afterClose: () => navigate(-1),
      });
      return;
    }

    // ---------- โหมด "สร้างใหม่" (เดิม) ----------
    // (เหมือนเดิมทุกอย่าง)
    const fd = new FormData();
    fd.append("teacher_id", teacherId);
    fd.append("title_id", String(titleThId));
    fd.append("t_first_name", tFirst);
    fd.append("t_last_name", tLast);
    fd.append("e_first_name", eFirst);
    fd.append("e_last_name", eLast);
    fd.append("citizen_id", citizenId);
    fd.append("tel", tel);
    fd.append("date_of_birth", (dob ?? dayjs()).format("YYYY-MM-DD"));
    fd.append("gender_id", String(genderId));
    fd.append("nationality", nationality);
    fd.append("email", email);
    fd.append("religious", religious);
    fd.append("qualification", qualification);
    if (teacherImage) fd.append("teacher_image", teacherImage);
    if (qualImage)    fd.append("qualification_image", qualImage);

    const resTeacher = await teacherAPI.createTeacher(fd);
    if (!(resTeacher?.status >= 200 && resTeacher?.status < 300)) {
      const msg =
        resTeacher?.data?.detail ||
        resTeacher?.data?.error ||
        resTeacher?.data?.message ||
        resTeacher?.statusText ||
        "สร้างครูไม่สำเร็จ";
      throw new Error(msg);
    }

    const teacherObj = resTeacher.data?.teacher || resTeacher.data;
    const newTeacherId: number | undefined = teacherObj?.ID ?? teacherObj?.id;
    if (!newTeacherId) throw new Error("ไม่ได้รับรหัสครู (teacher.id) จากเซิร์ฟเวอร์");

    const resAddress = await AddressAPI.createAddress({
      address_number: addrNumber,
      road: road || "",
      thai_province_id: Number(selectedProvince),
      thai_district_id: Number(selectedDistrict),
      thai_subdistrict_id: Number(selectedSubdistrict),
      teacher_id: newTeacherId,
    });

    if (!(resAddress?.status >= 200 && resAddress?.status < 300)) {
      const msg =
        resAddress?.data?.detail ||
        resAddress?.data?.error ||
        resAddress?.data?.message ||
        resAddress?.statusText ||
        "สร้างที่อยู่ไม่สำเร็จ";
      throw new Error(`สร้างครูสำเร็จ แต่สร้างที่อยู่ล้มเหลว: ${msg}`);
    }

    setLoading(false);
    modal.success({
      title: "บันทึกสำเร็จ",
      content: "ระบบได้บันทึกข้อมูลครูและที่อยู่เรียบร้อยแล้ว",
      okText: "กลับ",
      onOk: () => navigate(-1),
      afterClose: () => navigate(-1),
    });
  } catch (e: any) {
    setLoading(false);
    modal.error({ title: "บันทึกไม่สำเร็จ", content: e?.message || "เกิดข้อผิดพลาดขณะบันทึก", okText: "ปิด" });
  }
};


  return (
    <div>
      {contextHolder}

      <div
        style={{
          justifyContent: "center",
          padding: 48,
          background: "linear-gradient(to left,#fff,#fff)",
          minHeight: "80vh",
          maxWidth: "100%",
          borderRadius: 16,
        }}
      >
        <h1>ข้อมูลทั่วไป {viewId ? "(โหมดดู/แก้ไข)" : "(โหมดสร้างใหม่)"}</h1>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_teacher_id">
            <label style={{ lineHeight: "2" }}>รหัสครู (teacher_id)</label>
            <Input placeholder="เช่น TCH0001" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_dob">
            <label style={{ lineHeight: "2" }}>วันเกิด</label>
            <DatePicker style={{ width: "100%" }} value={dob} onChange={(d) => setDob(d)} format="YYYY-MM-DD" disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_citizen">
            <label style={{ lineHeight: "2" }}>เลขบัตรประชาชน</label>
            <Input placeholder="กรอกเลขบัตรประชาชน" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_gender">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ lineHeight: "2" }}>เพศ</label>
              <SelectGender value={genderId} onChange={setGenderId} />
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={3} id="fld_title_th">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ lineHeight: "2" }}>คำนำหน้า (TH)</label>
              <SelectTitleTH value={titleThId} onChange={setTitleThId} />
            </div>
          </Col>
          <Col xs={24} md={9} id="fld_t_first">
            <label style={{ lineHeight: "2" }}>ชื่อ (TH)</label>
            <Input placeholder="ชื่อ" value={tFirst} onChange={(e) => setTFirst(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_t_last">
            <label style={{ lineHeight: "2" }}>นามสกุล (TH)</label>
            <Input placeholder="นามสกุล" value={tLast} onChange={(e) => setTLast(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={3} id="fld_title_en">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ lineHeight: "2" }}>Name Prefix (EN)</label>
              <SelectTitleENG value={titleEngId} onChange={setTitleEngId} />
            </div>
          </Col>
          <Col xs={24} md={9} id="fld_e_first">
            <label style={{ lineHeight: "2" }}>FirstName (EN)</label>
            <Input placeholder="FirstName" value={eFirst} onChange={(e) => setEFirst(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_e_last">
            <label style={{ lineHeight: "2" }}>LastName (EN)</label>
            <Input placeholder="LastName" value={eLast} onChange={(e) => setELast(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_qualification">
            <label style={{ lineHeight: "2" }}>จบการศึกษา (สาขา)</label>
            <Input placeholder="เช่น วิทยาการคอมพิวเตอร์" value={qualification} onChange={(e) => setQualification(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>แนบไฟล์วุฒิ (qualification_image)</label>
            <div>
              <Upload {...oneFileOnly} accept="image/*,.pdf" onChange={onQualImgChange}>
                <Button disabled={loading}>เลือกไฟล์</Button>
              </Upload>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>ศาสนา</label>
            <Input value={religious} onChange={(e) => setReligious(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_nationality">
            <label style={{ lineHeight: "2" }}>สัญชาติ</label>
            <Input value={nationality} onChange={(e) => setNationality(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_tel">
            <label style={{ lineHeight: "2" }}>เบอร์ติดต่อ</label>
            <Input value={tel} onChange={(e) => setTel(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12} id="fld_email">
            <label style={{ lineHeight: "2" }}>E-mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        {/* ----------- ไฟล์เดิม (ถ้ามี) ----------- */}
        {(fileTeacherPath || fileQualPath) && (
          <>
            <h3 style={{ marginTop: 16 }}>ไฟล์ที่เคยอัปโหลด</h3>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={6}>
                <label>รูปภาพครู (เดิม)</label>
                <div><FilePreview path={fileTeacherPath} /></div>
              </Col>
              <Col xs={24} md={6}>
                <label>ไฟล์วุฒิ (เดิม)</label>
                <div><FilePreview path={fileQualPath} /></div>
              </Col>
            </Row>
          </>
        )}

        {/* อัปโหลดไฟล์ใหม่ */}
        <Row gutter={[16, 12]} style={{ marginTop: 8 }}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>Upload รูปภาพครู (teacher_image)</label>
            <div>
              <Upload {...oneFileOnly} accept="image/*" onChange={onTeacherImgChange}>
                <Button disabled={loading}>เลือกรูป</Button>
              </Upload>
            </div>
          </Col>
        </Row>

        {/* ที่อยู่ */}
        <h1 style={{ marginTop: 24 }}>ที่อยู่ปัจจุบัน</h1>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_addr_number">
            <label style={{ lineHeight: "2" }}>บ้านเลขที่</label>
            <Input placeholder="กรอกบ้านเลขที่" value={addrNumber} onChange={(e) => setAddrNumber(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>ถนน</label>
            <Input placeholder="กรอกถนน" value={road} onChange={(e) => setRoad(e.target.value)} disabled={loading} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_province">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label>จังหวัด</label>
              <SelectProvince value={selectedProvince} onChange={handleProvinceChange} />
            </div>
          </Col>
          <Col xs={24} md={12} id="fld_district">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label>อำเภอ/เขต</label>
              <SelectDistrict
                provinceId={selectedProvince}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_subdistrict">
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 5 }}>
              <label>ตำบล</label>
              <SelectSubdistrict
                districtId={selectedDistrict}
                value={selectedSubdistrict}
                onChange={handleSubdistrictChange}
                disabled={!selectedDistrict}
              />
            </div>
          </Col>
          <Col xs={24} md={12} id="fld_zipcode">
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 5 }}>
              <label>รหัสไปรษณีย์</label>
              <SelectZipcode
                subdistrictId={selectedSubdistrict}
                value={selectedZipcode }
                onChange={handleZipcodeChange}
                disabled={!selectedSubdistrict}
              />
            </div>
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "end", marginTop: 16 }}>
          <Space>
            <Button type="primary" onClick={onSave} loading={loading} disabled={loading}>
              บันทึก
            </Button>
            <Button onClick={() => navigate(-1)} disabled={loading}>
              ยกเลิก
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ManageTeacher;
