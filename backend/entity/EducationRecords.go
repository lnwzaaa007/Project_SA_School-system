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
	Term   Term `gorm:"foreignKey:TermID"`

	
	CourseID *uint
	Course   Course `gorm:"foreignKey:CourseID"`

	
	TeacherID *uint
	Teacher Teacher `gorm:"foreignKey:TeacherID"`

	
	StudentID *uint
	Student   Student `gorm:"foreignKey:StudentID"`

	
	AssignmentSubmitID *uint
	AssignmentSubmit	AssignmentSubmit `gorm:"foreignKey:AssignmentSubmitID"`

	StudentRecords []StudentRecords `gorm:"foreignKey:EducationRecordsID"`

}
	
