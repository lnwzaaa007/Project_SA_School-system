package config
import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	
)
func seedTeachers(){
	db.Model(&entity.Teacher{}).Create([]entity.Teacher{
		{
			Teacher_ID:   "T540001",
			TitleTH:      entity.TitleNameTH("นาง"),
			TFirst_Name:  "สมศรี",
			TLast_Name:   "ผ่องใจ",
			TitleENG:     entity.TitleNameENG("Ms."),
			EFirst_Name:  "Somsri",
			ELast_Name:   "pongjia",
			Citizen_ID:   "1101700234567",
			Tel:          "0812345678",
			DateOfBirth:  mustDate("1986-03-20"),
			Gender:       entity.Gendertype("Female"),
			Nationality:  "Thai",
			Email:        "Somsri.T540001@example.com",
			Religious:    "Buddhist",
			Teacher_image: nil,
			Qualification: "สาขาคณิตศาสตร์",
			Qualification_image: nil,
			AddressID:    1,
			UsersID: 3,	
		},
	})
}