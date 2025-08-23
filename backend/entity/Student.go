//นักเรียน

package entity

import (
	"gorm.io/gorm"
	"time"
)

type Student struct {
	gorm.Model
	Student_ID 		string			`json:"student_id"`
	TitleTH  		TitleNameTH		`json:"title_th"`
	TFirst_Name 	string			`json:"t_first_name"`
	TLast_Name    	string			`json:"t_last_name"`
	TitleENG 		TitleNameENG	`json:"title_eng"`
	EFirst_Name 	string			`json:"e_first_name"`
	ELast_Name    	string			`json:"e_last_name"`
	Citizen_ID 		string			`json:"citizen_id"`
	Tel 			string			`json:"tel"`
	DateOfBirth 	time.Time		`json:"date_of_birth"`
	Gender 			Gendertype		`json:"gender"`
	Nationality 	string			`json:"nationality"`
	Email 			string			`json:"email"`
	Religious 		string			`json:"religious"`
	Student_image 	[]byte			`json:"student_image"`
	
	Attendances []Attendances `gorm:"foreignKey:StudentID" json:"attendances"`
	GuardianStudent []GuardianStudent `gorm:"foreignKey:StudentID" json:"guardian_student"`
	StudentRecords []StudentRecords `gorm:"foreignKey:StudentID" json:"student_records"`
	EducationRecords []EducationRecords `gorm:"foreignKey:StudentID" json:"education_records"`
	AssignmentSubmit []AssignmentSubmit `gorm:"foreignKey:StudentID" json:"assignment_submit"`
	Bill []Bill `gorm:"foreignKey:StudentID" json:"bill"`

	UsersID uint 	`json:"users_id"`
	AddressID uint	`json:"address_id"`
	GradeID uint	`json:"grade_id"`
	Grade *Grade `gorm:"foreignKey:GradeID" json:"grade"`
}