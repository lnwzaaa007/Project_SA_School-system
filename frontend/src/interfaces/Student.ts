// enums
export type TitleNameTH = "นาย" | "นางสาว" | "นาง" | "อื่นๆ";
export type TitleNameENG = "Mr." | "Ms." | "Mrs." | "Other";
export type GenderType = "Male" | "Female" | "Other";

// core
export interface StudentInterface {
  id: number,
  student_id: string,
  TitleID: number,
  title_id: null,
  t_first_name: string,
  t_last_name: string,
  e_first_name: string,
  e_last_name: string,
  citizen_id: string,
  tel: string,
  date_of_birth: string,
  gender: string,
  nationality: string,
  email: string,
  religious: string,
  student_image: null,
  attendances: null,
  guardian_student: null,
  student_records: null,
  education_records: null,
  assignment_submit: null,
  bill: null,
  users_id: 1,
  address_id: 0,
  grade_id: 1,
  grade: null
}

export interface Grade {
  id: number;
  name: string;           // เช่น ม.4/1 หรือ Year 1
  level?: string;         // optional
}

export interface LoginStudentRequest {
  username: string;
  password: string;
}
