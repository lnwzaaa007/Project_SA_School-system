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
	Title  			string 				`json:"title"`
	Create_Date 	time.Time			`json:"create_date"`
	End_Date 		time.Time			`json:"end_date"`
	TimeCreate		string				`json:"time_create"`
	Content 		string				`json:"content"`
	Category        string				`json:"category"`
	Status 			StatusAnnouncement	`gorm:"default:'ฉบับร่าง'" json:"status"`
	
	TargetGroupID uint
	Target_Group *Target_Group `gorm:"foreignKey:TargetGroupID" json:"target_group"`

	AdminID uint
	Admin_User *Admin_User `gorm:"foreignKey:AdminID"`

	TermID uint
	Term *Term `gorm:"foreignKey:TermID"`

	EnrollmentID uint
	Enrollment *Enrollment `gorm:"foreignKey:EnrollmentID" json:"enrollment"`

	EnrollmentsID uint
	Enrollments *Enrollments `gorm:"foreignKey:EnrollmentsID" json:"enrollments"`
	Users []Users `gorm:"many2many:notifications" json:"users"` // many to many กับ Users ผ่านตาราง Notifications
}
func ParseTime(timeStr string) time.Time {
	layout := "15:04"
	t, err := time.Parse(layout, timeStr)
	// return time.Now()
	// parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		// ถ้าแปลงไม่ได้ ให้ใช้เวลาปัจจุบัน
		return time.Now()
	}
	return t
}
func ParseDate(dateStr string) time.Time {
	layout := "2006-01-02"
	parsedDate, err := time.Parse(layout, dateStr)
	if err != nil {
		return time.Time{}
	}
	return parsedDate
}