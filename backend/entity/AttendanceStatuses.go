//สถานะการเข้าเรียน

package entity

import (
	"gorm.io/gorm"
	
)
type AttendanceStatus struct {
	gorm.Model
	AttendancesStatus_Status string
	
	Attendances []Attendances `gorm:"foreignKey:AttendancesID"`
}