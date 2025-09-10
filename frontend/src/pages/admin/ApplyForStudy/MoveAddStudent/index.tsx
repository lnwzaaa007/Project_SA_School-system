// src/pages/admin/MoveAddStudent.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Row, Col, Input, DatePicker, Select, Space, message, Button, Image } from "antd";
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

const MoveAddStudent: React.FC = () => {
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
  const [nationality, setNationality] = useState("");
  const [religious, setReligious] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  // ✅ ใหม่
  const [guardian, setGuardian] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  // ---------- file path states ----------
  const [fileTranscript, setFileTranscript] = useState<string>("");
  const [fileHousehold, setFileHousehold]   = useState<string>("");
  const [fileCopyCid, setFileCopyCid]       = useState<string>("");
  const [fileImage, setFileImage]           = useState<string>("");

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

        const dobRaw = pick(data, "date_of_birth", "DateOfBirth");
        setDob(dobRaw ? dayjs(dobRaw) : null);

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
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>วันเกิด</label>
          <DatePicker style={{ width: "100%" }} value={dob} onChange={(d) => setDob(d)} disabled={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={3}>
          <label style={{ lineHeight: "2" }}>คำนำหน้า</label>
          <SelectTitleTH value={thTitleId} onChange={setThTitleId} />
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
          <label style={{ lineHeight: "2" }}>Name Prefix</label>
          <SelectTitleENG value={enTitleId} onChange={setEnTitleId} />
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
          <label style={{ lineHeight: "2" }}>สถานะ</label>
          <Select
            value={status}
            onChange={(v: "โสด" | "สมรส") => setStatus(v)}
            placeholder="เลือก"
            style={{ width: "100%" }}
            disabled={loading}
            options={[{ value: "โสด", label: "โสด" }, { value: "สมรส", label: "สมรส" }]}
          />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>เพศ</label>
          <p />
          <SelectGender value={genderId} onChange={setGenderId} />
        </Col>
      </Row>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>ชั้น</label>
          <p />
          <SelectGrade value={gradeYear} onChange={setGradeYear} />
        </Col>
        <Col xs={24} md={12}>
          <label style={{ lineHeight: "2" }}>ห้อง</label>
          <p />
          <SelectClass value={gradeClass} onChange={setGradeClass} />
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

      {/* ✅ ผู้ปกครอง / ที่อยู่ */}
      <Row gutter={[16, 12]}>
        <Col xs={24} md={24}>
          <label style={{ lineHeight: "2" }}>ผู้ปกครอง</label>
          <Input
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            placeholder="ชื่อ-สกุลผู้ปกครอง"
            disabled={loading}
          />
        </Col>
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
          <div>
            {fileTranscript ? (
              isImage(fileTranscript) ? (
                <Image width={180} src={toUrl(fileTranscript)} />
              ) : (
                <Button href={toUrl(fileTranscript)} target="_blank">เปิดไฟล์</Button>
              )
            ) : <div>—</div>}
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>สำเนาทะเบียนบ้าน (ไฟล์เดิม)</label>
          <div>
            {fileHousehold ? (
              isImage(fileHousehold) ? (
                <Image width={180} src={toUrl(fileHousehold)} />
              ) : (
                <Button href={toUrl(fileHousehold)} target="_blank">เปิดไฟล์</Button>
              )
            ) : <div>—</div>}
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>สำเนาบัตรประชาชน (ไฟล์เดิม)</label>
          <div>
            {fileCopyCid ? (
              isImage(fileCopyCid) ? (
                <Image width={180} src={toUrl(fileCopyCid)} />
              ) : (
                <Button href={toUrl(fileCopyCid)} target="_blank">เปิดไฟล์</Button>
              )
            ) : <div>—</div>}
          </div>
        </Col>

        <Col xs={24} md={6}>
          <label>รูปภาพนักเรียน (ไฟล์เดิม)</label>
          <div>
            {fileImage ? (
              <Image width={180} src={toUrl(fileImage)} style={{ borderRadius: 8 }} />
            ) : <div>—</div>}
          </div>
        </Col>
      </Row>

      <div style={{ display: "flex", justifyContent: "end", marginLeft: "calc(44% + 24px)" }}>
        <Space>
          <ModalSave />
          <MadalCancel />
        </Space>
      </div>
    </div>
  );
};

export default MoveAddStudent;
