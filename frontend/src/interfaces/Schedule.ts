export interface DayInterface {
  id:       number;
  thai_day: string;
}

export interface TimeStartInterface {
  id?:       number;
  period?:   string;
}

export interface TimeEndInterface {
  id?:      number;
  period?:  string;
}

export interface ScheduleCoureseInterface{
  id?:            number;
  course_code?:   string;
  course_name?:   string;
  credit_num?:    number;
  class_in_week?: number;
  hours_of_term?: number;
  subject_group?: string;
  teacher_name?:  string;
  teacher_id?:    number;
}

// export interface ScheduleInterface {
//   id_schedule?:   number;
//   day?:           string;
//   start_tinme?:   string;
//   end_time?:      string;
//   course_name?:   string;
//   course_code?:   string;
//   credit_num?:    number;
//   class_in_week?: number;
//   hours_of_term?: number;
//   subject_group?: string;
//   teacher_name?:  string;
//   grade_year?:    string;
//   grade_class?:   number;
// }

export interface PostSchedule {
  day_id?:        number;
  teacher_id?:    number;
  course_id?:     number;
  time_start_id?: number;
  time_end_id?:   number;
  term_id:        number;
  grade_year:     string;
  grade_class:    number;
}

// src/types/schedule.ts
export interface ScheduleInterface {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  credit_num: number;
  class_in_week: number;
  hours_of_term: number;
  subject_group: string;
  teacher_name: string;
  grade_year: string;
  grade_class: number;
}

// Response จาก backend
export interface TeacherScheduleResponse {
  data: ScheduleInterface[];
  term_id: number;
  semester: number;
  academic_year: number;
}
