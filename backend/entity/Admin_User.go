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

	Enrollment []Enrollment `gorm:"foreignKey:EnrollmentID"`

	Users Users

	Announcement []Announcement `gorm:"foreignKey:Admin_ID"`
}