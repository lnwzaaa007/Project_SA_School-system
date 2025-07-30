package entity

import ("time"
	"gorm.io/gorm"
)
type Bill struct {
	gorm.Model
	DateTime time.Time

	paymentID         uint	`json:"Payment_ID"`
	payment           payment         `gorm:"reference:ID" json:"payment"`

	TuitionID uint `json:"Tuition_id"`
	Tuition   Tuition `gorm:"foreignKey:TuitionID" json:"Tuition"`

	TermID	*uint
	Term Term `gorm:"foriengKey:TermID"`

	StudentID *uint `json:"Student_id"`
	Student Student `gorm:"foreignKey:StudentID" json:"Student"`
}