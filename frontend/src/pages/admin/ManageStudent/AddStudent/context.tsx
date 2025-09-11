import React, { createContext, useContext, useMemo, useState } from "react";
import { message } from "antd";
import { addressCRUD, studentCRUD, guardianCRUD } from "../../../../services/https";
import { AddressAPI } from "../../../../services/https";

// ---------- types ----------
type StudentDraft = {
  student_id?: string;
  title_id?: number;
  t_first_name?: string;
  t_last_name?: string;
  e_first_name?: string;
  e_last_name?: string;
  citizen_id?: string;
  tel?: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: string;        // male/female
  nationality?: string;
  email?: string;
  religious?: string;
  grade_id?: number;
};
type PersonDraft = {
  citizen_id?: string;
  title_id?: number;
  first_name?: string;
  last_name?: string;
  tel?: string;
  job?: string;
  dob?: string;       // YYYY-MM-DD
  status?: string;
  relation?: string;
};
type GuardianDraft = {
  living_with?: "parents" | "guardian";
  father?: PersonDraft;
  mother?: PersonDraft;
  guardian?: PersonDraft;
};
type AddressDraft = {
  address_number?: string;
  road?: string;
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
  zipcode_id?: number;
};

// ---------- context shape ----------
type Ctx = {
  student: StudentDraft;
  guardian: GuardianDraft;
  address: AddressDraft;
  imageBase64: string;

  setStudent: (patch: Partial<StudentDraft>) => void;
  setGuardian: (patch: Partial<GuardianDraft>) => void;
  setAddress: (patch: Partial<AddressDraft>) => void;
  setImageBase64: (b64: string) => void;

  saving: boolean;
   saveAll: () => Promise<boolean>;
};

const StudentCreateContext = createContext<Ctx | null>(null);
export const useStudentCreate = () => {
  const ctx = useContext(StudentCreateContext);
  if (!ctx) throw new Error("useStudentCreate must be used under StudentCreateContext");
  return ctx;
};

// ---------- helpers ----------
const pickId = (obj: any) => obj?.id ?? obj?.ID;
const mapGender = (g?: string) => (g === "male" ? "ชาย" : g === "female" ? "หญิง" : (g || ""));

// ---------- provider ----------
export const StudentCreateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [student, setStudentState]   = useState<StudentDraft>({});
  const [guardian, setGuardianState] = useState<GuardianDraft>({ living_with: "parents" });
  const [address, setAddressState]   = useState<AddressDraft>({});
  const [imageBase64, setImageBase64] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msgApi, ctxHolder] = message.useMessage();

  const setStudent  = (p: Partial<StudentDraft>)   => setStudentState(s => ({ ...s, ...p }));
  const setGuardian = (p: Partial<GuardianDraft>)  => setGuardianState(g => ({ ...g, ...p }));
  const setAddress  = (p: Partial<AddressDraft>)   => setAddressState(a => ({ ...a, ...p }));

  const validate = () => {
    if (!student.student_id) throw new Error("กรุณากรอกรหัสนักเรียน");
    if (!student.citizen_id) throw new Error("กรุณากรอกเลขบัตรประชาชน");
    if (!student.t_first_name || !student.t_last_name) throw new Error("กรอกชื่อ-นามสกุลให้ครบ");
    if (!student.title_id) throw new Error("กรุณาเลือกคำนำหน้า");
    if (!student.date_of_birth) throw new Error("กรุณาเลือกวันเกิด");
    if (!student.grade_id) throw new Error("กรุณาเลือกชั้นปี");
    if (!address.address_number) throw new Error("กรุณากรอกรายละเอียดที่อยู่");
    if (!address.province_id || !address.district_id || !address.subdistrict_id || !address.zipcode_id) {
      throw new Error("กรุณาเลือกจังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์ ให้ครบ");
    }
  };

  const unwrap = (res: any) => Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

// เทียบเป็นตัวเลขพร้อมรองรับ string number
const toNum = (v: any) => v == null ? NaN : Number(v);

// ให้หา PK (ID ของ GORM) จากลิสต์ ด้วยค่า “ที่ Select ส่งมา” (ซึ่งอาจเป็น code อื่น)
function resolvePk(list: any[], picked: any): number | undefined {
  const target = toNum(picked);
  if (Number.isNaN(target)) return undefined;

  // พยายามจับคู่กับฟิลด์ยอดฮิตทั้งหมด
  const found = list.find((x) => {
    const cand = [
      x?.ID, x?.id,
      x?.province_id, x?.district_id, x?.subdistrict_id, x?.zipcode_id,
      x?.Thai_Province_ID, x?.Thai_District_ID, x?.Thai_Subdistrict_ID, x?.Thai_ZipCode_ID,
      x?.zip_code, x?.zipcode,
    ].map(toNum);
    return cand.some(n => !Number.isNaN(n) && n === target);
  });

  // คืน PK จริง (ID/ id) ถ้ามี
  const pk = found?.ID ?? found?.id;
  return typeof pk === "number" ? pk : (pk != null ? Number(pk) : undefined);
}

