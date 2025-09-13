import type { GradeClassInterface, GradeYearInterface } from "./Grade";

//กลุ่มสาระการเรียนรู้
export interface subjectGroupInterface {
    id?:         number;
    subject_group_name?: string;
}
//รายวิชา
export interface courseInterface {
    id?:         number;
    course_name?: string;
    subject_group_id?: subjectGroupInterface;
    
    credit_num?: number;
    class_in_week?: number;
    hours_of_term?: number;
    course_code?: string;
    grade_year?: GradeYearInterface;
    grade_class?: GradeClassInterface;
    // level?: string;
    // period?: number;
    teacher?: string;
    teacher_id?: number;
    grade_id?: number;
    term_id?: number;
    
}
export interface UpdateCoursePayload {
  course_code?: string;
  course_name?: string;
  credit_num?: number;
  teacher_id?: number;
  subject_group_id?: number;
  grade_class?: string;
  grade_year?: string;
  class_in_week?: number;
    term_id?: number;
    grade_id?: number;
}

export interface CourseLite {
  id: number;
  course_code: string;
  course_name: string;
  grade_id?: number; // เผื่อไว้ถ้าอยาก filter ตามชั้น/ห้องในอนาคต
}
