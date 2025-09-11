import React, { createContext, useContext, useMemo, useState } from "react";
import { message } from "antd";
import {
  addressCRUD_N,
  studentCRUD,
  guardianCRUD,
} from "../../../../services/https";
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
  gender?: string; // male/female
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
  dob?: string; // YYYY-MM-DD
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
  province_id?: number; // id ที่มาจาก Select (FE)
  district_id?: number;
  subdistrict_id?: number;
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
  saveAll: (editingId?: number) => Promise<boolean>;
};

const unwrapData = (res: any) => res?.data?.data ?? res?.data ?? null;

const StudentCreateContext = createContext<Ctx | null>(null);
export const useStudentCreate = () => {
  const ctx = useContext(StudentCreateContext);
  if (!ctx)
    throw new Error("useStudentCreate must be used under StudentCreateContext");
  return ctx;
};

// ---------- helpers ----------
const pickId = (obj: any) => obj?.id ?? obj?.ID;
const mapGender = (g?: string) =>
  g === "male" ? "ชาย" : g === "female" ? "หญิง" : g || "";

// ---------- provider ----------
export const StudentCreateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [student, setStudentState] = useState<StudentDraft>({});
  const [guardian, setGuardianState] = useState<GuardianDraft>({
    living_with: "parents",
  });
  const [address, setAddressState] = useState<AddressDraft>({});
  const [imageBase64, setImageBase64] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msgApi, ctxHolder] = message.useMessage();

  const setStudent = (p: Partial<StudentDraft>) =>
    setStudentState((s) => ({ ...s, ...p }));
  const setGuardian = (p: Partial<GuardianDraft>) =>
    setGuardianState((g) => ({ ...g, ...p }));
  const setAddress = (p: Partial<AddressDraft>) =>
    setAddressState((a) => ({ ...a, ...p }));

  // ✅ validate แบบแยกโหมด
  const validate = (isEdit = false) => {
    if (!student.student_id) throw new Error("กรุณากรอกรหัสนักเรียน");
    if (!student.citizen_id) throw new Error("กรุณากรอกเลขบัตรประชาชน");
    if (!student.t_first_name || !student.t_last_name)
      throw new Error("กรอกชื่อ-นามสกุลให้ครบ");
    if (!student.title_id) throw new Error("กรุณาเลือกคำนำหน้า");
    if (!student.date_of_birth) throw new Error("กรุณาเลือกวันเกิด");
    if (!student.grade_id) throw new Error("กรุณาเลือกชั้นปี");

    // โหมดสร้างเท่านั้นที่ “บังคับ” ที่อยู่ครบ
    if (!isEdit) {
      if (!address.address_number)
        throw new Error("กรุณากรอกรายละเอียดที่อยู่");
      if (
        !address.province_id ||
        !address.district_id ||
        !address.subdistrict_id
      ) {
        throw new Error("กรุณาเลือกจังหวัด/อำเภอ/ตำบล ให้ครบ");
      }
    }
  };

  const unwrap = (res: any) =>
    Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

  // เทียบเป็นตัวเลขพร้อมรองรับ string number
  const toNum = (v: any) => (v == null ? NaN : Number(v));

  // ให้หา PK (ID ของ GORM) จากลิสต์ ด้วยค่า “ที่ Select ส่งมา” (ซึ่งอาจเป็น code อื่น)
  function resolvePk(list: any[], picked: any): number | undefined {
    const target = toNum(picked);
    if (Number.isNaN(target)) return undefined;

    // พยายามจับคู่กับฟิลด์ยอดฮิตทั้งหมด
    const found = list.find((x) => {
      const cand = [
        x?.ID,
        x?.id,
        x?.province_id,
        x?.district_id,
        x?.subdistrict_id,
        x?.zipcode_id,
        x?.Thai_Province_ID,
        x?.Thai_District_ID,
        x?.Thai_Subdistrict_ID,
        x?.Thai_ZipCode_ID,
        x?.zip_code,
        x?.zipcode,
      ].map(toNum);
      return cand.some((n) => !Number.isNaN(n) && n === target);
    });

    // คืน PK จริง (ID/ id) ถ้ามี
    const pk = found?.ID ?? found?.id;
    return typeof pk === "number" ? pk : pk != null ? Number(pk) : undefined;
  }

  // เรียกตอนจะ save เพื่อแปลง province/district/subdistrict/zipcode → PK จริง
  async function resolveAddressIds(draft: {
    province_id?: number | string;
    district_id?: number | string;
    subdistrict_id?: number | string;
  }) {
    const provs = unwrap(await AddressAPI.getProvince());
    const provincePk = resolvePk(provs, draft.province_id);

    const dists = unwrap(await AddressAPI.getDistrict(provincePk!)); // ← ใช้ provincePk
    const districtPk = resolvePk(dists, draft.district_id);

    const subs = unwrap(await AddressAPI.getSubdistrict(districtPk!)); // ← ใช้ districtPk
    const subPk = resolvePk(subs, draft.subdistrict_id);

    if (!provincePk || !districtPk || !subPk) {
      throw new Error("ข้อมูลจังหวัด/อำเภอ/ตำบล ไม่สอดคล้องกัน");
    }
    return { provincePk, districtPk, subPk };
  }

  const saveAll = async (editingId?: number) => {
    try {
      const isEdit = !!editingId; // ⬅️ เพิ่ม
      validate(isEdit);
      setSaving(true);

      // ---------- โหมดแก้ไข ----------
      if (editingId) {
        // 1) โหลด student เดิม เพื่อดึง address_id ปัจจุบัน
        const cur = await studentCRUD.getById(editingId);

        // ✅ ต้องแกะแบบนี้
        const current = cur?.data?.data ?? cur?.data;
        const currentAddressId: number | undefined = current?.address_id;
        if (!currentAddressId) throw new Error("ไม่พบ address_id ของนักเรียน");

        // 2) map id จังหวัด/อำเภอ/ตำบล → PK จริง
        const { provincePk, districtPk, subPk } =
          await resolveAddressIds(address);

        // 3) UPDATE address → แนะนำส่ง thai_* ตรง ๆ ให้ชัวร์
        const addrUpdRes = await addressCRUD_N.update(currentAddressId, {
          address_number: String(address.address_number || "").trim(),
          road: String(address.road || "").trim(),
          thai_province_id: provincePk,
          thai_district_id: districtPk,
          thai_subdistrict_id: subPk,
        });
        if (addrUpdRes?.data?.error || addrUpdRes?.error) {
          throw new Error(
            addrUpdRes?.data?.error ||
              addrUpdRes?.error ||
              "อัปเดตที่อยู่ไม่สำเร็จ"
          );
        }

        // 4) UPDATE student (ส่งเฉพาะฟิลด์ที่แก้)
        const up: any = {
          title_id: student.title_id,
          t_first_name: student.t_first_name,
          t_last_name: student.t_last_name,
          e_first_name: student.e_first_name,
          e_last_name: student.e_last_name,
          citizen_id: student.citizen_id,
          tel: student.tel,
          date_of_birth: student.date_of_birth,
          gender: mapGender(student.gender),
          nationality: student.nationality,
          email: student.email,
          religious: student.religious,
          grade_id: student.grade_id,
        };
        if (imageBase64) up.student_image = imageBase64;

        const stuUpdRes = await studentCRUD.update(editingId, up);

        // Debug response structure
        console.log("Full stuUpdRes:", stuUpdRes);
        console.log("stuUpdRes.status:", stuUpdRes?.status);
        console.log("stuUpdRes.data:", stuUpdRes?.data);
        console.log("All keys:", Object.keys(stuUpdRes || {}));

        // ตรวจสอบความสำเร็จหลายแบบ
        const hasStudentError = stuUpdRes?.data?.error || stuUpdRes?.error;
        const studentStatusOk =
          stuUpdRes?.status === 200 || stuUpdRes?.status === "200";
        const studentSuccess =
          stuUpdRes?.data?.success === true || stuUpdRes?.success === true;

        // ถ้ามี error ชัดเจน ถือว่า fail
        if (hasStudentError) {
          throw new Error(hasStudentError || "อัปเดตข้อมูลนักเรียนไม่สำเร็จ");
        }

        // ถ้ามี status และไม่ใช่ 200 ถือว่า fail (แต่ถ้าไม่มี status ก็ผ่านไป)
        if (stuUpdRes?.status && !studentStatusOk && !studentSuccess) {
          throw new Error(
            "อัปเดตข้อมูลนักเรียนไม่สำเร็จ - Invalid status: " +
              stuUpdRes?.status
          );
        }

        // 4) ผู้ปกครอง (upsert ผ่าน controller เดิม)
        const anyGuardian =
          !!guardian?.father ||
          !!guardian?.mother ||
          (guardian?.living_with === "guardian" && !!guardian?.guardian);

        if (anyGuardian) {
          const gRes = await guardianCRUD.createProfile({
            student_id: Number(editingId),
            living_with: guardian.living_with || "parents",
            father: guardian.father,
            mother: guardian.mother,
            guardian:
              guardian.living_with === "guardian"
                ? guardian.guardian
                : undefined,
          });
          if (!(gRes?.status >= 200 && gRes?.status < 300)) {
            throw new Error(
              gRes?.data?.error || "บันทึกข้อมูลผู้ปกครองไม่สำเร็จ"
            );
          }
        }

        msgApi.success("อัปเดตข้อมูลสำเร็จ");
        console.log("อัปเดตข้อมูลสำเร็จ");
        return true;
      }
      // 1) address
      console.log("[address draft]", address);

      // ---------- โหมดสร้าง (เหมือนเดิม) ----------
      const { provincePk, districtPk, subPk } =
        await resolveAddressIds(address);
      const addrRes = await addressCRUD_N.create({
        address_number: String(address.address_number || "").trim(),
        road: String(address.road || "").trim(),
        province_id: provincePk,
        district_id: districtPk,
        subdistrict_id: subPk,
      });
      if (!(addrRes?.status >= 200 && addrRes?.status < 300)) {
        throw new Error(addrRes?.data?.error || "สร้างที่อยู่ไม่สำเร็จ");
      }
      const addressId = pickId(unwrapData(addrRes));
      if (!addressId) throw new Error("ไม่พบ address_id จากหลังบ้าน");

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

      msgApi.success("บันทึกข้อมูลสำเร็จ");
      setStudentState({});
      setGuardianState({ living_with: "parents" });
      setAddressState({});
      setImageBase64("");
      return true;
    } catch (e: any) {
      msgApi.error(e?.message || "บันทึกไม่สำเร็จ");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const value = useMemo(
    () => ({
      student,
      guardian,
      address,
      imageBase64,
      setStudent,
      setGuardian,
      setAddress,
      setImageBase64,
      saving,
      saveAll,
    }),
    [student, guardian, address, imageBase64, saving]
  );

  return (
    <StudentCreateContext.Provider value={value}>
      {ctxHolder}
      {children}
    </StudentCreateContext.Provider>
  );
};
