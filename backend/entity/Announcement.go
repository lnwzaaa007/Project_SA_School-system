//ประกาศ
package entity

import (
	"gorm.io/gorm"
	"time"
)
type StatusAnnouncement string
const (
		Publish StatusAnnouncement = "เผยแพร่แล้ว"
		Draft	StatusAnnouncement = "ฉบับร่าง"
)
type Announcement struct {
	gorm.Model
	Title  			string
	Create_Date 	time.Time
	Create_Time  	time.Time
	Content 		string
	Status 			StatusAnnouncement
	
	TargetGroupID uint
	Target_Group *Target_Group `gorm:"foreignKey:TargetGroupID"`

	AdminID uint
	Admin_User *Admin_User `gorm:"foreignKey:AdminID"`

	TermID uint
	Term *Term `gorm:"foreignKey:TermID"`

	EnrollmentID uint
	Enrollment *Enrollment `gorm:"foreignKey:EnrollmentID"`
}