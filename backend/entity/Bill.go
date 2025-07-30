package entity

import ("time"
	"gorm.io/gorm"
)
type Bill struct {
	gorm.Model
	DateTime time.Time

	paymentID         uint	`json:"payment_id"`
	payment           payment         `gorm:"reference:ID" json:"payment"`

	TuitionID uint `json:"Tuition_id"`
	Tuition   Tuition `gorm:"foreignKey:TuitionID" json:"Tuition"`
}