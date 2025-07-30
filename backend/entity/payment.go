package entity

import ("time"
	"gorm.io/gorm"
)
type Statuspayment string
const (
	Complete   Statuspayment = "ตรวจสอบแล้ว"
	Waitting  Statuspayment = "รอพิจารณา"
)

type Payment struct {
	gorm.Model
	Silp []byte
	DateTime time.Time
	Status Statuspayment

	Bill []Bill `gorm:"foreignKey:PaymentID"`
}