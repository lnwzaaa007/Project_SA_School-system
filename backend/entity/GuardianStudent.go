package entity

import (
	"gorm.io/gorm"
	
)

type GuardianStudent struct {
	gorm.Model
	GuardianStdent_status string
	

	GuardianID *uint
	Guardian   Guardian `gorm:"foreignKey:GuardianID"` 

	StudentID *uint
	Student   Student `gorm:"foreignKey:StudentID"`
}