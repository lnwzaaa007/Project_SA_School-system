package entity

import (
	"gorm.io/gorm"
)
type Payment_Bill struct {
	gorm.Model
	PaymentID *uint `gorm:"references:id"`
	Payment   Payment 
	BillID    *uint `gorm:"references:id"`
	Bill      Bill 
}