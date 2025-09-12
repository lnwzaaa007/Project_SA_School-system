import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type {SignInInterface,} from "../../interfaces";
import type {PostSchedule} from "../../interfaces/Schedule"
import type {AttendanceInterface} from "../../interfaces/Attendance"
import { useEffect } from "react";
import type { UpdateCoursePayload } from "../../interfaces/course";

const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8088";


const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    return AccessToken ? AccessToken : null;
  }
  return null;
};

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getCookie("0195f494-feaa-734a-92a6-05739101ede9")}`,
    "Content-Type": "application/json",
  },
});

const getConfigWithoutAuth = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

//////

export const http = axios.create({
  baseURL: API_URL,
  // ถ้าต้องส่ง cookie cross-site ด้วยให้เปิดด้วย (ไม่บังคับ เพราะเราดึง token จาก cookie มาใส่ header อยู่แล้ว)
  // withCredentials: true,
});

http.interceptors.request.use((config) => {
  const tokenFromCookie = getCookie("0195f494-feaa-734a-92a6-05739101ede9");
  const tokenFromLS = localStorage.getItem("token"); // เผื่อคุณเก็บ token ใน LS
  const token = tokenFromCookie || tokenFromLS;

  if (token && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  // ใส่ content-type ให้แน่ใจ
  (config.headers as any)["Content-Type"] =
    config.headers?.["Content-Type"] || "application/json";
  return config;
});


// ดัก 401 (เหมือนฟังก์ชัน Get/Post เดิมของคุณ)
http.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

///////

// services/https.ts (หรือไฟล์ services ของคุณ)
const isFormData = (data: any) =>
  typeof FormData !== "undefined" && data instanceof FormData;

const getFormConfig = (requireAuth = true) => ({
  headers: {
    ...(requireAuth
      ? { Authorization: `Bearer ${getCookie("0195f494-feaa-734a-92a6-05739101ede9")}` }
      : {}),
    // อย่ากำหนด Content-Type เวลาเป็น FormData
  },
});

export const Post = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = isFormData(data)
    ? getFormConfig(requireAuth)
    : requireAuth
    ? getConfig()
    : getConfigWithoutAuth();
  return await axios
    .post(`${API_URL}${url}`, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Get = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .get(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.message === "Network Error") {
        return error.response;
      }
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Update = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = isFormData(data)
    ? getFormConfig(requireAuth)  // ❗️อย่าตั้ง content-type เองถ้าเป็น FormData
    : requireAuth
    ? getConfig()
    : getConfigWithoutAuth();
  return await axios
    .put(`${API_URL}${url}`, data, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Delete = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .delete(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

// Authentication APIs
export const authAPI = {
  // Member authentication
  userLogin: (data: SignInInterface) => Post("/auth", data, false),

};

// export const studentAPI = {
//   me: () => Get("/student", true), // ดึง profile ของ student ที่ login อยู่
// };

export const studentAPI = {
  getStudent: (user_id :number) => Get(`/students/${user_id}`),
  // getNameStudentById: (user_id: number | string) => Get(`/student/${user_id}`),
  
};

export const teacherAPI = {
  // getNameTeacher: () => Get("/teacher"),
  getTeachar: (user_id: number) => Get(`/teachers/${user_id}`),
  getNameTeacherById: (id: number | string) => Get(`/teacher/${id}`),
  createTeacher: (form: FormData) => Post(`/teacher`, form, true),
  getNameTeacherAll: () => Get(`/teachers`),
  getteacher :() => Get(`/teacher`),
  getTeacherDetail: (id: number | string) => Get(`/teacher-detail/${id}`),
  deleteTeacher: (id: number | string) => Delete(`/teacher/${id}`),
  updateTeacher: (id: number | string, data: any) => Update(`/teacher/${id}`, data, true),
  
};

export const adminAPI = {
  getNameAdminById: (id: number | string) => Get(`/admin/${id}`),
};

export const gradeAPI = {
  getGradesAll: () => Get("/gradeyears"),
  getClassesAll: () => Get("/gradeclasses"),
  getGradeByYearAndClass: (year: number, className: string) => Get(`/gradeclassID?grade_year_id=${year}&grade_class_id=${className}`),

};
export const termAPI = {
  getTermsAll: () => Get("/terms"),
};
//แม็ก ระบบ สร้างตารางเรียน
export const ScheduleAPI = {
  getDays: () => Get("/schedule-days"),
  getTimeStart: () => Get("/schedule-times-start"),
  getTimeEnd: () => Get("/schedule-times-end"),
  getSchedule: (grade: number, classId: number, term: number) => Get(`/schedule-get-id?grade=${grade}&class=${classId}&term=${term}`),
  getScheduleCourse: (course_code: string) => Get(`/schedule-course/${course_code}`),

  postSchedule: (data: PostSchedule) => Post(`/schedules`, data, true),
  deleteSchedule: (id: number) => Delete(`/schedules/${id}`),
  //ถ้ามีเทอมให้ส่งเทอม ถ้าไม่มีส่งแค่teacher_id
  getStudentSchedule: (grade_id :number,term_id?: number) => {
    const url = term_id != null
    ?`/students/schedule?grade_id=${grade_id}&term_id=${term_id}`
    :`/students/schedule?grade_id=${grade_id}`;
    return Get(url);
  },
  //ถ้ามีเทอมให้ส่งเทอม ถ้าไม่มีส่งแค่teacher_id
  getTeacherSchedule: (teacher_id: number, term_id?: number) => {
    const url = term_id != null
      ? `/teachers/schedule?teacher_id=${teacher_id}&term_id=${term_id}`
      : `/teachers/schedule?teacher_id=${teacher_id}`;
    return Get(url);
  }, 
};
//แม็ก ระบบเช็คชื่อ
export const AttendancesAPI ={
  getCourseSchedule: (grade: number,classID:number) => Get(`/attendances-course?grade=${grade}&class=${classID}`),
  getStudentByGrade: (grade: number,classID:number) => Get(`/attendances-student?grade=${grade}&class=${classID}`),
  postAttendance: (data: AttendanceInterface) => Post(`/attendances-record`,data,true),
  getAttendanceHistory: (schedule_id:number, student_id:number) => Get(`/attendances/student-history?schedule_id=${schedule_id}&student_id=${student_id}`),
  getAttendanceTeacher: (schedule_id:number) => Get(`/attendances/teacher-history?schedule_id=${schedule_id}`),
  getAttendanceByDate: (schedule_id:number, date:string) => Get(`/attendances-date?schedule_id=${schedule_id}&date=${date}`),
  updateAttendance: (data: AttendanceInterface /*& { date: string }*/) => Update(`/attendances-record`, data, true),
};

export const userTypeAPI = {
  getUserTypes: (id: number) => Get(`/users/${id}`),
};

// export const ProvinceAPI ={
//   getProvince: () => Get("/province"),
// }

// export const DistrictAPI ={
//   getDistrict: (id: number) => Get(`/district/${id}`)
// }

export const AddressAPI ={
    getProvince: () => Get("/thaiprovince"),
    getDistrict: (id: number) => Get(`/thaidistrict/${id}`),
    getSubdistrict: (id: number) => Get(`/thaisubdistrict/${id}`),
    getZipcode: (id: number) => Get(`/thaizipcode/${id}`),
    createAddress: (payload: {
    address_number: string;
    road?: string;
    thai_province_id: number;
    thai_district_id: number;
    thai_subdistrict_id: number;
    teacher_id?: number;   // PK ของตาราง teachers (ไม่ใช่ Teacher_ID ที่เป็น string)
    student_id?: number;
  }) => Post("/address", payload, true),
}
export const annoncementAPI = {
  getAnnouncements: () => Get("/new-announcements"),
};

export const targetGroupAPI = {
  getTargetGroupAll: () => Get("/targetgroup"),
};

export const subjectGroupAPI = {
  getSubjectGroupAll: () => Get("/subjectgroup"),
};

export const courseAPI = {
  CreateCourseAll: (course:{course_code: string; course_name:string; subject_group_id: number; credit_num: number;
    class_in_week: number; grade_year: string; grade_class: number; teacher_id: number; term_id: number; grade_id: number;
   }) => Post("/new-course", course), 
  getCourseAll: () => Get("/coursesall"),
  getGradClassAllWithYear: () => Get(`/gradeclass/allwithyear`),
  deleteCourse: (id: number) => Delete(`/course/${id}`),
  updateCourse: (id: number, data: UpdateCoursePayload
                // course:{
                // course_code: string; 
                // course_name: string; 
                // subject_group_id: number; 
                // credit_num: number;
                // class_in_week: number; 
                // grade_year: string; 
                // grade_class: number; 
                // teacher_id: number; 
                // term_id: number; 
                // grade_id: number;
  ) => Update(`/course/${id}`,data ,true),
  getCourseById: (id: number) => Get(`/course/${id}`),
  
};
export const ProvinceAPI ={
  getProvince: () => Get("/province"),
}

export const DistrictAPI ={
  getDistrict: (id: number) => Get(`/district/${id}`)
}
export const AssignmentAPI = {
  getCourses: () => Get(`/courses`),
  getAssignments: (id:number) => Get(`/assignments/${id}`),
  getAssignmentById: (id:number) => Get(`/assignment/${id}`), 

}

export async function submitAssignment(fd: FormData) {
  const res = await fetch("http://localhost:8088/submit-assignment", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Submit failed ${res.status}`);
  return res.json();
}

