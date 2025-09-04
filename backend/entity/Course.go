// รายวิชา
package entity

import "gorm.io/gorm"

type Course struct {
	gorm.Model
	Course_Code   string  `gorm:"uniqueIndex" json:"course_code"`
	Course_Name   string  `gorm:"uniqueIndex" json:"course_name"`
	Credit_Num    float32 `json:"credit_num"`
	Classroom     int
	Class_in_week int `json:"class_in_week"`
	Hours_of_term int `json:"hours_of_term"`

	SubjectGroupID uint `json:"subjectGroupID"`
	Subject_Group  *Subject_Group `gorm:"foreignKey:SubjectGroupID; references:ID"`

	GradeID uint
	Grade   *Grade `gorm:"foreignKey:GradeID" json:"grade"`

	TermID uint
	Term   *Term

	TeacherID uint 		`json:teacher_id`
	Teacher   *Teacher	`gorm:"foreignKey:TeacherID" json:"teacher"`

	Schedules []Schedules `gorm:"foreignKey:CourseID"`

	AssignmentSubmit []AssignmentSubmit `gorm:"foreignKey:CourseID"`

}
