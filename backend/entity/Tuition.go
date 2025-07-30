package entity

import (
	"gorm.io/gorm"
)
type Tuition struct {
	gorm.Model
	Amount int

	Bill []Bill `gorm:"foreignKey:TuitionID"`
}