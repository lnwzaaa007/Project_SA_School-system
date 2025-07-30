package entity

import ("time"
	"gorm.io/gorm"
)
type payment struct {
	gorm.Model
	silp []byte
	DateTime time.Time
	status string

	Bill []Bill `gorm:"foreignKey:paymentID"`
}