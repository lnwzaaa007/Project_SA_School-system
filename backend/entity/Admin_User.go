package entity

import (
	"gorm.io/gorm"
)
type Admin_User struct {
	gorm.Model
	TitleTH  string
	TFirst_Name string
	TLast_Name    string
	TitleENG string
	EFirst_Name string
	ELast_Name    string
	Tel string
	Email string
	Users Users

	Enrollment []Enrollment `gorm:"foreignKey:AdminID"`

	Announcement []Announcement `gorm:"foreignKey:AdminID"`
}