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
	
	Group_ID *uint
	Target_Group Target_Group `gorm:"foreignKey:Group_ID"`

	Admin_ID *uint
	Admin_User Admin_User `gorm:"foreignKey:Admin_ID"`

	Term_ID *uint
	Term Term `gorm:"foreignKey:Term_ID"`
	
}