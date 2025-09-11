package entity

import (
	"gorm.io/gorm"
	"time"
)

type Guardian struct {
	gorm.Model
	G_nationID string		`json:"G_nationID"`
	TitleID uint
	Title   *Title 				`gorm:"foreignKey:TitleID" json:"title_id"` 
	G_TFirst_Name string		`json:"G_firstName"`
	G_TLast_Name    string		`json:"G_lastName"`
	G_Tel string				`json:"G_tel"`
	G_DateOfBirth time.Time		`json:"G_dob"`
	G_job string				`json:"G_job"`
	G_status string				`json:"G_status"`
	

	GuardianStudent []GuardianStudent `gorm:"foreignKey:GuardianID"` 
}