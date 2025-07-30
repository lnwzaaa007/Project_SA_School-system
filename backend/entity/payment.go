package entity

import ("time"
	"gorm.io/gorm"
)
type Payment struct {
	gorm.Model
	Silp []byte
	DateTime time.Time
	Status string

	Bill []Bill `gorm:"foreignKey:PaymentID"`
}