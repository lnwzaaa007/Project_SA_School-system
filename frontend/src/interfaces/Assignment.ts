// export interface AssignmentInterface {
//     course_id: number;
//     ID:number;
//     assignment_title: string;
//     description: string;
//     time_start: string;
//     time_end: string;
//     submit_point_all: number;
//     student_comment: string;
//     file: string;
// }
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

// export interface CreateAssignment {
//     Course_id: number;
    
// }

