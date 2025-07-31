package entity

import (
	"gorm.io/gorm"
)
type Admin_User struct {
	gorm.Model
	TitleTH  TitleNameTH
	TFirst_Name string
	TLast_Name    string
	TitleENG TitleNameENG
	EFirst_Name string
	ELast_Name    string
	Tel string
	Email string
	
	Users Users

	Enrollment []Enrollment `gorm:"foreignKey:AdminID"`

	Announcement []Announcement `gorm:"foreignKey:AdminID"`
}