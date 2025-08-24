package entity

import (
	"gorm.io/gorm"
)
type Admin_User struct {
	gorm.Model
	Admin_ID 			string   	`json:"admin_id"`
	TitleTH  			TitleNameTH	`json:"title_th"`
	TFirst_Name 		string		`json:"t_first_name"`
	TLast_Name    		string		`json:"t_last_name"`
	TitleENG 			TitleNameENG`json:"title_eng"`
	EFirst_Name 		string		`json:"e_first_name"`
	ELast_Name    		string		`json:"e_last_name"`
	Tel 				string		`json:"tel"`
	Email 				string		`json:"email"`
	
	// Users Users
	UsersID uint	`json:"users_id"`
	Enrollment []Enrollment `gorm:"foreignKey:AdminID" json:"enrollment"`
	Announcement []Announcement `gorm:"foreignKey:AdminID" json:"announcement"`
}