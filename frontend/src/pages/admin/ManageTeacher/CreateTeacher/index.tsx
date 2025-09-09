// src/pages/admin/ManageTeacher.tsx
import React, { useState } from "react";
import { Row, Col, Input, DatePicker, Select, Space, message, Upload, Button } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";

import SelectProvince from "../../../../components/SelectProvince";
import SelectDistrict from "../../../../components/SelectDistrict";
import SelectSubdistrict from "../../../../components/SelectSubdistrict";
import SelectZipcode from "../../../../components/SelectZipcode";
import SelectGender from "../../../../components/SelectGender";
import SelectTitleENG from "../../../../components/SelectTitleENG";
import SelectTitleTH from "../../../../components/SelectTitleTH";

import { teacherAPI } from "../../../../services/https";

const { Option } = Select;

const ManageTeacher: React.FC = () => {
  // ---------- ฟิลด์ที่ต้องใช้ส่งจริง ----------
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

  // ถ้ายังไม่มี flow สร้างที่อยู่ ให้ส่ง address_id เป็นค่าว่าง/ไม่ส่ง
  const [addressId, setAddressId] = useState<number | null>(null);
  const [usersId, setUsersId] = useState<number | null>(null);

  // ---------- UI address (เลือกจังหวัด/อำเภอ/ตำบล/ไปรษณีย์) ----------
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<number | null>(null);
  const [selectedZipcode, setSelectedZipcode] = useState<number | null>(null);

  // ---------- ไฟล์ ----------
  const [teacherImage, setTeacherImage] = useState<File | null>(null);
  const [qualImage, setQualImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"โสด" | "สมรส" | undefined>(undefined); // ใช้แค่แสดงผล (ไม่ส่งหลังบ้าน)

  // ---------- handlers: address select ----------
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

  // ---------- Upload helpers (antd Upload แบบ manual) ----------
  const oneFileOnly = {
    beforeUpload: () => false, // ไม่อัปโหลดอัตโนมัติ
    maxCount: 1,
  };
  const onTeacherImgChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setTeacherImage((fileList[0]?.originFileObj as File) || null);
  };
  const onQualImgChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setQualImage((fileList[0]?.originFileObj as File) || null);
  };

  // ---------- ส่งข้อมูลไปหลังบ้าน ----------
  const onSave = async () => {
    // validate ขั้นต่ำที่ controller ก็ required อยู่แล้ว
    if (!teacherId || !titleThId || !tFirst || !tLast || !citizenId || !tel || !dob || !genderId || !nationality || !email) {
      message.error("กรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }

    try {
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

      // ถ้ามีการ map address ไว้แล้ว ส่ง id ตามจริง
      if (addressId) fd.append("address_id", String(addressId));
      if (usersId) fd.append("users_id", String(usersId));

      // ไฟล์ (optional)
      if (teacherImage) fd.append("teacher_image", teacherImage);
      if (qualImage) fd.append("qualification_image", qualImage);

      setLoading(true);
      const res = await teacherAPI.createTeacher(fd);
      setLoading(false);

      if (res?.status >= 200 && res?.status < 300) {
        message.success("บันทึกข้อมูลอาจารย์สำเร็จ");
        // clear form (แล้วแต่ต้องการ)
        // ...reset states...
      } else {
        const msg = res?.data?.error || res?.data?.message || res?.statusText || "บันทึกไม่สำเร็จ";
        message.error(msg);
      }
    } catch (e: any) {
      setLoading(false);
      message.error(e?.message || "เกิดข้อผิดพลาดขณะบันทึก");
    }
  };

  return (
    <div>
      <div style={{ justifyContent: "center", padding: 48, background: "linear-gradient(to left,#fff,#fff)", minHeight: "80vh", maxWidth: "100%", borderRadius: 16 }}>
        <h1>ข้อมูลทั่วไป</h1>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>รหัสครู (teacher_id)</label>
            <Input placeholder="เช่น TCH0001" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>วันเกิด</label>
            <DatePicker style={{ width: "100%" }} value={dob} onChange={(d) => setDob(d)} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>เลขบัตรประชาชน</label>
            <Input placeholder="กรอกเลขบัตรประชาชน" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>สถานะ</label>
            <Select value={status} onChange={(v: "โสด" | "สมรส") => setStatus(v)} placeholder="เลือก" style={{ width: "100%" }}>
              <Option value="โสด">โสด</Option>
              <Option value="สมรส">สมรส</Option>
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={3}>
            <label style={{ lineHeight: "2" }}>คำนำหน้า (TH)</label>
            <SelectTitleTH value={titleThId} onChange={setTitleThId} />
          </Col>
          <Col xs={24} md={9}>
            <label style={{ lineHeight: "2" }}>ชื่อ (TH)</label>
            <Input placeholder="ชื่อ" value={tFirst} onChange={(e) => setTFirst(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>นามสกุล (TH)</label>
            <Input placeholder="นามสกุล" value={tLast} onChange={(e) => setTLast(e.target.value)} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={3}>
            <label style={{ lineHeight: "2" }}>Name Prefix (EN)</label>
            <SelectTitleENG value={titleEngId} onChange={setTitleEngId} />
          </Col>
          <Col xs={24} md={9}>
            <label style={{ lineHeight: "2" }}>FirstName (EN)</label>
            <Input placeholder="FirstName" value={eFirst} onChange={(e) => setEFirst(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>LastName (EN)</label>
            <Input placeholder="LastName" value={eLast} onChange={(e) => setELast(e.target.value)} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>เพศ</label>
            <p />
            <SelectGender value={genderId} onChange={setGenderId} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>สัญชาติ</label>
            <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>ศาสนา</label>
            <Input value={religious} onChange={(e) => setReligious(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>จบการศึกษา (สาขา)</label>
            <Input placeholder="Ex. วิทยาการคอมพิวเตอร์" value={qualification} onChange={(e) => setQualification(e.target.value)} />
          </Col>
        </Row>

        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>เบอร์ติดต่อ</label>
            <Input value={tel} onChange={(e) => setTel(e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>E-mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Col>
        </Row>

        {/* ไฟล์ */}
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>Upload รูปภาพครู (teacher_image)</label>
            <Upload {...oneFileOnly} accept="image/*" onChange={onTeacherImgChange}>
              <Button>เลือกไฟล์</Button>
            </Upload>
          </Col>
          <Col xs={24} md={12}>
            <label style={{ lineHeight: "2" }}>แนบไฟล์วุฒิ (qualification_image)</label>
            <Upload {...oneFileOnly} accept="image/*,.pdf" onChange={onQualImgChange}>
              <Button>เลือกไฟล์</Button>
            </Upload>
          </Col>
        </Row>

        {/* ที่อยู่ (UI) */}
        <h1 style={{ marginTop: 24 }}>ที่อยู่ปัจจุบัน</h1>
        <Row gutter={[16, 12]}>
                    <Col xs={24} md={12}>
                      <label style= {{lineHeight: "2"}}>บ้านเลขที่</label>
                      <Input placeholder="กรอกบ้านเลขที่" />
                    </Col>
                    <Col xs={24} md={12}>
                      <label style= {{lineHeight: "2"}}>ถนน</label>
                      <Input placeholder="กรอกถนน" />
                    </Col>
                  </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label>จังหวัด</label>
            <div />
            <SelectProvince value={selectedProvince} onChange={handleProvinceChange} />
          </Col>
          <Col xs={24} md={12}>
            <label>อำเภอ/เขต</label>
            <div />
            <SelectDistrict provinceId={selectedProvince} value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} />
          </Col>
          
        </Row>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <label>ตำบล</label>
            <SelectSubdistrict districtId={selectedDistrict} value={selectedSubdistrict} onChange={handleSubdistrictChange} disabled={!selectedDistrict} />
          </Col>
          <Col xs={24} md={12}>
            <label>รหัสไปรษณีย์</label>
            <SelectZipcode subdistrictId={selectedSubdistrict} value={selectedZipcode} onChange={handleZipcodeChange} disabled={!selectedSubdistrict} />
          </Col>
          
        </Row>

        <div style={{ display: "flex", justifyContent: "end", marginTop: 16 }}>
          <Space>
            <Button type="primary" onClick={onSave} loading={loading} disabled={loading}>
              บันทึก
            </Button>
            <Button onClick={() => window.history.back()}>ยกเลิก</Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ManageTeacher;
