// src/pages/teacher/Profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Descriptions, Spin, Empty, message } from "antd";
import { useNavigate } from "react-router-dom";
import { teacherAPI, AddressAPI, Get, gradeName_SAFE } from "../../../services/https";

const API_HOST = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const toUrl = (p?: string) =>
  p ? (/^https?:\/\//i.test(p) ? p : `${API_HOST}/${p.replace(/^\/+/, "")}`) : "";

type TeacherDetail = {
  id: number;
  teacher_id: string;
  t_first_name: string;
  t_last_name: string;
  gender_id?: number;
  citizen_id?: string;
  date_of_birth?: string;
  qualification?: string;
  nationality?: string;
  email?: string;
  religious?: string;
  tel?: string;
  teacher_image?: string;
  address_number?: string | number;
  road?: string;
  thai_province_id?: number;
  thai_district_id?: number;
  thai_subdistrict_id?: number;
};

const titleTxt = { fontSize: 22 };
const txt = { fontSize: 16 };

const thMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];
const fmtTHDate = (d?: string) => {
  if (!d) return "-";
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  return `${day} ${thMonths[m - 1]} ${y + 543}`;
};
const genderText = (g?: number) => (g === 1 ? "ชาย" : g === 2 ? "หญิง" : "-");

// -------- address helpers --------
const toArray = (x: any) => (Array.isArray(x) ? x : x?.data ? x.data : x ? [x] : []);
const getId = (o: any) =>
  o?.id ??
  o?.district_id ?? o?.thai_district_id ??
  o?.subdistrict_id ?? o?.thai_subdistrict_id ??
  o?.province_id ?? o?.thai_province_id;
const pickNameTH = (o: any, keys: string[]) =>
  keys.map(k => o?.[k]).find(Boolean) ?? "";

// -------- homeroom helpers --------
type Homeroom = { gradeId: number | null; label: string } | null;

async function parseHomeroomRow(row: any): Promise<Homeroom> {
  if (!row) return null;
  const g = row?.grade ?? row;

  const gid = Number(
    g?.grade_id ?? g?.id ?? g?.gradeId ?? g?.ID ?? row?.grade?.id
  );
  const year =
    g?.grade_year ?? g?.year ?? g?.GradeYear ?? g?.Grade_Year;
  const cls =
    g?.grade_class ?? g?.class ?? g?.room_no ?? g?.RoomNo ?? g?.GradeClass ?? g?.Grade_Class;

  if (year || cls) {
    return { gradeId: Number.isFinite(gid) ? gid : null, label: `ม.${year ?? "-"}${cls ? `/${cls}` : ""}` };
  }
  if (Number.isFinite(gid)) {
    const label = await gradeName_SAFE.getLabelById(gid);
    return { gradeId: gid, label };
  }
  return null;
}

