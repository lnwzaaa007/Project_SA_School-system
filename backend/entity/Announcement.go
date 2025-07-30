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
	
	GroupID *uint
	Target_Group Target_Group `gorm:"foreignKey:GroupID"`

	AdminID *uint
	Admin_User Admin_User `gorm:"foreignKey:AdminID"`

	TermID *uint
	Term Term `gorm:"foreignKey:TermID"`
	
}