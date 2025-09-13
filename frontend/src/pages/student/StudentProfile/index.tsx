import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { SolutionOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  studentCRUD_SAFE as studentCRUD,
  guardianCRUD_SAFE as guardianCRUD,
  userCRUD_SAFE as userCRUD,
  addressCRUD_N_SAFE as addressCRUD_N,
  getAuthTokenSafe,
  thaiAddressName_SAFE,
  gradeName_SAFE,
  GetBinary
} from "../../../services/https";

// ===== util: ดึงค่าจาก res ทั้งแบบมี/ไม่มี data wrapper =====
const pickData = (res: any) => {
  const rd = res?.data ?? res;
  return rd?.data ?? rd;
};
// ===== util: ดึง id และ address_id ที่อาจเป็น id/ID =====
const getId = (o: any) => o?.id ?? o?.ID;
const getAddressId = (o: any) => o?.address_id ?? o?.AddressID;

const StudentProfile = () => {
  const { id } = useParams<{ id?: string }>();
  const studentIdFromRoute = id ? Number(id) : undefined;
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [showPersonal, setShowPersonal] = useState(true);
  const [showFather, setShowFather] = useState(true);
  const [showMother, setShowMother] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  // const [showGuardian, setShowGuardian] = useState(true);
  const objUrlRef = useRef<string | null>(null);

  const [student, setStudent] = useState<any>(null);
  const [father, setFather] = useState<any>(null);
  const [mother, setMother] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  // const [guardian, setGuardian] = useState<any>(null);
  const [rolePrefix, setRolePrefix] = useState<string | null>(null);

  const [provinceName, setProvinceName] = useState("-");
  const [districtName, setDistrictName] = useState("-");
  const [subdistrictName, setSubdistrictName] = useState("-");
  const [zipcodeText, setZipcodeText] = useState("-");
  const [classLabel, setClassLabel] = useState<string>("ม.-/-");

  // ---------- helpers ----------
  const show = (v: any) =>
    v == null || String(v).trim() === "" ? "-" : String(v).trim();

  const fullNameTH = (p?: any) =>
    [p?.t_first_name ?? p?.first_name, p?.t_last_name ?? p?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "-";

  const fullNameEN = (p?: any) =>
    [p?.e_first_name ?? p?.first_name_en, p?.e_last_name ?? p?.last_name_en]
      .filter(Boolean)
      .join(" ")
      .trim() || "-";

  const mapGenderTH = (g?: string) => {
    const x = (g ?? "").toLowerCase();
    if (x === "male" || x === "ชาย") return "ชาย";
    if (x === "female" || x === "หญิง") return "หญิง";
    return "-";
  };

  function getCurrentUserIdSmart(): number | undefined {
    const keys = ["user_id", "users_id", "uid", "auth.user_id"];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v && !isNaN(Number(v))) return Number(v);
    }

    const token = getAuthTokenSafe();
    if (!token || token.split(".").length !== 3) return undefined;
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(atob(base64));
      const raw = json?.id ?? json?.user_id ?? json?.UserID ?? json?.sub;
      const num = Number(raw);
      return isNaN(num) ? undefined : num;
    } catch {
      return undefined;
    }
  }

  const fmtTel = (s?: string) => {
    const d = (s ?? "").replace(/\D/g, "");
    if (d.length === 10)
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return d || "-";
  };

  const fmtThaiDate = (iso?: string) => {
    if (!iso) return "-";
    const d = dayjs(iso);
    if (!d.isValid()) return "-";
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const dd = d.date();
    const mm = months[d.month()];
    const yyyy = d.year() + 543;
    return `${dd} ${mm} ${yyyy}`;
  };

  const normPerson = (x: any) =>
    !x
      ? null
      : {
          citizen_id: x.citizen_id ?? x.id_card ?? "",
          first_name: x.first_name ?? x.fnameTH ?? "",
          last_name: x.last_name ?? x.lnameTH ?? "",
          tel: x.tel ?? x.phone ?? "",
          job: x.job ?? "",
          dob: x.dob ?? x.date_of_birth ?? "",
          status: x.status ?? "",
          relation: x.relation ?? x.relationship ?? x.role ?? "",
        };

  useEffect(() => {
    let aborted = false;

    async function loadNames() {
      setProvinceName("-");
      setDistrictName("-");
      setSubdistrictName("-");
      setZipcodeText("-");

      if (!address) return;

      const provId =
        address?.thai_province_id ??
        address?.Thai_ProvinceID ??
        address?.province_id;
      const distId =
        address?.thai_district_id ??
        address?.Thai_DistrictID ??
        address?.district_id;
      const subdId =
        address?.thai_subdistrict_id ??
        address?.Thai_SubdistrictID ??
        address?.subdistrict_id;

      try {
        const [pName, dName, subd] = await Promise.all([
          thaiAddressName_SAFE.getProvinceNameById(provId), // PK → ตรง
          thaiAddressName_SAFE.getDistrictNameByAny(distId), // PK/รหัส → ได้ทั้งคู่
          thaiAddressName_SAFE.getSubdistrictNameAndZipByAny(subdId), // PK/รหัส → พร้อม ZIP
        ]);

        if (!aborted) {
          setProvinceName(pName || String(provId) || "-");
          setDistrictName(dName || String(distId) || "-");
          setSubdistrictName(subd.name || String(subdId) || "-");
          setZipcodeText(subd.zip || "-");
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadNames();
    return () => {
      aborted = true;
    };
  }, [address]);

  // ===== โหลดข้อมูลตามโหมด =====
  useEffect(() => {
    let cancelled = false;

    async function loadByStudentPk(studentPkId: number) {
      try {
        // 1) ลองด้วย PK
        let sRes = await studentCRUD.getById(studentPkId);
        let s = pickData(sRes);
        if (Array.isArray(s)) s = s[0] ?? null;

        if (!s?.id && !s?.ID) {
          try {
            sRes = await studentCRUD.getByUserId(studentPkId);
            s = pickData(sRes);
            if (Array.isArray(s)) s = s[0] ?? null; // กัน array ด้วย
          } catch {}
        }

        if (cancelled || !s) return;
        setStudent(s);

        // 2) ผู้ปกครอง
        const gRes = await guardianCRUD.listByStudent(getId(s));
        const raw = pickData(gRes);
        if (!cancelled && Array.isArray(raw)) {
          const byRel = (k: string) =>
            normPerson(
              raw.find(
                (r: any) => String(r?.relation ?? "").toLowerCase() === k
              )
            );
          setFather(byRel("father"));
          setMother(byRel("mother"));
          setGuardian(byRel("guardian"));
        }

        // 3) ที่อยู่
        const addrId = getAddressId(s);
        if (addrId) {
          const aRes = await addressCRUD_N.getById(addrId);
          const a = pickData(aRes);
          if (!cancelled) setAddress(a);
        } else if (!cancelled) {
          setAddress(null);
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function loadForLoggedInUser() {
      try {
        const uid = getCurrentUserIdSmart(); // ถอดจาก JWT
        if (!uid) {
          console.warn("No current user id found.");
          return;
        }

        // 0) เช็กบทบาท
        const uRes = await userCRUD.getPrefixById(uid);
        const px = pickData(uRes);
        const prefix = px?.prefix ?? px;
        if (!cancelled) setRolePrefix(prefix);

        if (
          String(prefix ?? "")
            .toUpperCase()
            .startsWith("S")
        ) {
          // เป็นนักเรียน → ดึงด้วย users_id
          const sRes = await studentCRUD.getByUserId(uid);
          let s = pickData(sRes);
          if (Array.isArray(s)) s = s[0] ?? null;
          if (cancelled || !s) return;
          setStudent(s);

          // guardian
          const gRes = await guardianCRUD.listByStudent(getId(s));
          const raw = pickData(gRes);
          if (!cancelled && Array.isArray(raw)) {
            const byRel = (k: string) =>
              normPerson(
                raw.find(
                  (r: any) => String(r?.relation ?? "").toLowerCase() === k
                )
              );
            setFather(byRel("father"));
            setMother(byRel("mother"));
            setGuardian(byRel("guardian"));
          }

          // address
          const addrId = getAddressId(s);
          if (addrId) {
            const aRes = await addressCRUD_N.getById(addrId);
            const a = pickData(aRes);
            if (!cancelled) setAddress(a);
          } else if (!cancelled) {
            setAddress(null);
          }
        } else {
          console.warn("Current user is not a student. prefix =", prefix);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (studentIdFromRoute) {
      loadByStudentPk(studentIdFromRoute); // โหมดเปิดโปรไฟล์นักเรียนแบบเจาะจง id ใน URL
    } else {
      loadForLoggedInUser(); // โหมดผู้ใช้ที่ล็อกอินอยู่
    }

    return () => {
      cancelled = true;
    };
  }, [studentIdFromRoute]);

  useEffect(() => {
    let aborted = false;

    async function resolveClassFromGradeId() {
      // 1) หา grade_id จากหลายคีย์ที่เป็นไปได้
      const gid =
        student?.grade_id ??
        student?.grade?.id ??
        student?.GradeID ??
        student?.Grade_ID ??
        student?.gradeId;

      // 2) ถ้ามี grade_id ให้ไป lookup ชื่อ
      if (gid != null) {
        try {
          const label = await gradeName_SAFE.getLabelById(gid);
          if (!aborted && label) {
            setClassLabel(label);
            return;
          }
        } catch {}
      }

      // 3) fallback: ใช้ข้อมูลที่มีใน object เดิม
      const year =
        student?.grade_year ??
        student?.grade?.year ??
        student?.GradeYear ??
        student?.Grade_Year;
      const cls =
        student?.grade_class ??
        student?.grade?.class ??
        student?.GradeClass ??
        student?.Grade_Class;
      const fallback =
        !year && !cls ? "ม.-/-" : `ม.${year ?? "-"}${cls ? `/${cls}` : ""}`;
      if (!aborted) setClassLabel(fallback);
    }

    resolveClassFromGradeId();
    return () => {
      aborted = true;
    };
  }, [student]);

useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cancelled = false;

  async function loadAvatar() {
  setAvatarSrc("");

  const id = student?.id ?? student?.ID;
  if (!id) return;

  // 1) ทำ version สำหรับ bust cache
  const rawVer =
    student?.updated_at ??
    student?.UpdatedAt ??
    student?.updatedAt ??
    "";

  // แปลงเป็นเลข ms ถ้าเป็นวันที่
  let ver: string;
  try {
    ver = rawVer ? String(new Date(rawVer).getTime()) : String(Date.now());
  } catch {
    ver = String(Date.now());
  }

  // 2) ใส่ v ลงใน URL
  const rel = `/student/${id}/image?v=${encodeURIComponent(ver)}`;
  const apiUrl = `${studentCRUD.imageUrl(id)}?v=${encodeURIComponent(ver)}`;
  const token = getAuthTokenSafe?.();

  try {
    if (token) {
      const res = await GetBinary(rel, true); // << ใช้ path ที่มี ?v=
      const blob: Blob = res?.data;
      if (!(blob instanceof Blob) || blob.size === 0) {
        setAvatarSrc("");
        return;
      }
      const url = URL.createObjectURL(blob);
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
      objUrlRef.current = url;
      setAvatarSrc(url);
    } else {
      setAvatarSrc(apiUrl); // << URL ตรงที่มี ?v=
    }
  } catch (e) {
    try {
      const r = await fetch(apiUrl, { headers: { "Cache-Control": "no-cache" } });
      if (r.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
        objUrlRef.current = url;
        setAvatarSrc(url);
        return;
      }
    } catch {}
    console.warn("Load avatar failed:", e);
    setAvatarSrc("");
  }
}

  loadAvatar();
  return () => { cancelled = true; };
}, [student?.id, student?.ID]);

// รีโวคตอน unmount เท่านั้น (กันโดนรีโวคเร็วไปใน StrictMode)
useEffect(() => {
  return () => { if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current); };
}, []);

  return (
    <>
      <div className="container">
        <div className="main"></div>

        <div className="content1">
          <div className="content1Show">
          <div className="content1ShowP">
  {avatarSrc ? (
    <img
      src={avatarSrc}
      alt="student avatar"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <span style={{ color: "#fff", fontWeight: 600 }}>No Image</span>
  )}
</div>
            <div className="content1ShowInfor">
              <div
                className="name-line"
                style={{ fontSize: 21, color: "#000000ff", fontWeight: 500 }}
              >
                {fullNameTH(student)}
              </div>
              <div
                className="class-line"
                style={{ fontSize: 16, color: "#262626ff", fontWeight: 400 }}
              >
                {classLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="content2">
          <div className="content2Left">
            <div className="content2LeftFun">
              <div className="content2Left-Item1">
                <div className="content2Left-ItemInner">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <SolutionOutlined style={{ fontSize: 24 }} />
                    </div>
                    <span
                      className="menu-label"
                      style={{
                        paddingLeft: 16,
                        fontSize: 15,
                        color: "#262626ff",
                        fontWeight: 400,
                      }}
                    >
                      ข้อมูลทั่วไป
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content2Right">
            {/* ข้อมูลส่วนบุคคล */}
            <div className="content2RightFun">
              <div className="cursor">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: "#262626ff",
                      fontWeight: 500,
                    }}
                  >
                    ข้อมูลส่วนบุคคล{" "}
                  </div>
                  <button onClick={() => setShowPersonal(!showPersonal)}>
                    {showPersonal ? <UpOutlined /> : <DownOutlined />}
                  </button>
                </div>
              </div>

              {showPersonal && (
                <div>
                  <div className="flex-content">
                    <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                    <div className="student-sub-detail">
                      {show(student?.citizen_id ?? student?.Citizen_ID)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                    <div className="student-sub-detail">
                      {fullNameTH(student)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">ชื่อ-นามสกุล (EN)</div>
                    <div className="student-sub-detail">
                      {fullNameEN(student)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">เพศ</div>
                    <div className="student-sub-detail">
                      {mapGenderTH(student?.gender ?? student?.Gender)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">วันเกิด</div>
                    <div className="student-sub-detail">
                      {fmtThaiDate(
                        student?.date_of_birth ?? student?.DateOfBirth
                      )}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">สัญชาติ</div>
                    <div className="student-sub-detail">
                      {show(student?.nationality ?? student?.Nationality)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">ศาสนา</div>
                    <div className="student-sub-detail">
                      {show(student?.religious ?? student?.Religious)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                    <div className="student-sub-detail">
                      {fmtTel(student?.tel ?? student?.Tel)}
                    </div>
                  </div>

                  <div className="flex-content">
                    <div className="student-sub-title">E-mail</div>
                    <div className="student-sub-detail">
                      {show(student?.email ?? student?.Email)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ข้อมูลบิดา */}
            <div className="content2RightFun">
              <div className="cursor">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: "#262626ff",
                      fontWeight: 500,
                    }}
                  >
                    ข้อมูลบิดา
                  </div>
                  <button onClick={() => setShowFather(!showFather)}>
                    {showFather ? <UpOutlined /> : <DownOutlined />}
                  </button>
                </div>
              </div>
              {showFather && (
                <div>
                  <div className="flex-content">
                    <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                    <div className="student-sub-detail">
                      {show(father?.citizen_id)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                    <div className="student-sub-detail">
                      {[father?.first_name, father?.last_name]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                    <div className="student-sub-detail">
                      {fmtTel(father?.tel)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">วันเกิด</div>
                    <div className="student-sub-detail">
                      {fmtThaiDate(father?.dob)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">อาชีพ</div>
                    <div className="student-sub-detail">
                      {show(father?.job)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">สถานะ</div>
                    <div className="student-sub-detail">
                      {show(father?.status)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ข้อมูลมารดา */}
            <div className="content2RightFun">
              <div className="cursor">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: "#262626ff",
                      fontWeight: 500,
                    }}
                  >
                    ข้อมูลมารดา
                  </div>
                  <button onClick={() => setShowMother(!showMother)}>
                    {showMother ? <UpOutlined /> : <DownOutlined />}
                  </button>
                </div>
              </div>
              {showMother && (
                <div>
                  <div className="flex-content">
                    <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                    <div className="student-sub-detail">
                      {show(mother?.citizen_id)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                    <div className="student-sub-detail">
                      {[mother?.first_name, mother?.last_name]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                    <div className="student-sub-detail">
                      {fmtTel(mother?.tel)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">วันเกิด</div>
                    <div className="student-sub-detail">
                      {fmtThaiDate(mother?.dob)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">อาชีพ</div>
                    <div className="student-sub-detail">
                      {show(mother?.job)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">สถานะ</div>
                    <div className="student-sub-detail">
                      {show(mother?.status)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ข้อมูลที่อยู่ */}
            <div className="content2RightFun">
              <div className="cursor">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      color: "#262626ff",
                      fontWeight: 500,
                    }}
                  >
                    ข้อมูลที่อยู่
                  </div>
                  <button onClick={() => setShowAddress(!showAddress)}>
                    {showAddress ? <UpOutlined /> : <DownOutlined />}
                  </button>
                </div>
              </div>

              {showAddress && (
                <div>
                  <div className="flex-content">
                    <div className="student-sub-title">รายละเอียด</div>
                    <div className="student-sub-detail">
                      {[
                        address?.address_number ?? address?.Address_Number,
                        address?.road ?? address?.Road,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">ตำบล</div>
                    <div className="student-sub-detail">
                      {show(subdistrictName)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">อำเภอ</div>
                    <div className="student-sub-detail">
                      {show(districtName)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">จังหวัด</div>
                    <div className="student-sub-detail">
                      {show(provinceName)}
                    </div>
                  </div>
                  <div className="flex-content">
                    <div className="student-sub-title">รหัสไปรษณีย์</div>
                    <div className="student-sub-detail">
                      {show(zipcodeText)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
