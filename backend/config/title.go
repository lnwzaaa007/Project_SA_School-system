package config
import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
) 

func seedTitle(){
	db.Model(&entity.Title{}).Create([]entity.Title{
		{TitleTH : "เด็กชาย",TitleENG : "Master",},
		{TitleTH : "เด็กหญิง",TitleENG : "Miss",},
		{TitleTH : "นาย",TitleENG : "Mr.",},
		{TitleTH : "นางสาว",TitleENG : "Ms.",},
		{TitleTH : "นาง",TitleENG : "Mrs.",},
		
	})
}