export const GetBinary = async (
  url: string,
  requireAuth: boolean = true,
  extraHeaders?: Record<string, string>
) => {
  const base = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios.get(`${API_URL}${url}`, {
    responseType: "blob",
    headers: { ...base.headers, ...(extraHeaders || {}) },
  });
};
export const GenderAPI = {
  getGender: () => Get("/gender"),
}

export const TitleAPI = {
  getTitle : () => Get("/title"),
}

export const EnrollmentAPI = {
  getEnrollment: () => Get("/enrollment"),
  getEnrollmentById: (id: number | string) => Get(`/enrollment/${id}`),
  createEnrollment: (form: FormData) => Post("/enrollments", form, false),
  deleteEnrollment: (id: number | string) => Delete(`/enrollment/${id}`),
};




export const studentCRUD = {
  list: (params: { q?: string; grade_id?: number|string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", String(params.q));
    if (params?.grade_id) qs.set("grade_id", String(params.grade_id));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    return Get(`/student?${qs.toString()}`);
  },
  // POST /studentAdd
  create: (data: any) => Post("/studentAdd", data),

  // GET /student/:id
  getById: (id: number | string) => Get(`/student/${id}`),

  // PUT /student/:id  (มี route หลังบ้านแล้ว เผื่อใช้ทีหลัง)
  update: (id: number | string, data: any) => Update(`/student/${id}`, data),

  // GET รูปนักเรียน (ใช้กับ <img src={...}>)
  imageUrl: (id: number | string) => `${API_URL}/student/${id}/image`,

  // ถ้ามีลบในอนาคต:
  remove: (id: number | string) => Delete(`/students/${id}`),
};


// ==== Guardian (ผู้ปกครอง) ====
export const guardianCRUD = {
  // POST /guardian-student  (upsert พ่อ/แม่/ผู้ปกครอง ของนักเรียน 1 คน)
  createProfile: (data: any) => Post("/guardian-student", data),

  // GET /guardian-student?student_id=123
  listByStudent: (studentId: number | string) =>
    Get(`/guardian-student?student_id=${studentId}`),

  // GET /guardian-student/:id   (อ่าน link รายแถว)
  getLink: (id: number | string) => Get(`/guardian-student/${id}`),

  // PUT /guardian-student/:id   (แก้บทบาท/ข้อมูลผู้ปกครองที่ลิงก์อยู่)
  updateLink: (id: number | string, data: any) => Update(`/guardian-student/${id}`, data),

  // DELETE /guardian-student/:id (ลบเฉพาะ link)
  deleteLink: (id: number | string) => Delete(`/guardian-student/${id}`),
};


// ==== Address (ที่อยู่) ====
// services/https (เฉพาะส่วน Address)

type CreateAddressPayload = {
  address_number: string | number;
  road?: string;
  thai_province_id?: number;
  thai_district_id?: number;
  thai_subdistrict_id?: number;

  // alias จากฟอร์มเก่า (จะถูกแมพเป็น thai_*)
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
};
type UpdateAddressPayload = Partial<CreateAddressPayload>;

const normalizeAddressPayload = (data: CreateAddressPayload | UpdateAddressPayload) => {
  const out: any = { ...data };
  out.thai_province_id    = out.thai_province_id    ?? out.province_id;
  out.thai_district_id    = out.thai_district_id    ?? out.district_id;
  out.thai_subdistrict_id = out.thai_subdistrict_id ?? out.subdistrict_id;
  delete out.province_id; delete out.district_id; delete out.subdistrict_id;
  return out;
};

export const addressCRUD_N = {
  create: (data: CreateAddressPayload) =>
    Post("/addressesN", normalizeAddressPayload(data)),

  list: (qs = "") => Get(`/addressesN${qs ? `?${qs}` : ""}`),

  get: (id: number | string) => Get(`/addressesN/${id}`),

  update: (id: number | string, data: UpdateAddressPayload) =>
    Update(`/addressesN/${id}`, normalizeAddressPayload(data)),

  delete: (id: number | string) => Delete(`/addressesN/${id}`),
};


export const gradeCRUD = {
  list: (params?: any) => http.get("/grades", { params }),
  // ถ้ายังใช้แบบแยกปี/ห้อง:
  years: () => http.get("/gradeyears"),
  classes: () => http.get("/gradeclasses"),
  byYearAndClass: (year: number, classId: number) =>
    http.get("/gradeclassID", { params: { grade_year_id: year, grade_class_id: classId } }),
};

// ==== Education Records (คะแนนนักเรียน) ====
export interface EducationRecordInterface {
  id?: number;
  term_id: number;
  course_id: number;
  teacher_id: number;
  student_id: number;
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEducationRecordPayload {
  term_id: number;
  course_id: number;
  teacher_id: number;
  student_id: number;
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
}

export interface UpdateEducationRecordPayload {
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
  teacher_id?: number;
}

export interface EducationRecordListParams {
  term_id?: number;
  course_id?: number;
  student_id?: number;
  teacher_id?: number;
  page?: number;
  page_size?: number;
}

export const educationRecordsAPI = {
  // GET /teacher/education-records - List all education records with filters
  list: (params?: EducationRecordListParams) => 
    http.get("/teacher/education-records", { params }),

  // GET /teacher/education-records/:id - Get single education record
  getById: (id: number | string) => 
    http.get(`/teacher/education-records/${id}`),

  // POST /teacher/education-records - Create new education record
  create: (data: CreateEducationRecordPayload) => 
    http.post("/teacher/education-records", data),

  // PUT /teacher/education-records/:id - Update education record
  update: (id: number | string, data: UpdateEducationRecordPayload) => 
    http.put(`/teacher/education-records/${id}`, data),

  // DELETE /teacher/education-records/:id - Delete education record
  delete: (id: number | string) => 
    http.delete(`/teacher/education-records/${id}`),

  // Student self-view endpoints
  getMyRecords: (params?: { term_id?: number; course_id?: number; page?: number; page_size?: number }) =>
    http.get("/student/education-records", { params }),

  getMyRecordById: (id: number | string) =>
    http.get(`/student/education-records/${id}`),

  getMyRecordByTermCourse: (term_id: number, course_id: number) =>
    http.get("/student/education-record", { params: { term_id, course_id } }),
};

