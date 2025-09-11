export interface GradeYearInterface {
    id?: number;
    grade_year?: string;
    grade_class?: number;
}

export interface GradeClassInterface {
    id?: number;
    grade_class?: number;
    grade_year?: GradeYearInterface;
}