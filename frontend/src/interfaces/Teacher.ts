// enums
export type TitleNameTH = "นาย" | "นางสาว" | "นาง" | "อื่นๆ";
export type TitleNameENG = "Mr." | "Ms." | "Mrs." | "Other";
export type GenderType = "Male" | "Female" | "Other";

// core
export interface Teacher {
  id: number;                 // gorm.Model
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  teacherId: string;          // Teacher_ID
  titleTH: TitleNameTH;
  tFirstName: string;
  tLastName: string;
  titleENG: TitleNameENG;
  eFirstName: string;
  eLastName: string;
  citizenId: string;
  tel: string;
  dateOfBirth: string;        // ISO
  gender: GenderType;
  nationality: string;
  email: string;
  religious: string;
  teacherImage?: string | null; // แปลง []byte เป็น base64 string ฝั่ง API

  usersId: number;
  addressId?: number;
  
}


export interface LoginTeacherRequest {
  username: string;
  password: string;
}
