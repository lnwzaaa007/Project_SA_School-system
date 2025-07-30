package entity

import (
	"gorm.io/gorm"
 	"time"
)

type TitleNameTH string

const (
	MasterTH TitleNameTH = "เด็กชาย"
	MissTH TitleNameTH = "เด็กหญิง"
	MrTH   TitleNameTH = "นาย"
	MsTH  TitleNameTH = "นางสาว"
	MrsTH  TitleNameTH = "นาง"
)

type TitleNameENG string

const (
	MasterENG TitleNameENG = "Master"
	MissENG TitleNameENG = "Miss"
	MrENG   TitleNameENG = "Mr."
	MsENG  TitleNameENG = "Ms."
	MrsENG  TitleNameENG = "Mrs."
)

type Genertype string

const (
	Male   Genertype = "Male"
	Female  Genertype = "Female"
)

type Teacher struct {
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
	Teacher_image []byte
	Religious string
	Qualification string
	Qualification_image []byte

	AddressID uint
	//Address   Address `gorm:"foriegnKey:AddressID"`

	Users Users

	Schedules []Schedules `gorm:"foreignKey:SchedulesID"`

}