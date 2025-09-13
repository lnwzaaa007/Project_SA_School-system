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
	SlipPath string         `json:"slip_path"`
	DateTime time.Time `json:"dateTime"`
	Amount int `json:"amount"`
	Status Statuspayment `json:"status"`
}