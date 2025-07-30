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
	AttendanceStatus   AttendanceStatus `gorm:"foreignKey:AttendanceStatusID"`

	SchedulesID *uint
	Schedules   Schedules `gorm:"foreignKey:SchedulesID"`

	StudentID *uint
	Student   Student `gorm:"foreignKey:StudentID"`

	TeacherID *uint
	Teacher   Teacher `gorm:"foreignKey:TeacherID"`

	GradeID *uint
	Grade     Grade `gorm:"foreignKey:GradeID"`

	
}