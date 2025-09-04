import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type {
    Student,
    //  Teacher,
    SignInInterface,
    LoginStudentRequest,
    // LoginTeacherRequest,
} from "../../interfaces";
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
  getNameStudent: () => Get("/student"),
  getNameStudentById: (id: number | string) => Get(`/student/${id}`),
};

export const teacherAPI = {
  getNameTeacher: () => Get("/teacher"),
  getNameTeacherById: (id: number | string) => Get(`/teacher/${id}`),
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
  postSchedule: (data: PostSchedule) => Post(`/schedules`,data,false),
  deleteSchedule: (id: number) => Delete(`/schedules/${id}`)

};

export const userTypeAPI = {
  getUserTypes: (id: number) => Get(`/users/${id}`),
};

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
    class_in_week: number; grade_year: string; grade_class: number; teacher: string;
   }) => Post("/new-course", course),
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


