//การเข้าเรียน
package entity

import (
	"gorm.io/gorm"
	"time"
)
type Attendances struct {
	gorm.Model
	Attendances_Date time.Time
	Note string
	
}