//ส่งงาน

package entity

import ( "time"
	"gorm.io/gorm"
)

type Submit_status string

const (
	Success Submit_status = "ตรวจแล้ว"
	Waiting Submit_status = "รอตรวจ"
	NotSubmitted Submit_status = "ยังไม่ส่งงาน"
	Submitted Submit_status = "ส่งงานแล้ว"
)

type AssignmentSubmit struct {
	gorm.Model
	Submit_at 				time.Time `json:"submit_at"`
	Assignment_title    	string `json:"assignment_title"`
	Description 			string `json:"description"`
	TimeStart  			time.Time `json:"time_start"`
	TimeEnd 				time.Time `json:"time_end"`	
	Assignment_file  		string `json:"assignment_file"`
	Student_comment  		string `json:"student_comment"`
	Submit_Point 			float32 `json:"submit_Point"`
	Submit_Point_all 		float32 `json:"submit_Point_all"`
	Submit_status 			Submit_status `json:"submit_status"`
	CourseID         uint      `json:"course_id"` 

	
	GradeID uint
	Grade   *Grade `gorm:"foreignKey:GradeID"`

	// CourseID uint
	Course   *Course `gorm:"foreignKey:CourseID"`

	
	TeacherID uint
	Teacher *Teacher `gorm:"foreignKey:TeacherID"`

	TermID uint
	Term   *Term `gorm:"foreignKey:TermID"`
	
	StudentID uint
	Student   *Student `gorm:"foreignKey:StudentID"`

	EducationRecords []EducationRecords `gorm:"foreignKey:AssignmentSubmitID"`

}