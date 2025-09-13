// enums
export type TitleNameTH = "นาย" | "นางสาว" | "นาง" | "อื่นๆ";
export type TitleNameENG = "Mr." | "Ms." | "Mrs." | "Other";
export type GenderType = "Male" | "Female" | "Other";

// core
export interface Teacher {
  id: number;
  teacher_id: string;
  title_id: number;
  t_first_name: string;
  t_last_name: string;
  e_first_name?: string;
  e_last_name?: string;
  citizen_id: string;
  tel: string;
  date_of_birth: string;
  gender_id: number;
  nationality: string;
  email: string;
  religious?: string;
  qualification?: string;
  teacher_image?: string;
  qualification_image?: string;
  address_id?: number;
  address_number?: string;
  road?: string;
  thai_province_id?: number;
  thai_district_id?: number;
  thai_subdistrict_id?: number;
  thai_province_name?: string;
  thai_district_name?: string;
  thai_subdistrict_name?: string;

}


export interface LoginTeacherRequest {
  username: string;
  password: string;
}

export interface TeacherLite {
  id: number;
  teacher_id: string;
  t_first_name: string;
  t_last_name: string;
}