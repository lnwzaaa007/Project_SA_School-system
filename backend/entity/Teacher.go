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

type Gendertype string

const (
	Male   Gendertype = "Male"
	Female  Gendertype = "Female"
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
	Gender Gendertype
	Nationality string
	Email string
	Teacher_image []byte
	Religious string
	Qualification string
	Qualification_image []byte

	AddressID uint
	UsersID uint

	Schedules []Schedules `gorm:"foreignKey:TeacherID"`


	Attendances []Attendances `gorm:"foreignKey:TeacherID"`


	Grade Grade 

	Course []Course `gorm:"foreignKey:TeacherID"`
}