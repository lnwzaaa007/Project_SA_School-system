//ตารางเรียน/สอน

package entity

import (
	"gorm.io/gorm"
	// "time"
)


type Schedules struct {
	gorm.Model

	Attendances []Attendances  `gorm:"foreignKey:SchedulesID" json:"attendances"`
	DayID uint	`json:"day_id"`
	Day   *Days `gorm:"foreignKey:DayID;references:ID"`
	TeacherID uint `json:"teacher_id"`
	Teacher   *Teacher `gorm:"foreignKey:TeacherID;references:ID"`
	CourseID uint `json:"course_id"`
	Course     *Course `gorm:"foreignKey:CourseID" json:"ID"`
	GradeID uint `json:"grade_id"`
	Grade     *Grade 
	TermID uint `json:"term_id"`
	Term     *Term 
	TimeStartID uint `json:"time_start_id"`
	TimeStart   *TimeStart  
	TimeEndID uint `json:"time_end_id"`
	TimeEnd   *TimeEnd 


}