export interface EducationRecordInterface {
  id?: number;
  term_id: number;
  course_id: number;
  teacher_id: number;
  student_id: number;
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEducationRecordPayload {
  term_id: number;
  course_id: number;
  teacher_id: number;
  student_id: number;
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
}

export interface UpdateEducationRecordPayload {
  point?: number;
  mid_point?: number;
  final_point?: number;
  grade_point?: number;
  behavior_point?: number;
  teacher_id?: number;
}

export interface EducationRecordListParams {
  term_id?: number;
  course_id?: number;
  student_id?: number;
  teacher_id?: number;
  page?: number;
  page_size?: number;
}