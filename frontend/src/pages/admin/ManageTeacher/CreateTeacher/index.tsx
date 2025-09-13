// src/pages/admin/ManageTeacher.tsx
import React, { useEffect, useState } from "react";
import { Row, Col, Input, DatePicker, Space, Upload, Button, Modal } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";

import SelectProvince from "../../../../components/SelectProvince";
import SelectDistrict from "../../../../components/SelectDistrict";
import SelectSubdistrict from "../../../../components/SelectSubdistrict";
import SelectZipcode from "../../../../components/SelectZipcode";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleENG from "../../../../components/SelectTitleENG";
import SelectTitleTH from "../../../../components/SelectTitleTH";

import { teacherAPI, AddressAPI } from "../../../../services/https";

type ValidateResult = { missing: string[]; invalid: string[]; firstId: string | null };

const ManageTeacher: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);

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
  const [addrNumber, setAddrNumber] = useState("");
  const [road, setRoad] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);

  // files
  const [teacherImage, setTeacherImage] = useState<File | null>(null);
  const [qualImage, setQualImage] = useState<File | null>(null);

   useEffect(() => {
    const banned = new Set(["เด็กชาย", "เด็กหญิง", "Master", "Miss"]);

    const hideBanned = () => {
      document
        .querySelectorAll<HTMLDivElement>(".ant-select-dropdown .ant-select-item-option")
        .forEach((opt) => {
          const label = (opt.querySelector(".ant-select-item-option-content") as HTMLElement | null)?.innerText?.trim();
          if (label && banned.has(label)) {
            (opt as HTMLElement).style.display = "none";
          }
        });
    };

    // เรียกครั้งแรก และเฝ้าดู DOM เพราะ dropdown จะ mount/unmount ใหม่ทุกครั้ง
    hideBanned();
    const obs = new MutationObserver(hideBanned);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // ---------- ตัวช่วยตรวจสอบ ----------
  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const onlyDigits = (v: string) => /^\d+$/.test(v);
  const phoneOk = (v: string) => onlyDigits(v) && v.length >= 9 && v.length <= 10;
  // const thaiCidOk = (id: string) => {
  //   const s = id.replace(/\D/g, "");
  //   if (s.length !== 13) return false;
  //   let sum = 0;
  //   for (let i = 0; i < 12; i++) sum += parseInt(s[i], 10) * (13 - i);
  //   const check = (11 - (sum % 11)) % 10;
  //   return check === parseInt(s[12], 10);
  // };
  const thaiCidOk = (id: string) => id.replace(/\D/g, "").length === 13;


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

    // จำเป็น
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

    // ที่อยู่
    need(!addrNumber, "กรุณากรอกบ้านเลขที่", "fld_addr_number");
    need(!selectedProvince, "กรุณาเลือกจังหวัด", "fld_province");
    need(!selectedDistrict, "กรุณาเลือกอำเภอ/เขต", "fld_district");
    need(!selectedSubdistrict, "กรุณาเลือกตำบล", "fld_subdistrict");
    need(!selectedZipcode, "กรุณาเลือกรหัสไปรษณีย์", "fld_zipcode");
    need(!qualification, "กรุณากรอกสาขาที่จบการศึกษา", "fld_qualification");


    if (missing.length > 0) return { missing, invalid, firstId };

    // รูปแบบผิด
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
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setSelectedZipcode(null);
  };
  const handleDistrictChange = (value: number | null) => {
    setSelectedDistrict(value);
    setSelectedSubdistrict(null);
    setSelectedZipcode(null);
  };
  const handleSubdistrictChange = (value: number | null) => {
    setSelectedSubdistrict(value);
    setSelectedZipcode(null);
  };
  const handleZipcodeChange = (value: number | null) => {
    setSelectedZipcode(value);
  };

  const oneFileOnly = { beforeUpload: () => false, maxCount: 1 };
  const onTeacherImgChange = ({ fileList }: { fileList: UploadFile[] }) =>
    setTeacherImage((fileList[0]?.originFileObj as File) || null);
  const onQualImgChange = ({ fileList }: { fileList: UploadFile[] }) =>
    setQualImage((fileList[0]?.originFileObj as File) || null);

  // ---------- Submit ----------
  const onSave = async () => {
    const { missing, invalid, firstId } = validate();

    if (missing.length > 0) {
      modal.error({
        title: "กรอกข้อมูลไม่ครบ",
        content: (
          <ul style={{ marginLeft: 18 }}>
            {missing.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        ),
        okText: "ตรวจสอบอีกครั้ง",
        width: 560,
      });
      setTimeout(() => scrollAndFocus(firstId), 0);
      return;
    }
    if (invalid.length > 0) {
      modal.error({
        title: "รูปแบบข้อมูลไม่ถูกต้อง",
        content: (
          <ul style={{ marginLeft: 18 }}>
            {invalid.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        ),
        okText: "แก้ไข",
        width: 560,
      });
      setTimeout(() => scrollAndFocus(firstId), 0);
      return;
    }

    try {
      setLoading(true);

      // 1) สร้างครู
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
      if (qualImage)   fd.append("qualification_image", qualImage);

      const resTeacher = await teacherAPI.createTeacher(fd);
      if (!(resTeacher?.status >= 200 && resTeacher?.status < 300)) {
        const msg = resTeacher?.data?.detail || resTeacher?.data?.error || resTeacher?.data?.message || resTeacher?.statusText || "สร้างครูไม่สำเร็จ";
        throw new Error(msg);
      }

      // PK ครูจากคำตอบ
      const teacherObj = resTeacher.data?.teacher || resTeacher.data;
      const newTeacherId: number | undefined = teacherObj?.ID ?? teacherObj?.id;
      if (!newTeacherId) throw new Error("ไม่ได้รับรหัสครู (teacher.id) จากเซิร์ฟเวอร์");

      // 2) สร้าง Address + ลิงก์เข้าครู (อัปเดต teachers.address_id ให้อัตโนมัติ)
      const resAddress = await AddressAPI.createAddress({
        address_number: addrNumber,
        road: road || "",
        thai_province_id: Number(selectedProvince),
        thai_district_id: Number(selectedDistrict),
        thai_subdistrict_id: Number(selectedSubdistrict),
        teacher_id: newTeacherId,
      });

      if (!(resAddress?.status >= 200 && resAddress?.status < 300)) {
        const msg = resAddress?.data?.detail || resAddress?.data?.error || resAddress?.data?.message || resAddress?.statusText || "สร้างที่อยู่ไม่สำเร็จ";
        throw new Error(`สร้างครูสำเร็จ แต่สร้างที่อยู่ล้มเหลว: ${msg}`);
      }

      setLoading(false);
      modal.success({
        title: "บันทึกสำเร็จ",
        content: "ระบบได้บันทึกข้อมูลครูและที่อยู่เรียบร้อยแล้ว",
        okText: "กลับ",
        onOk: () => window.history.back(),
        afterClose: () => window.history.back(),
      });
    } catch (e: any) {
      setLoading(false);
      modal.error({
        title: "บันทึกไม่สำเร็จ",
        content: e?.message || "เกิดข้อผิดพลาดขณะบันทึก",
        okText: "ปิด",
      });
    }
  };

  return (
    <div>
      {contextHolder}

      <div style={{ justifyContent: "center", padding: 48, background: "linear-gradient(to left,#fff,#fff)", minHeight: "80vh", maxWidth: "100%", borderRadius: 16 }}>
        <h1>ข้อมูลทั่วไป</h1>

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
          <Col xs={24} md={3}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ lineHeight: "2" }}>Name Prefix (EN)</label>
              <SelectTitleENG value={titleEngId} onChange={setTitleEngId} />
            </div>
          </Col>
          <Col xs={24} md={9}>
            <label style={{ lineHeight: "2" }}>FirstName (EN)</label>
            <Input placeholder="FirstName" value={eFirst} onChange={(e) => setEFirst(e.target.value)} disabled={loading} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>LastName (EN)</label>
            <Input placeholder="LastName" value={eLast} onChange={(e) => setELast(e.target.value)} disabled={loading} />
          </Col>
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12} id="fld_qualification">
            <label style={{ lineHeight: "2" }}>จบการศึกษา (สาขา)</label>
            <Input
              placeholder="เช่น วิทยาการคอมพิวเตอร์"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              disabled={loading}
            />
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

        {/* ไฟล์ */}
        <Row gutter={[16, 12]}>
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
                value={selectedZipcode}
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
            <Button onClick={() => window.history.back()} disabled={loading}>ยกเลิก</Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ManageTeacher;
