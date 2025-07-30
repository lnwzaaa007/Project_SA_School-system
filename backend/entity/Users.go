package entity

import "gorm.io/gorm"

type Users struct {
	gorm.Model
	Username      string
	Password      string
}