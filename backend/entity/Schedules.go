//ตารางเรียน/สอน

package entity

import (
	"gorm.io/gorm"
	"time"
)

type Day string
const (
	Sunday    Day = "อาทิตย์"
	Monday    Day = "จันทร์"
	Tuesday   Day = "อังคาร"
	Wednesday Day = "พุธ"
	Thursday  Day = "พฤหัสบดี"
	Friday    Day = "ศุกร์"
	Saturday  Day = "เสาร์"
)
type Time_stast_end string
const (
	Time_08_40 Time_stast_end = "08.40"
	Time_09_30 Time_stast_end = "09.30"
	Time_10_20 Time_stast_end = "10.20"
	Time_11_10 Time_stast_end = "11.10"
	Time_12_00 Time_stast_end = "12.00"
	Time_13_00 Time_stast_end = "13.00"
	Time_13_50 Time_stast_end = "13.50"
	Time_14_40 Time_stast_end = "14.40"
	Time_15_30 Time_stast_end = "15.30"
	Time_16_30 Time_stast_end = "16.30"
)
type Schedules struct {
	gorm.Model
	StartTime time.Time		`json:"start_time"`
	EndTime time.Time		`json:"end_time"`
	ScheduleDate time.Time		`json:"schedule_date"`
	ScheduleDate_String string	`json:"schedule_date_string"`

	Attendances []Attendances `gorm:"foreignKey:SchedulesID" json:"attendances"`
	TeacherID uint
	Teacher   *Teacher `gorm:"foreignKey:TeacherID" json:"teacher"`
	CourseID uint
	Course     *Course `gorm:"foreignKey:CourseID" json:"course"`
	GradeID uint
	Grade     *Grade `gorm:"foreignKey:GradeID" json:"grade"`
	TermID uint
	Term     *Term `gorm:"foreignKey:TermID" json:"term"`

	

}