// พยายามเรียกหลาย endpoint ตามที่อาจใช้ในโปรเจ็กต์
async function loadHomeroomForTeacher(teacherPk: number): Promise<Homeroom> {
  // 1) ฟังก์ชันใน services ถ้ามี
  try {
    // @ts-ignore — เผื่อ services มีเมธอดนี้
    if (typeof teacherAPI.getGradeTeacherById === "function") {
      const r1 = await (teacherAPI as any).getGradeTeacherById(teacherPk);
      const d1 = (r1?.data ?? r1);
      const row = Array.isArray(d1) ? d1[0] : d1;
      const parsed = await parseHomeroomRow(row);
      if (parsed) return parsed;
    }
  } catch {}

  // 2) /getGradeTeacher/:id
  try {
    const r2 = await Get(`/getGradeTeacher/${teacherPk}`);
    const d2 = (r2?.data ?? r2);
    const row = Array.isArray(d2) ? d2[0] : d2;
    const parsed = await parseHomeroomRow(row);
    if (parsed) return parsed;
  } catch {}

  // 3) /grades?teacher_id=...
  try {
    const r3 = await Get(`/grades?teacher_id=${teacherPk}`);
    const list = toArray(r3?.data ?? r3);
    if (list.length) {
      const parsed = await parseHomeroomRow(list[0]);
      if (parsed) return parsed;
    }
  } catch {}

  // 4) fallback: /grades แล้ว filter
  try {
    const r4 = await Get(`/grades`);
    const list = toArray(r4?.data ?? r4);
    const row = list.find((it: any) => Number(it?.teacher_id ?? it?.TeacherID) === Number(teacherPk));
    const parsed = await parseHomeroomRow(row);
    if (parsed) return parsed;
  } catch {}

  return null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState<TeacherDetail | null>(null);

  const [provName, setProvName] = useState("");
  const [distName, setDistName] = useState("");
  const [subdName, setSubdName] = useState("");
  const [zip, setZip] = useState("");

  const [homeroom, setHomeroom] = useState<Homeroom>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const userId = Number(localStorage.getItem("id") || 0);
        if (!userId) {
          message.error("ไม่พบผู้ใช้ที่ล็อกอิน");
          return;
        }

        // PK ของครูจาก users_id
        const base = await teacherAPI.getTeachar(userId);
        const teacherPk = base?.id ?? base?.ID;
        if (!teacherPk) {
          message.error("ไม่พบข้อมูลครูของผู้ใช้นี้");
          return;
        }

        // รายละเอียดครู
        const detail = await teacherAPI.getTeacherDetail(teacherPk);
        if (!detail || detail?.error) {
          message.error(detail?.error || "ไม่สามารถโหลดรายละเอียดครูได้");
          return;
        }
        setT(detail);

        // ครูประจำชั้น (ลองหลาย endpoint)
        const hr = await loadHomeroomForTeacher(Number(teacherPk));
        setHomeroom(hr);

        // ชื่อจังหวัด/อำเภอ/ตำบล + ไปรษณีย์
        if (detail.thai_province_id) {
          const pRes = await Get(`/thaiprovince/${detail.thai_province_id}`);
          const pObj = Array.isArray(pRes)
            ? toArray(pRes).find((it: any) => Number(getId(it)) === Number(detail.thai_province_id))
            : pRes;
          setProvName(pickNameTH(pObj, ["thai_province_name_th","thai_province_name","name_th","name"]));
        }

        if (detail.thai_district_id) {
          const dList = await Get(`/thaidistrict/${detail.thai_province_id}`);
          const dObj = toArray(dList).find((it: any) => Number(getId(it)) === Number(detail.thai_district_id));
          setDistName(pickNameTH(dObj, ["thai_district_name_th","thai_district_name","name_th","name"]));
        }

        if (detail.thai_subdistrict_id) {
          const sList = await Get(`/thaisubdistrict/${detail.thai_district_id}`);
          const sObj = toArray(sList).find((it: any) => Number(getId(it)) === Number(detail.thai_subdistrict_id));
          setSubdName(pickNameTH(sObj, ["thai_subdistrict_name_th","thai_subdistrict_name","name_th","name"]));

          const z = await AddressAPI.getZipcode(Number(detail.thai_subdistrict_id));
          const zVal = Array.isArray(z) ? (z[0]?.thai_zip_code ?? z[0]?.zipcode) : (z?.thai_zip_code ?? z?.zipcode);
          setZip(String(zVal || ""));
        }
      } catch (e: any) {
        message.error(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const fullName = useMemo(
    () => (t ? `${t.t_first_name ?? ""} ${t.t_last_name ?? ""}`.trim() || "-" : "-"),
    [t]
  );

  const addressLine = useMemo(() => {
    if (!t) return "-";
    const parts = [
      t.address_number ? String(t.address_number) : "",
      t.road ? `ถ.${t.road}` : "",
      subdName ? `ต.${subdName}` : "",
      distName ? `อ.${distName}` : "",
      provName ? `จ.${provName}` : "",
      zip || "",
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "-";
  }, [t, provName, distName, subdName, zip]);

  return (
    <div style={{ width: "100%", borderRadius: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={t?.teacher_image ? toUrl(t.teacher_image) : ""} size={120} style={{ marginRight: 20 }} />
          <div>
            <h2 style={{ marginBottom: 5, fontSize: "32px" }}>{fullName}</h2>
            <p style={{ color: "gray", fontSize: "24px", margin: 0 }}>
              ครูประจำวิชา {t?.qualification || "-"}
            </p>
            
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <Spin />
        </div>
      ) : !t ? (
        <Empty description="ไม่พบข้อมูลครู" />
      ) : (
        <Descriptions title={<span style={titleTxt}>ข้อมูลส่วนตัว</span>} column={2} bordered>
          <Descriptions.Item label="รหัสครู" labelStyle={titleTxt} contentStyle={txt}>
            {t.teacher_id || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="ครูประจำชั้น" labelStyle={titleTxt} contentStyle={txt}>
            {homeroom?.label || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="เพศ" labelStyle={titleTxt} contentStyle={txt}>
            {genderText(t.gender_id)}
          </Descriptions.Item>

          <Descriptions.Item label="เลขบัตรประชาชน" labelStyle={titleTxt} contentStyle={txt}>
            {t.citizen_id || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="วันเกิด" labelStyle={titleTxt} contentStyle={txt}>
            {fmtTHDate(t.date_of_birth)}
          </Descriptions.Item>

          <Descriptions.Item label="วุฒิการศึกษา" labelStyle={titleTxt} contentStyle={txt}>
            {t.qualification || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="อีเมล" labelStyle={titleTxt} contentStyle={txt}>
            {t.email || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="สัญชาติ" labelStyle={titleTxt} contentStyle={txt}>
            {t.nationality || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="ศาสนา" labelStyle={titleTxt} contentStyle={txt}>
            {t.religious || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="เบอร์โทร" labelStyle={titleTxt} contentStyle={txt}>
            {t.tel || "-"}
          </Descriptions.Item>
          

          <Descriptions.Item label="ที่อยู่" span={2} labelStyle={titleTxt} contentStyle={txt}>
            {addressLine}
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
};

export default Profile;
