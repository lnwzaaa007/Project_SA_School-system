//การเข้าเรียน
package entity

import (
	"gorm.io/gorm"
	"time"
)
type Attendances struct {
	gorm.Model
	Attendances_Date time.Time
	Note string
	
	AttendanceStatusID *uint
	AttendanceStatus   AttendanceStatus `gorm:"foriegnKey:AttendanceStatusID"`

	SchedulesID *uint
	Schedules   Schedules `gorm:"foriegnKey:SchedulesID"`

	StudentID *uint
	Student   Student `gorm:"foriegnKey:StudentID"`

	TeacherID *uint
	Teacher   Teacher `gorm:"foriegnKey:TeacherID"`

	
}