package entity

import (
	"gorm.io/gorm"
	"time"
)

type Guardian struct {
	gorm.Model
	G_nationID string
	G_TitleTH  TitleNameTH
	G_TFirst_Name string
	G_TLast_Name    string
	G_Tel string
	G_DateOfBirth time.Time
	G_job string
	G_status string
	

	GuardianStudent []GuardianStudent `gorm:"foreignKey:GuardianID"` 
}