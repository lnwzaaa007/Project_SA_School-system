package entity

import "gorm.io/gorm"
// วันเรียน
type Days struct {
	gorm.Model
	ThaiDay string `gorm:"uniqueIndex" json:"thai_tay"`
	EngDay string `gorm:"uniqueIndex" json:"eng_day"`

	Schedules []Schedules `gorm:"foreignKey:DayID"`
}