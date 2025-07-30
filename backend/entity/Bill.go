package entity

import ("time"
	"gorm.io/gorm"
)
type Bill struct {
	gorm.Model
	DateTime time.Time
}