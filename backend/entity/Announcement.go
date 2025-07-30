//ประกาศ
package entity

import (
	"gorm.io/gorm"
	"time"
)
type Announcement struct {
	gorm.Model
	Title  			string
	Create_Date 	time.Time
	Create_Time  	time.Time
	Content 		string
	Status 			string
	
	TargetGroupID *uint
    TargetGroup   TargetGroup `gorm:"foreignKey:TargetGroupID"`

	AdminID *uint
	AdminUser   AdminUser `gorm:"foreignKey:AdminID"`

	TermID *uint
	Term   Term `gorm:"foreignKey:TermID"`

	EnrollmentID *uint
	Enrollment   Enrollment `gorm:"foreignKey:EnrollmentID"`

}