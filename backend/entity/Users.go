package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Username string `gorm:"uniqueIndex" json:"username"`
	Password string	`json:"password"`
	
	Teacher Teacher
	Student Student
	Admin_User Admin_User

	UserTypeID uint
	UserType   *UserType `gorm:"foreignKey:UserTypeID"`
}