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
	Silp []byte `json:"silp"`
	DateTime time.Time `json:"dateTime"`
	Amount int `json:"amount"`
	Status Statuspayment `json:"status"`
	
}