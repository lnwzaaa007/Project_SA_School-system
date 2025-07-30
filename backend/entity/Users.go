package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Username      string
	Password      string

	TeacherID uint
	StudentID uint

	AdminID *uint
	AdminUser   AdminUser `gorm:"foreignKey:AdminID"`

	UserTypeID *uint
	UserType   UserType `gorm:"foreignKey:UserTypeID"`
}