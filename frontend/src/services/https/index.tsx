import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type {SignInInterface,} from "../../interfaces";
import type {PostSchedule} from "../../interfaces/Schedule"
import type {AttendanceInterface} from "../../interfaces/Attendance"
import { useEffect } from "react";
import type { UpdateCoursePayload } from "../../interfaces/course";
import type { AnnouncementInterface } from "../../interfaces/announcement";
const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8088";
import type { TeacherLite } from "../../interfaces/Teacher";


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
   console.log("error1");
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
       console.log("POST error");     
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
       console.log("GET error");
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
    ? getFormConfig(requireAuth)  // อย่าตั้ง content-type เองถ้าเป็น FormData
    : requireAuth
    ? getConfig()
    : getConfigWithoutAuth();
  return await axios
    .put(`${API_URL}${url}`, data, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
      console.log("UPDATE error");
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
        console.log("DELETE error");
      }
      return error.response;
    });
};

// Authentication APIs
export const authAPI = {
  // Member authentication
  userLogin: (data: SignInInterface) => Post("/auth", data, false),

};

export const studentAPI = {
  getStudent: (user_id :number) => Get(`/students/${user_id}`),
  getStudentCount: () =>Get(`/studentcount`),
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
  getGradeTeacher : () => Get(`/gradeteacher`),
  assignTeacher: (gradeId: number | string, teacherPk: number | string, force = false) =>
    Update(`/grades/${gradeId}/teacher${force ? "?force=1" : ""}`, { teacher_id: Number(teacherPk) }, true),
  unassignTeacher: (gradeId: number | string) =>
    Update(`/grades/${gradeId}/teacher`, { teacher_id: null }, true),
  getGradeTeacherById: (teacher_id: number) => Get(`/gradeteacher/${teacher_id}`),
  
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

export const userCRUD = {
  // GET /users/:id  -> { prefix: "S" | "T" | ... }
  getPrefixById: (id: number | string) => Get(`/users/${id}`),
};

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
//ระบบประกาศ
export const announcementAPI = {
  getAnnouncements: () => Get("/announcements"),
  createAnnouncement: (data: {title: string; content: string; category: string; time_create: string;
                              status?: string; create_date?: string; end_date?: string; target_group_id?: number; 
                              /*user_id?: number; admin_id?: number; term_id?: number; enrollment_id?: number;*/}) => 
                              Post("/new-announcement", data, true),
  deleteAnnouncement: (id: number) => Delete(`/announcements/${id}`),
  publishAnnouncement:(id: number) => Update(`/announcements/${id}/publish`, { status: 'published' }, true),
  updateAnnouncement:(id: number, data: AnnouncementInterface) => Update(`/announcements/${id}`,data,true),
  getAnnouncementByID: (id: number) => Get(`/announcements/${id}`),
  
};

export const targetGroupAPI = {
  getTargetGroupAll: () => Get("/targetgroup"),
};

export const subjectGroupAPI = {
  getSubjectGroupAll: () => Get("/subjectgroups"),
  
};

export const courseAPI = {
  CreateCourseAll: (course:{course_code: string; course_name:string; subject_group_id: number; credit_num: number;
    class_in_week: number; grade_year: string; grade_class: number; teacher_id: number; term_id: number; grade_id: number;
   }) => Post("/new-course", course), 
  getCourseAll: () => Get("/coursesall"),
  getGradClassAllWithYear: () => Get(`/gradeclass/allwithyear`),
  deleteCourse: (id: number) => Delete(`/course/${id}`),
  updateCourse: (id: number, data: UpdateCoursePayload) => Update(`/course/${id}`,data ,true),
  getCourseById: (id: number) => Get(`/course/${id}`),
  
};
export const ProvinceAPI ={
  getProvince: () => Get("/province"),
}

export const DistrictAPI ={
  getDistrict: (id: number) => Get(`/district/${id}`)
}
export const AssignmentAPI = {
  getCourses: (grade_id: number) => Get(`/courses/${grade_id}`),
  getAssignments: (id:number) => Get(`/assignments/${id}`),
  getAssignmentById: (id:number) => Get(`/assignment/${id}`),
  getMySubmissionsByCourse: (course_id: number, student_id: number | string) =>
    Get(`/assignment-submissions/course/${course_id}?student_id=${student_id}`),
  getMySubmissionByAssignment: (assignmentId: number, studentId: number | string) =>
    Get(`/assignment-check/${assignmentId}?student_id=${studentId}`),
};


export async function submitAssignment(fd: FormData) {
  const res = await fetch(`${API_URL}/submit-assignment`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Submit failed ${res.status}`);
  return res.json();
}


export const createAssignment = {
  // postAssignment: (form: FormData) => Post("/assignments", form, true),
  getCourseTeacher: (teacher_id: number) => Get(`/courses/teacher/${teacher_id}`),
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
  updateEnrollment: (id: number | string, data: FormData | any) => Update(`/enrollment/${id}`, data, true),
  checkStatus: (citizenId: string) =>  Get(`/checkenrollment?citizen_id=${encodeURIComponent(citizenId)}`, false),
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

 // GET /students/:user_id  (ดึงนักเรียนด้วย users_id)
  getByUserId: (userId: number | string) => Get(`/students/${userId}`),
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

  listByStudent_U: (studentPkId: number | string) =>
  Get(`/guardian-student?student_id=${studentPkId}`),
};


// ==== Address (ที่อยู่) ====
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

    // GET /addressesN/:id -> { data: {...} } หรือ {...}
  getById: (id: number | string) => Get(`/addressesN/${id}`),
};

export const gradeCRUD = {
  list: (params?: any) => http.get("/grades", { params }),
  // ถ้ายังใช้แบบแยกปี/ห้อง:
  years: () => http.get("/gradeyears"),
  classes: () => http.get("/gradeclasses"),
  byYearAndClass: (year: number, classId: number) =>
    http.get("/gradeclassID", { params: { grade_year_id: year, grade_class_id: classId } }),

};

export const StudentAPI = {
  list: (params: { grade_id?: number|string; class_id?: number|string; page_size?: number }) => {
    const qs = new URLSearchParams();
    if (params.grade_id) qs.set("grade_id", String(params.grade_id));
    if (params.class_id) qs.set("class_id", String(params.class_id)); // ถ้า BE ใช้ room_no ให้เปลี่ยนตรงนี้
    qs.set("page_size", String(params.page_size ?? 1000));
    return Get(`/student?${qs.toString()}`);
  },
};

export const EduRecordAPI = {
  list: (params: {
    term_id?: number | string;
    course_id?: number | string;
    teacher_id?: number | string;
    student_id?: number | string;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.term_id) qs.set("term_id", String(params.term_id));
    if (params?.course_id) qs.set("course_id", String(params.course_id));
    if (params?.teacher_id) qs.set("teacher_id", String(params.teacher_id));
    if (params?.student_id) qs.set("student_id", String(params.student_id));
    qs.set("page_size", String(params?.page_size ?? 1000));
    return Get(`/teacher/education-records?${qs.toString()}`);
  },
  create: (data: any) => Post("/teacher/education-records", data),
  update: (id: number, data: any) => Update(`/teacher/education-records/${id}`, data),
};

export const courseAPI_N = {
  // GET /coursesall  (จาก controller: GetCourseAll)
  getAll: async () => {
    const res = await Get("/coursesall");
    // รองรับทั้งแบบที่ backend คืน {data: [...]} หรือคืน [...] ตรงๆ
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
};

export const teacherAPI_N = {
  getAll: async (): Promise<TeacherLite[]> => {
    const res = await Get("/teachers");
    const raw = Array.isArray(res) ? res : (res?.data ?? []);
    return (raw as any[]).map((r) => ({
      id: Number(r.id),
      teacher_id: String(r.teacher_id ?? ""),
      t_first_name: String(r.t_first_name ?? ""),
      t_last_name: String(r.t_last_name ?? ""),
    }));
  },
};


/////////// SAFE helpers (เพิ่มใหม่ ไม่ยุ่งของเดิม)

export const getAuthTokenSafe = (): string | null => {
  // reuse cookie key & LS ตามที่โปรเจกต์ใช้อยู่
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) =>
    row.startsWith(`0195f494-feaa-734a-92a6-05739101ede9=`),
  );
  let cookieToken: string | null = null;
  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    cookieToken = AccessToken || null;
  }
  const lsToken = localStorage.getItem("token");
  return cookieToken || lsToken || null;
};

const buildHeadersSafe = (requireAuth = true): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthTokenSafe();
  // ใส่ Authorization เฉพาะมี token จริงเท่านั้น
  if (requireAuth && token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// คืนแกนข้อมูล ไม่สนว่าห่อแบบไหน
export const pickPayloadSafe = (res: any) => {
  const rd = res?.data ?? res;
  return rd?.data ?? rd;
};

export const SafeGet = async (url: string, requireAuth = true) => {
  const headers = buildHeadersSafe(requireAuth);
  try {
    const res = await axios.get(`${API_URL}${url}`, { headers });
    return res.data;
  } catch (error: any) {
    // ทำพฤติกรรมเดียวกับของเดิม (ถ้า 401 เคลียร์)
    const status = error?.response?.status;
    if (status === 401) {
     console.log("error5");
    }
    return error?.response;
  }
};

export const SafePost = async (url: string, data: any, requireAuth = true) => {
  // ถ้าเป็น FormData ห้ามตั้ง content-type เอง
  const isFD = typeof FormData !== "undefined" && data instanceof FormData;
  const headers = isFD ? buildHeadersSafe(requireAuth) : buildHeadersSafe(requireAuth);
  if (isFD) delete headers["Content-Type"];

  try {
    const res = await axios.post(`${API_URL}${url}`, data, { headers });
    return res;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
       console.log("error6");
    }
    return error?.response;
  }
};

export const SafeUpdate = async (url: string, data: any, requireAuth = true) => {
  const isFD = typeof FormData !== "undefined" && data instanceof FormData;
  const headers = isFD ? buildHeadersSafe(requireAuth) : buildHeadersSafe(requireAuth);
  if (isFD) delete headers["Content-Type"];

  try {
    const res = await axios.put(`${API_URL}${url}`, data, { headers });
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
     console.log("error7");
    }
    return error?.response;
  }
};

export const SafeDelete = async (url: string, requireAuth = true) => {
  const headers = buildHeadersSafe(requireAuth);
  try {
    const res = await axios.delete(`${API_URL}${url}`, { headers });
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      console.log("error8");
    }
    return error?.response;
  }
};

// CRUD ชุด SAFE (เพิ่มใหม่ ไม่ยุ่งของเดิม)

export const studentCRUD_SAFE = {
  list: (params: { q?: string; grade_id?: number|string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", String(params.q));
    if (params?.grade_id) qs.set("grade_id", String(params.grade_id));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    return SafeGet(`/student?${qs.toString()}`);
  },
  create: (data: any) => SafePost("/studentAdd", data),
  getById: (id: number | string) => SafeGet(`/student/${id}`),
  update: (id: number | string, data: any) => SafeUpdate(`/student/${id}`, data),
  imageUrl: (id: number | string) => `${API_URL}/student/${id}/image`,
  remove: (id: number | string) => SafeDelete(`/students/${id}`),
  getByUserId: (userId: number | string) => SafeGet(`/students/${userId}`),
};

export const guardianCRUD_SAFE = {
  createProfile: (data: any) => SafePost("/guardian-student", data),
  listByStudent: (studentId: number | string) => SafeGet(`/guardian-student?student_id=${studentId}`),
  getLink: (id: number | string) => SafeGet(`/guardian-student/${id}`),
  updateLink: (id: number | string, data: any) => SafeUpdate(`/guardian-student/${id}`, data),
  deleteLink: (id: number | string) => SafeDelete(`/guardian-student/${id}`),
};

export const userCRUD_SAFE = {
  getPrefixById: (id: number | string) => SafeGet(`/users/${id}`),
};

export const addressCRUD_N_SAFE = {
  create: (data: any) => SafePost("/addressesN", data),
  list: (qs = "") => SafeGet(`/addressesN${qs ? `?${qs}` : ""}`),
  get: (id: number | string) => SafeGet(`/addressesN/${id}`),
  update: (id: number | string, data: any) => SafeUpdate(`/addressesN/${id}`, data),
  delete: (id: number | string) => SafeDelete(`/addressesN/${id}`),
  getById: (id: number | string) => SafeGet(`/addressesN/${id}`),
};

export const gradeName_SAFE = (() => {
  let cache: any[] | null = null;
  let fetching: Promise<any[]> | null = null;

  const takePayload = (res: any) => (res?.data?.data ?? res?.data ?? res) ?? [];

  async function ensure(): Promise<any[]> {
    if (cache) return cache;
    if (!fetching) {
      fetching = SafeGet("/grades", true)
        .then((res) => {
          const list = takePayload(res);
          cache = Array.isArray(list) ? list : [];
          return cache!;
        })
        .finally(() => { fetching = null; });
    }
    return fetching;
  }

  function idOf(x: any) {
    return Number(x?.id ?? x?.ID ?? x?.grade_id);
  }

  function toLabel(g: any): string {
    if (!g) return "ม.-/-";
    const year =
      g.grade_year ?? g.year ?? g.GradeYear ?? g.Grade_Year;
    const cls =
      g.grade_class ?? g.class ?? g.GradeClass ?? g.Grade_Class ?? g.room_no ?? g.RoomNo ?? g.room;
    if (!year && !cls) return "ม.-/-";
    return `ม.${year ?? "-"}${cls ? `/${cls}` : ""}`;
  }

  async function getLabelById(gradeId: number | string): Promise<string> {
    const list = await ensure();
    const gid = Number(gradeId);
    const item = list.find((it) => idOf(it) === gid);
    return toLabel(item);
  }

  return { ensure, getLabelById, toLabel };
})();

// ===== SAFE: Thai address name finder with fallback by code =====
const _thaiCache = new Map<string, string>();

const _toNum = (v: any) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

const _pickName = (row: any) =>
  row?.thai_district_name ??
  row?.district_name_th ??
  row?.name_th ??
  row?.name ??
  row?.Thai_District_Name ??
  "";

const _pickSubName = (row: any) =>
  row?.thai_subdistrict_name ??
  row?.subdistrict_name_th ??
  row?.name_th ??
  row?.name ??
  row?.Thai_Subdistrict_Name ??
  "";

const _pickZip = (row: any) =>
  String(
    row?.thai_zip_code ??
    row?.zip_code ??
    row?.zipcode ??
    row?.Thai_Zip_Code ??
    ""
  );

const _matchIdOrCode = (row: any, id: number | string) => {
  const t = _toNum(id);
  const cands = [
    row?.id, row?.ID,                   // PK
    row?.code, row?.geocode,            // code/geocode
    row?.district_id, row?.thai_district_id,
    row?.subdistrict_id, row?.thai_subdistrict_id,
    row?.DISTRICT_ID, row?.DISTRICT_CODE,
    row?.SUBDISTRICT_ID, row?.SUBDISTRICT_CODE,
  ];
  return cands.some((v) => _toNum(v) === t);
};

export const thaiAddressName_SAFE = {
  // ของเดิม keep ไว้: จังหวัดด้วย PK
  async getProvinceNameById(id?: number | string) {
    if (!id) return "";
    const cacheKey = `prov:${id}`;
    if (_thaiCache.has(cacheKey)) return _thaiCache.get(cacheKey) || "";

    const res = await SafeGet(`/thaiprovince/${id}`, true);
    const d = res?.data ?? res;
    const name =
      d?.thai_province_name ?? d?.province_name_th ?? d?.name_th ?? d?.name ?? "";
    if (name) _thaiCache.set(cacheKey, name);
    return name || "";
  },

  // ✅ ใหม่: อำเภอ รองรับทั้ง PK และ “รหัสทางการ/geocode”
  async getDistrictNameByAny(id?: number | string) {
    if (!id) return "";
    const cacheKey = `dist:${id}`;
    if (_thaiCache.has(cacheKey)) return _thaiCache.get(cacheKey) || "";

    // 1) ลองด้วย path (PK)
    let res = await SafeGet(`/thaidistrict/${id}`, true);
    let d = res?.data ?? res;
    let name = _pickName(d);
    if (name) {
      _thaiCache.set(cacheKey, name);
      return name;
    }

    // 2) ไม่เจอ -> ดึงรายการทั้งหมด แล้วหาโดย code/geocode
    res = await SafeGet(`/thaidistrict`, true);
    const list = (res?.data ?? res) as any[];
    if (Array.isArray(list)) {
      const row = list.find((r) => _matchIdOrCode(r, id));
      name = _pickName(row);
      if (name) {
        _thaiCache.set(cacheKey, name);
        return name;
      }
    }
    return "";
  },

  // ตำบล รองรับทั้ง PK/รหัส และคืน zip จากคอลัมน์ thai_zip_code
  async getSubdistrictNameAndZipByAny(id?: number | string) {
    if (!id) return { name: "", zip: "" };
    const cacheKey = `subd:${id}`;
    if (_thaiCache.has(cacheKey)) {
      const [n, z] = (_thaiCache.get(cacheKey) || "").split("|");
      return { name: n, zip: z };
    }

    // 1) ลองด้วย path (PK)
    let res = await SafeGet(`/thaisubdistrict/${id}`, true);
    let d = res?.data ?? res;
    let name = _pickSubName(d);
    let zip = _pickZip(d);
    if (name || zip) {
      _thaiCache.set(cacheKey, `${name}|${zip}`);
      return { name, zip };
    }

    // 2) ไม่เจอ -> ลิสต์ทั้งหมด แล้วค้นด้วย code/geocode
    res = await SafeGet(`/thaisubdistrict`, true);
    const list = (res?.data ?? res) as any[];
    if (Array.isArray(list)) {
      const row = list.find((r) => _matchIdOrCode(r, id));
      name = _pickSubName(row);
      zip = _pickZip(row);
      if (name || zip) {
        _thaiCache.set(cacheKey, `${name}|${zip}`);
        return { name, zip };
      }
    }
    return { name: "", zip: "" };
  },
};

// สมมติหลังบ้านมี GET /assignsubmit?student_id=&term_id=&course_id=&page_size=
export const AssignmentSubmitAPI_N = {
  list: (params: { student_id: number | string; term_id?: number | string; course_id?: number | string; page?: number; page_size?: number; }) => {
    const qs = new URLSearchParams();
    qs.set("student_id", String(params.student_id));
    if (params.term_id != null) qs.set("term_id", String(params.term_id));
    if (params.course_id != null) qs.set("course_id", String(params.course_id));
    if (params.page != null) qs.set("page", String(params.page));
    if (params.page_size != null) qs.set("page_size", String(params.page_size));
      return SafeGet(`/assignsubmit?${qs.toString()}`, true);
  },
};

export const teacherCRUD_SAFE = {
  // GET /teacher/:id   -> ได้ { id, teacher_id, t_first_name, t_last_name, ... }
  getNameById: (id: number | string) => Get(`/teacher/${id}`),

  // GET /teachers/:user_id -> ได้ entity.Teacher ของ user นั้น (เผื่อใช้ภายหลัง)
  getByUserId: (userId: number | string) => Get(`/teachers/${userId}`),

  // GET /teacher        -> รายชื่อย่อทั้งหมด (NameOnlyTeacher) (เผื่อ cache แบบทั้งก้อน)
  listCompact: () => Get(`/teacher`),
};

export const courseCRUD_SAFE = {
  // GET /course/:id  -> { data: { id, course_code, course_name, ... } }
  getById: (id: number | string) => Get(`/course/${id}`),

  // (เผื่อใช้ในอนาคต) GET /coursesall -> { data: ResultByCourseID[] }
  listAll: () => Get(`/coursesall`),
};
