package entity

import "gorm.io/gorm"
import "time"

type TimeStart struct {
	gorm.Model
	Period string `gorm:"uniqueIndex" json:"period" JSON:"period"`
	FullTime time.Time `gorm:"uniqueIndex" json:"full_time" JSON:"full_time"`

	Schedules []Schedules `gorm:"foreignKey:TimeStartID" json:"schedules"`
}