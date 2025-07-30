//การสมัครสมัคร
package entity

import (
	"gorm.io/gorm"
	"time"
)


type Enrollment struct {
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
	Religious string
	Address string
	Guardian string
	Grade_ID int
	Transcript_of_Records []byte
	Household_Registration_Certificate []byte
	Copy_Citizen_ID []byte
	Student_image []byte

	AdminID uint
	Admin_User   *Admin_User `gorm:"foreignKey:AdminID"`

	Announcement []Announcement `gorm:"foreignKey:EnrollmentID"`
}