package entity

import ("time"
	"gorm.io/gorm"
)
type Bill struct {
	gorm.Model
	DateTime time.Time


	TermID	uint
	Term *Term `gorm:"foreignKey:TermID"`

	StudentID uint 
	Student *Student `gorm:"foreignKey:StudentID"`

	PaymentID        uint	
	Payment          *Payment `gorm:"reference:PaymentID"`

	TuitionID 		uint 
	Tuition   		*Tuition `gorm:"foreignKey:TuitionID"`

}