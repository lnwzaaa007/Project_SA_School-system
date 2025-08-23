// enums
export type TitleNameTH = "นาย" | "นางสาว" | "นาง" | "อื่นๆ";
export type TitleNameENG = "Mr." | "Ms." | "Mrs." | "Other";
export type GenderType = "Male" | "Female" | "Other";

// core
export interface Student {
  id: number;                 // gorm.Model
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  studentId: string;          // Student_ID
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
  studentImage?: string | null; // แปลง []byte เป็น base64 string ฝั่ง API

  usersId: number;
  addressId?: number;
  gradeId?: number;

  grade?: Grade | null;
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
