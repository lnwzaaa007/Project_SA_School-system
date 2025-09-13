// การสมัครสมัคร
package entity

import (
	

	//"golang.org/x/tools/go/analysis/unitchecker"
	"gorm.io/gorm"
	"time"
	
)


type Enrollment struct {
	gorm.Model
	TitleID uint `gorm:"foreignKey:TitleID;not null" json:"title_id"`
	TFirst_Name string `gorm:"not null" json:"t_first_name"`
	TLast_Name    string `gorm:"not null" json:"t_last_name"`
	EFirst_Name string `gorm:"not null" json:"e_first_name"`
	ELast_Name    string `gorm:"not null" json:"e_last_name"`
	Citizen_ID string `gorm:"not null" json:"citizen_id"`
	Tel string `gorm:"not null" json:"tel"`
	DateOfBirth time.Time `gorm:"not null" json:"date_of_birth"`
	GenderID uint `gorm:"foreignKey:GenderID;not null" json:"gender_id"`
	Nationality string `gorm:"not null" json:"nationality"`
	Email string `gorm:"not null" json:"email"`
	Age int `json:"age"`
	Religious *string ` json:"religious"`
	Address string `gorm:"not null" json:"address"`
	Guardian string `gorm:"not null" json:"guardian"`
	Grade_Year int `gorm:"not null" json:"grade_year"`
	Grade_Class int `gorm:"not null" json:"grade_class"`
	Transcript_of_Records string ` json:"transcript_of_records"`
	Household_Registration_Certificate string ` json:"household_registration_certificate"`
	Copy_Citizen_ID string ` json:"copy_citizen_id"`
	Student_image string ` json:"student_image"`
	Status string ` json:"status"`

	AdminID uint `json:"admin_id"`
	Admin_User   *Admin_User `gorm:"foreignKey:AdminID"`

	

	Announcement []Announcement `gorm:"foreignKey:EnrollmentID"`
}