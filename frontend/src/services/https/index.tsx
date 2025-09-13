import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type {SignInInterface,} from "../../interfaces";
import type {PostSchedule} from "../../interfaces/Schedule"
import type {AttendanceInterface} from "../../interfaces/Attendance"
import { useEffect } from "react";
import type { UpdateCoursePayload } from "../../interfaces/course";
import type { AnnouncementInterface } from "../../interfaces/announcement";

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
  // requires auth to pass middleware
  postSchedule: (data: PostSchedule) => Post(`/schedules`, data, true),
  deleteSchedule: (id: number) => Delete(`/schedules/${id}`),
  getStudentSchedule: (grade_id :number) => Get(`/students/schedule?grade_id=${grade_id}`),
  getTeacherSchedule: (teacher_id : number) => Get(`/teachers/schedule?teacher_id=${teacher_id}`), 

};
//แม็ก ระบบเช็คชื่อ
export const AttendancesAPI ={
  getCourseSchedule: (grade: number,classID:number) => Get(`/attendances-course?grade=${grade}&class=${classID}`),
  getStudentByGrade: (grade: number,classID:number) => Get(`/attendances-student?grade=${grade}&class=${classID}`),
  postAttendance: (data: AttendanceInterface) => Post(`/attendances-record`,data,true),
  getAttendanceHistory: (schedule_id:number, student_id:number) => Get(`/attendances/student-history?schedule_id=${schedule_id}&student_id=${student_id}`),
  getAttendanceTeacher: (schedule_id:number) => Get(`/attendances/teacher-history?schedule_id=${schedule_id}`),
  getAttendanceByDate: (schedule_id:number, date:string) => Get(`/attendances-date?schedule_id=${schedule_id}&date=${date}`),
  updateAttendance: (data: AttendanceInterface & { date: string }) => Update(`/attendances-record`, data, true),
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
  getCourses: () => Get(`/courses`),
  getAssignments: (id:number) => Get(`/assignments/${id}`),
  getAssignmentById: (id:number) => Get(`/assignment/${id}`),
  

}

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


