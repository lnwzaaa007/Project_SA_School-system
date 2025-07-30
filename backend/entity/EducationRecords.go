//บันทึกผลการเรียน

package entity

import (
	"gorm.io/gorm"
)
type EducationRecords struct {
	gorm.Model
	Point  	int
	Mid_Point	float32
	Final_Point   	float32
	Grade_Point 		float32
	Behavior_Point 	float32

	TermID *uint
	Term   Term `gorm:"foriegnKey:TermID"`

	
	CourseID *uint
	Course   Course `gorm:"foriegnKey:CourseID"`

	
	TeacherID *uint
	Teacher Teacher `gorm:"foriegnKey:TeacherID"`

	
	StudentID *uint
	Student   Student `gorm:"foriegnKey:StudentID"`

	
	AssignmentSubmitID *uint
	AssignmentSubmit	AssignmentSubmit `gorm:"foriegnKey:AssignmentSubmitID"`
	
	StudentRecords []StudentRecords `gorm:"foreignKey:EducationRecordID"`

}
	