// เรียกตอนจะ save เพื่อแปลง province/district/subdistrict/zipcode → PK จริง
async function resolveAddressIds(draft: {
  province_id?: number | string;
  district_id?: number | string;
  subdistrict_id?: number | string;
  zipcode_id?: number | string;
}) {
  // 1) province
  const provs = unwrap(await AddressAPI.getProvince());
  const provincePk = resolvePk(provs, draft.province_id);

  // 2) district (อิงค่าที่เลือกจาก province เดิม—API ของคุณรับอะไรอยู่ก็ส่งแบบเดิมไป)
  const dists = unwrap(await AddressAPI.getDistrict(Number(draft.province_id)));
  const districtPk = resolvePk(dists, draft.district_id);

  // 3) subdistrict
  const subs = unwrap(await AddressAPI.getSubdistrict(Number(draft.district_id)));
  const subPk = resolvePk(subs, draft.subdistrict_id);

  // 4) zipcode
  const zips = unwrap(await AddressAPI.getZipcode(Number(draft.subdistrict_id)));
  const zipPk = resolvePk(zips, draft.zipcode_id);

  if (!provincePk || !districtPk || !subPk || !zipPk) {
    throw new Error("ข้อมูลจังหวัด/อำเภอ/ตำบล/ไปรษณีย์ ไม่สอดคล้องกัน");
  }
  return { provincePk, districtPk, subPk, zipPk };
}

   const saveAll = async () => {
    try {
      validate();
      setSaving(true);

      // 1) address
      console.log("[address draft]", address);

      const { provincePk, districtPk, subPk, zipPk } =
        await resolveAddressIds(address);

      const addrRes = await addressCRUD.create({
        address_number: String(address.address_number || "").trim(),
        road: String(address.road || "").trim(),
        province_id: provincePk,
        district_id: districtPk,
        subdistrict_id: subPk,
        zipcode_id: zipPk,
      });
      if (!(addrRes?.status >= 200 && addrRes?.status < 300)) {
        throw new Error(addrRes?.data?.error || "สร้างที่อยู่ไม่สำเร็จ");
      }
      const addressId = pickId(addrRes?.data?.data);
      if (!addressId) throw new Error("ไม่พบ address_id จากหลังบ้าน");

      // 2) student
      const stuRes = await studentCRUD.create({
        student_id: String(student.student_id).trim(),
        title_id: Number(student.title_id),
        t_first_name: String(student.t_first_name || "").trim(),
        t_last_name: String(student.t_last_name || "").trim(),
        e_first_name: String(student.e_first_name || "").trim(),
        e_last_name: String(student.e_last_name || "").trim(),
        citizen_id: String(student.citizen_id || "").trim(),
        tel: String(student.tel || "").trim(),
        date_of_birth: student.date_of_birth,
        gender: mapGender(student.gender),
        nationality: String(student.nationality || "").trim(),
        email: String(student.email || "").trim(),
        religious: String(student.religious || "").trim(),
        address_id: Number(addressId),
        grade_id: Number(student.grade_id),
        student_image: imageBase64 || "",
      });
      if (!(stuRes?.status >= 200 && stuRes?.status < 300)) {
        throw new Error(stuRes?.data?.error || "สร้างนักเรียนไม่สำเร็จ");
      }
      const studentPk = stuRes?.data?.data?.id;
      if (!studentPk) throw new Error("ไม่พบ student.id จากหลังบ้าน");

      // 3) guardians (ถ้ามี)
      const anyGuardian =
        !!guardian?.father ||
        !!guardian?.mother ||
        (guardian?.living_with === "guardian" && !!guardian?.guardian);

      if (anyGuardian) {
        const gRes = await guardianCRUD.createProfile({
          student_id: Number(studentPk),
          living_with: guardian.living_with || "parents",
          father: guardian.father,
          mother: guardian.mother,
          guardian:
            guardian.living_with === "guardian" ? guardian.guardian : undefined,
        });
        if (!(gRes?.status >= 200 && gRes?.status < 300)) {
          throw new Error(gRes?.data?.error || "บันทึกข้อมูลผู้ปกครองไม่สำเร็จ");
        }
      }

    msgApi.success("บันทึกข้อมูลสำเร็จ");
    // reset draft ถ้าต้องการ
    setStudentState({});
    setGuardianState({ living_with: "parents" });
    setAddressState({});
    setImageBase64("");
    return true;                 // ⬅️ สำเร็จ
  } catch (e:any) {
    msgApi.error(e?.message || "บันทึกไม่สำเร็จ");
    return false;                // ⬅️ ล้มเหลว
  } finally {
    setSaving(false);
  }
};


  const value = useMemo(() => ({
    student, guardian, address, imageBase64,
    setStudent, setGuardian, setAddress, setImageBase64,
    saving, saveAll,
  }), [student, guardian, address, imageBase64, saving]);

  return (
    <StudentCreateContext.Provider value={value}>
      {ctxHolder}
      {children}
    </StudentCreateContext.Provider>
  );
};
