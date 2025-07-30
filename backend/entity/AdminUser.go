package entity

import (
	"gorm.io/gorm"
)
type AdminUser struct {
	gorm.Model
	TitleTH  string
	TFirst_Name string
	TLast_Name    string
	TitleENG string
	EFirst_Name string
	ELast_Name    string
	Tel string
	Email string
	
	
	Enrollment []Enrollment `gorm:"foreignKey:AdminID"`
	Users []Users `gorm:"foreignKey:AdminID"`
	Announcement []Announcement `gorm:"foreignKey:AdminID"`
}