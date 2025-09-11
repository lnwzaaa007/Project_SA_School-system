
export interface AssignmentInterface {
    ID: number;
    course_id: number;
    
    assignment_title: string;
    description: string;
    time_start: string;
    time_end: string;
    assignment_file: string; // ตรงกับ backend
    submit_point_all: number;
    student_comment: string;
    submit_status: string;
}

export interface AssignmentFormData {
    title?: string;
  status: string;
  description: string;
  openDate: string;
  closeDate: string;
  file: File | null;
  feedback: string;
}


