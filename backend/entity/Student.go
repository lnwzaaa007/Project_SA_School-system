//นักเรียน

package entity

import (
	"gorm.io/gorm"
	"time"
)

type Student struct {
	gorm.Model
	TitleTH  TitleNameTH
	TFirst_Name string
	TLast_Name    string
	TitleENG TitleNameENG
	EFirst_Name string
	ELast_Name    string
	Citizen_ID string
	Tel string
	DateOfBirth time.Time
	Gener Genertype
	Nationality string
	Email string
	Religious string
	Student_image []byte
	

	Users Users

	Attendances []Attendances `gorm:"foreignKey:StudentID"`
}