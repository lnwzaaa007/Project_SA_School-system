// src/pages/teacher/Profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, Avatar, Descriptions, Button, Spin, Empty, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { teacherAPI, AddressAPI, Get } from "../../../services/https";
import teacherImage from "../../../assets/teacher.jpeg";

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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState<TeacherDetail | null>(null);

  // ชื่อพื้นที่
  const [provName, setProvName] = useState("");
  const [distName, setDistName] = useState("");
  const [subdName, setSubdName] = useState("");
  const [zip, setZip] = useState("");

  const toArray = (x: any) => (Array.isArray(x) ? x : x?.data ? x.data : x ? [x] : []);
const getId = (o: any) =>
  o?.id ??
  o?.district_id ?? o?.thai_district_id ??
  o?.subdistrict_id ?? o?.thai_subdistrict_id ??
  o?.province_id ?? o?.thai_province_id;

const pickNameTH = (o: any, keys: string[]) =>
  keys.map(k => o?.[k]).find(Boolean) ?? "";


  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        // 1) เอา user id จาก localStorage (ตั้งในหน้า Login แล้วคือ key "id")
        const userId = Number(localStorage.getItem("id") || 0);
        if (!userId) {
          setLoading(false);
          message.error("ไม่พบผู้ใช้ที่ล็อกอิน");
          return;
        }

        // 2) ใช้ userId หา teacher (PK) จาก /teachers/:user_id
        const base = await teacherAPI.getTeachar(userId);
        const teacherPk = base?.id ?? base?.ID; // entity.Teacher อาจมี ID หรือ id
        if (!teacherPk) {
          setLoading(false);
          message.error("ไม่พบข้อมูลครูของผู้ใช้นี้");
          return;
        }

        // 3) ดึงรายละเอียดเต็ม
        const detail = await teacherAPI.getTeacherDetail(teacherPk);
        if (!detail || detail?.error) {
          setLoading(false);
          message.error(detail?.error || "ไม่สามารถโหลดรายละเอียดครูได้");
          return;
        }
        setT(detail);

        // 4) เติมชื่อจังหวัด/อำเภอ/ตำบล + ไปรษณีย์ (ไม่บังคับ)
        if (detail.thai_province_id) {
  const pRes = await Get(`/thaiprovince/${detail.thai_province_id}`);
  const pObj = Array.isArray(pRes)
    ? toArray(pRes).find((it: any) => Number(getId(it)) === Number(detail.thai_province_id))
    : pRes;
  setProvName(pickNameTH(pObj, ["thai_province_name_th", "thai_province_name", "name_th", "name"]));
}

if (detail.thai_district_id) {
  // endpoint นี้ต้องส่ง "province_id" → แล้วค่อย find ด้วย district_id
  const dList = await Get(`/thaidistrict/${detail.thai_province_id}`);
  const dObj = toArray(dList).find((it: any) => Number(getId(it)) === Number(detail.thai_district_id));
  setDistName(pickNameTH(dObj, ["thai_district_name_th", "thai_district_name", "name_th", "name"]));
}

if (detail.thai_subdistrict_id) {
  // endpoint นี้ต้องส่ง "district_id" → แล้วค่อย find ด้วย subdistrict_id
  const sList = await Get(`/thaisubdistrict/${detail.thai_district_id}`);
  const sObj = toArray(sList).find((it: any) => Number(getId(it)) === Number(detail.thai_subdistrict_id));
  setSubdName(pickNameTH(sObj, ["thai_subdistrict_name_th", "thai_subdistrict_name", "name_th", "name"]));

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


  // const handleEdit = () => {
  //   if (t) navigate(`/admin/ManageTeacher/EditTeacher?id=${t.id}`);
  // };

  return (
      <Card
        style={{
          width: "100%",
          borderRadius: 10,
          //boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "2.5%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={t?.teacher_image ? toUrl(t.teacher_image) : teacherImage}
              size={120}
              style={{ marginRight: 20 }}
            />
            <div>
              <h2 style={{ marginBottom: 5, fontSize: "32px" }}>{fullName}</h2>
              <p style={{ color: "gray", fontSize: "24px" }}>
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
            <Descriptions.Item label="เพศ" labelStyle={titleTxt} contentStyle={txt}>
              {genderText(t.gender_id)}
            </Descriptions.Item>

            <Descriptions.Item label="เลขบัตรประชาชน" labelStyle={titleTxt} contentStyle={txt}>
              {t.citizen_id || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="วันเกิด" labelStyle={titleTxt} contentStyle={txt}>
              {fmtTHDate(t.date_of_birth)}
            </Descriptions.Item>

            {/* <Descriptions.Item label="สถานะ" labelStyle={titleTxt} contentStyle={txt}>
              -
            </Descriptions.Item> */}
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
      </Card>
  );
};

export default Profile;
