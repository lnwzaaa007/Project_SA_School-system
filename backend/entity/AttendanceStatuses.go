//สถานะการเข้าเรียน

package entity

import (
	"gorm.io/gorm"
)

type AttendanceStatus struct {
	gorm.Model
	StatusName  string
	Description string

	Attendances []Attendances `gorm:"foreignKey:AttendanceStatusID"`
}