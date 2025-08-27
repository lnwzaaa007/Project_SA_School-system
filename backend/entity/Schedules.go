//ตารางเรียน/สอน

package entity

import (
	"gorm.io/gorm"
	// "time"
)


type Schedules struct {
	gorm.Model
	// StartTime time.Time		`json:"start_time"`
	// EndTime time.Time		`json:"end_time"`
	// ScheduleDate time.Time		`json:"schedule_date"`
	ScheduleDate_String string	`json:"schedule_date_string"`

	Attendances []Attendances `gorm:"foreignKey:SchedulesID" json:"attendances"`
	DayID uint
	Day   *Days `gorm:"foreignKey:DayID" json:"day"`
	TeacherID uint
	Teacher   *Teacher `gorm:"foreignKey:TeacherID" json:"teacher"`
	CourseID uint
	Course     *Course `gorm:"foreignKey:CourseID" json:"course"`
	GradeID uint
	Grade     *Grade `gorm:"foreignKey:GradeID" json:"grade"`
	TermID uint
	Term     *Term `gorm:"foreignKey:TermID" json:"term"`
	TimeStartID uint
	TimeStart   *TimeStart `gorm:"foreignKey:TimeStartID" json:"time_start"`
	TimeEndID uint
	TimeEnd   *TimeEnd `gorm:"foreignKey:TimeEndID" json:"time_end"`

	

}