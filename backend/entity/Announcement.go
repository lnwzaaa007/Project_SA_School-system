//ประกาศ
package entity

import (
	"gorm.io/gorm"
	"time"
)
type Announcement struct {
	gorm.Model
	Announcement_Title  	string
	Announcement_Date 		time.Time
	Announcement_Time   	time.Time
	Announcement_Text 		string
	Announcement_Status 	string
	
}