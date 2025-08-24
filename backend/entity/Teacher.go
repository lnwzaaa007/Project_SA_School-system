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
	Teacher_ID 				string		`json:"teacher_id"`
	TitleTH  				TitleNameTH    `json:"title_th"`
	TFirst_Name 			string      `json:"tfirst_name"`
	TLast_Name    			string    `json:"tlast_name"`
	TitleENG 				TitleNameENG 	`json:"title_eng"`
	EFirst_Name 			string `json:"efirst_name"`
	ELast_Name    			string `json:"elast_name"`
	Citizen_ID 				string `json:"citizen_id"`
	Tel 					string `json:"tel"`
	DateOfBirth 			time.Time `json:"dateofbirth"`
	Gender 					Gendertype `json:"gender"`
	Nationality 			string `json:"nationality"`
	Email 					string `json:"email"`
	Teacher_image 			[]byte `json:"teacher_image"`
	Religious 				string `json:"religious"`
	Qualification 			string `json:"qualification"`
	Qualification_image 	[]byte `json:"qualification_image"`

	AddressID 				uint `json:"address_id" `
	UsersID 				uint `json:"users_id"`
	Schedules 				[]Schedules `gorm:"foreignKey:TeacherID" json:"schedules"`
	Attendances 			[]Attendances `gorm:"foreignKey:TeacherID" json:"attendances"`
	Grade 					Grade 
	Course 					[]Course `gorm:"foreignKey:TeacherID" json:"course"`
}