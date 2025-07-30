package entity

import ("time"
	"gorm.io/gorm"
)
type Bill struct {
	gorm.Model
	DateTime time.Time


	TermID	*uint
	Term Term `gorm:"foriengKey:TermID"`

	StudentID *uint `json:"Student_id"`
	Student Student `gorm:"foreignKey:StudentID" json:"Student"`

	PaymentID        *uint	`json:"PaymentID"`
	Payment          Payment `gorm:"reference:PaymentID" json:"Payment"`

	TuitionID 		*uint `json:"TuitionID"`
	Tuition   		Tuition `gorm:"foreignKey:TuitionID" json:"Tuition"`

}