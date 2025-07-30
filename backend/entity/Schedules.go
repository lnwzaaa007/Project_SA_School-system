//ตารางเรียน/สอน

package entity

import (
	"gorm.io/gorm"
	"time"
)
type Schedules struct {
	gorm.Model
	StartTime time.Time
	EndTime time.Time
	ScheduleDate time.Time
	
	Attendances []Attendances `gorm:"foreignKey:SchedulesID"`

	TeacherID *uint
	Teacher   Teacher `gorm:"foriegnKey:TeacherID"`

	CourseID *uint
	Course     Course `gorm:"foriegnKey:CourseID"`

	GradeID *uint
	Grade     Grade `gorm:"foriegnKey:GradeID"`

	TermID *uint
	Term     Term `gorm:"foriegnKey:TermID"`

	

}