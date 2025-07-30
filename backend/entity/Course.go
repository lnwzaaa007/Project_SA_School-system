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

	Schedules []Schedules `gorm:"foreignKey:CourseID"`
}