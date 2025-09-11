//บันทึกผลการเรียน

package entity

import (
	"gorm.io/gorm"
)
type EducationRecords struct {
	gorm.Model
	Point  			int			`json:"point_edu"`	
	Mid_Point		float32		`json:"MidPoint_edu"`
	Final_Point   	float32		`json:"FiPoint_edu"`
	Grade_Point 	float32		`json:"GPA_edu"`
	Behavior_Point 	float32		`json:"BehaviorP_edu"`

	TermID uint
	Term   *Term 		`gorm:"foreignKey:TermID" json:"term_id"`

	
	CourseID uint
	Course   *Course 	`gorm:"foreignKey:CourseID" json:"course_id"` 

	
	TeacherID uint
	Teacher *Teacher 	`gorm:"foreignKey:TeacherID" json:"teacher_id"`

	
	StudentID uint
	Student   *Student 	`gorm:"foreignKey:StudentID" json:"student_id"`

	
	AssignmentSubmitID uint
	AssignmentSubmit	*AssignmentSubmit 		`gorm:"foreignKey:AssignmentSubmitID" json:"assign_id"`
	
	StudentRecords []StudentRecords 			`gorm:"foreignKey:EducationRecordsID" json:"studentRecord_id"`

}
	
