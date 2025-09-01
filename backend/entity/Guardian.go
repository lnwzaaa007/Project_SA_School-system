package entity

import (
	"gorm.io/gorm"
	"time"
)

type Guardian struct {
	gorm.Model
	G_nationID string
	TitleID uint
	Title   *Title 					`gorm:"foreignKey:TitleID" json:"title_id"` 
	G_TFirst_Name string
	G_TLast_Name    string
	G_Tel string
	G_DateOfBirth time.Time
	G_job string
	G_status string
	

	GuardianStudent []GuardianStudent `gorm:"foreignKey:GuardianID"` 
}