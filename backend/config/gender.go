package config
import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
) 

func seedGender(){
	db.Model(&entity.Gender{}).Create([]entity.Gender{
		{
			Gender_Name : "ชาย",
		},
		{
			Gender_Name : "หญิง",
		},
	})
}