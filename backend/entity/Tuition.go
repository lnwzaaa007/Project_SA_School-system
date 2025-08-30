package entity

import (
    "gorm.io/gorm"
)

type Tuition struct {
    gorm.Model
    Title          string `json:"title"`
    AmountTuition  int    `json:"amountTuition"`

    BillID uint
    Bill   Bill `gorm:"foreignKey:BillID;references:ID"`
}
