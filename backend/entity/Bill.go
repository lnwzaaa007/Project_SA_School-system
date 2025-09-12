package entity

import (
	"time"
	"gorm.io/gorm"
)

type StatusBill string

const (
	Pending StatusBill = "รอดำเนินการ"
	Paid    StatusBill = "ชำระแล้ว"
)

type Bill struct {
	gorm.Model

	DateTime   time.Time  `json:"dateTime"`
	StatusBill StatusBill `json:"statusBill"`

	TermID   uint
	Term     *Term

	StudentID uint
	Student   *Student

	// Payment_Bill_ID uint
	// Payment_Bill    *Payment_Bill

	TuitionID uint
	Tuition   *Tuition
}
