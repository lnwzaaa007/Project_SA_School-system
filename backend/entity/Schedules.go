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
	
	Attendances []Attendances `gorm:"foreignKey:AttendancesID"`

	TeacherID *uint
	Teacher   Teacher `gorm:"foriegnKey:TeacherID"`
}