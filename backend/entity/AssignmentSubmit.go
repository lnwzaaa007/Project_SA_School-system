//ส่งงาน

package entity

import ( "time"
	"gorm.io/gorm"
)

type Submit_status string

const (
	Success Submit_status = "ตรวจแล้ว"
	Waiting Submit_status = "รอตรวจ"
)

type AssignmentSubmit struct {
	gorm.Model
	Submit_at 				time.Time `json:"submit_at"`
	Assignment_title    	string `json:"assignment_title"`
	Assignment_file  		string `json:"assignment_file"`
	Teacher_comment  		string `json:"teacher_comment"`
	Submit_Point 			float32 `json:"submit_Point"`
	Submit_Point_all 		float32 `json:"submit_Point_all"`
	Submit_status 			Submit_status `json:"submit_status"`

	
	GradeID uint
	Grade   *Grade `gorm:"foreignKey:GradeID"`

	CourseID uint
	Course   *Course `gorm:"foreignKey:CourseID"`

	
	TeacherID uint
	Teacher *Teacher `gorm:"foreignKey:TeacherID"`

	
	StudentID uint
	Student   *Student `gorm:"foreignKey:StudentID"`

	EducationRecords []EducationRecords `gorm:"foreignKey:AssignmentSubmitID"`

}