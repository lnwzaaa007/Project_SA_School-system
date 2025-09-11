// การสมัครสมัคร
package entity

import (
	"time"

	//"golang.org/x/tools/go/analysis/unitchecker"
	"gorm.io/gorm"
)


type Enrollments struct {
	gorm.Model
	TitleID uint `gorm:"foreignKey:TitleID" `
	TFirst_Name string 
	TLast_Name    string 
	EFirst_Name string 
	ELast_Name    string 
	Citizen_ID string 
	Tel string 
	DateOfBirth time.Time 
	
	GenderID uint `gorm:"foreignKey:GenderID" `
	Nationality string 
	Email string
	Religious string 
	Address string 
	Guardian string
	Grade_Year int
	Grade_Class int
	Transcript_of_Records string 
	Household_Registration_Certificate string 
	Copy_Citizen_ID string 
	Student_image string 

	AdminID uint 
	Admin_User   *Admin_User `gorm:"foreignKey:AdminID"`

	

	Announcement []Announcement `gorm:"foreignKey:EnrollmentsID"`
}