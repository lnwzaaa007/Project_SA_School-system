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
	Gender Gendertype
	Nationality string
	Email string
	Religious string
	Student_image []byte
	
	Attendances []Attendances `gorm:"foreignKey:StudentID"`

	GuardianStudent []GuardianStudent `gorm:"foreignKey:StudentID"`

	StudentRecords []StudentRecords `gorm:"foreignKey:StudentID"`

	EducationRecords []EducationRecords `gorm:"foreignKey:StudentID"`

	Users []Users `gorm:"foreignKey:StudentID"`
	
	AssignmentSubmit []AssignmentSubmit `gorm:"foreignKey:StudentID"`

	Bill []Bill `gorm:"foreignKey:StudentID"`

	AddressID uint

}