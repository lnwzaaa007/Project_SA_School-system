// รายวิชา
package entity

import "gorm.io/gorm"

type Course struct{
	gorm.Model
	Course_Code		string 
	Course_Name		string
	Credit_Num 		float32
	Classroom		int
	Class_in_week 	int
	Hours_of_term 	int


	ID_Subject_Group *uint
	Subject_Group Subject_Group `gorm:"foreingnKey:ID_Subject_Group"`

	Grade_ID	*uint
	Grade	Grade	`gorm:"foreignKey:Grade_ID"`

	Term_ID	*uint
	Term Term `gorm:"foriengKey:Term_ID"`

	TeacherID *uint
	Teacher Teacher `gorm:"foreignKey:TeacherID"`



	Schedules []Schedules `gorm:"foreignKey:CourseID"`

}