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
	Submit_at 				time.Time
	Assignment_title    	string
	Assignment_file  		string
	Teacher_comment  		string
	Submit_Point 			float32
	Submit_Point_all 		float32
	Submit_status 			Submit_status

	
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