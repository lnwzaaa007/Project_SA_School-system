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
    // subjectGroupID?: number;
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
// export inter