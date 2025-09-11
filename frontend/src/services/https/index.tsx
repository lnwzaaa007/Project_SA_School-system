import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type {SignInInterface,} from "../../interfaces";
import type {PostSchedule} from "../../interfaces/Schedule"
import { useEffect } from "react";

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

export const Post = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
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
  getStudentSchedule: (grade_id :number) => Get(`/students/schedule?grade_id=${grade_id}`),
};

export const teacherAPI = {
  // getNameTeacher: () => Get("/teacher"),
  getTeachar: (user_id: number) => Get(`/teachers/${user_id}`),
  // getNameTeacherById: (id: number | string) => Get(`/teacher/${id}`),
  getTeacherSchedule: (teacher_id : number) => Get(`/teachers/schedule?teacher_id=${teacher_id}`), 
  getNameTeacherAll: () => Get(`/teachers`),
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

export const ScheduleAPI = {
  getDays: () => Get("/schedule-days"),
  getTimeStart: () => Get("/schedule-times-start"),
  getTimeEnd: () => Get("/schedule-times-end"),
  getSchedule: (grade: number, classId: number, term: number) => Get(`/schedule-get-id?grade=${grade}&class=${classId}&term=${term}`),
  getScheduleCourse: (course_code: string) => Get(`/schedule-course/${course_code}`),
  // requires auth to pass middleware
  postSchedule: (data: PostSchedule) => Post(`/schedules`, data, true),
  deleteSchedule: (id: number) => Delete(`/schedules/${id}`)

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
    class_in_week: number; grade_year: string; grade_class: number; teacher_id: number;
   }) => Post("/new-course", course),
  getCourseAll: () => Get("/coursesall")
  
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
export const addressCRUD = {
  create: (data: {
    address_number: string;
    road?: string;
    province_id: number;
    district_id: number;
    subdistrict_id: number;
    zipcode_id: number;
  }) => Post("/addresses", data),
  list: (qs = "") => Get(`/addresses${qs ? `?${qs}` : ""}`),
  get: (id: number | string) => Get(`/addresses/${id}`),
  update: (id: number | string, data: any) => Update(`/addresses/${id}`, data),
  delete: (id: number | string) => Delete(`/addresses/${id}`),
};

// export const gradeCRUD = {
//   list: (params?: any) => http.get("/grades", { params }),
// };


export const gradeCRUD = {
  list: (params?: any) => http.get("/grades", { params }),
  // ถ้ายังใช้แบบแยกปี/ห้อง:
  years: () => http.get("/gradeyears"),
  classes: () => http.get("/gradeclasses"),
  byYearAndClass: (year: number, classId: number) =>
    http.get("/gradeclassID", { params: { grade_year_id: year, grade_class_id: classId } }),
};
