export interface ManageStudentInterface {
    StudentID?: number;
	TitleTH?:   string;
	TFirst_Name?:   string;
	TLast_Name?:    string;
	TitleENG?: string;
	EFirst_Name?: string;
	ELast_Name?:    string;
	Citizen_ID?: string;
	Tel?: string;
	DateOfBirth?: string;
	Gener?: string;
	Nationality?: string;
	Email?: string;
	Religious?: string;
	Student_image?: File | Blob | string;
}