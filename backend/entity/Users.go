package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Username      string
	Password      string

	TeacherID uint
	StudentID uint
	Admin_UserID uint 

	UserTypeID *uint
	UserType   UserType `gorm:"foriegnKey:UserTypeID"`
}