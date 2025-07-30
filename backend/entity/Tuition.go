package entity

import (
	"gorm.io/gorm"
)
type Tuition struct {
	gorm.Model
	Amount int
}