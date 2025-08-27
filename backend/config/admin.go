package config
import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
) 

func seedAdmin(){
	db.Model(&entity.Admin_User{}).Create([]entity.Admin_User{
		{
			Admin_ID:    "A0001",
			TitleTH:    "นาย",
			TFirst_Name: "สมชาย",
			TLast_Name:  "ใจดี",
			TitleENG:   "Mr",
			EFirst_Name: "Somchai",
			ELast_Name:  "Jaidee",
			Tel:        "0812345678",
			Email:      "somchai@example.com",
			UsersID:    4,
		},
	})
}