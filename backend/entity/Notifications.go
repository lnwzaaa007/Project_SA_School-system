package entity

import "gorm.io/gorm"

type Notifications struct {
	gorm.Model
	
	AnnouncementID  uint `json:"announcement_id"`
	Announcement    *Announcement `gorm:"foreignKey:AnnouncementID" json:"announcement"`
	UsersID         uint `json:"users_id"`
	Users           *Users `gorm:"foreignKey:UsersID" json:"users"`

}
