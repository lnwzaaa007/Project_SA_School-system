package entity

import (
	"gorm.io/gorm"
 	"time"
)
type Teacher struct {
	gorm.Model
	TitleTH  string
	TFirst_Name string
	TLast_Name    string
	TitleENG string
	EFirst_Name string
	ELast_Name    string
	Citizen_ID string
	Tel string
	DateOfBirth time.Time
	Gener string
	Nationality string
	Email string
	Teacher_image []byte
	Religious string
	Qualification string
	Qualification_image []byte
}