package config

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/gorm"
)

func seedTargetGroup(db *gorm.DB) {

	// db.Model(&entity.Target_Group{}).Create([]entity.Target_Group{
	targetGroup := []entity.Target_Group{
		{Model: gorm.Model{ID: 1}, Group_name: "นักเรียน"},
		{Model: gorm.Model{ID: 2}, Group_name: "ครูและบุคลากร"},
		{Model: gorm.Model{ID: 3}, Group_name: "ผู้ปกครอง"},
		{Model: gorm.Model{ID: 4}, Group_name: "ทุกคน"},
		{Model: gorm.Model{ID: 5}, Group_name: "บุคคลทั่วไป"},
	}
	for _, tg := range targetGroup {
		var existing entity.Target_Group
		if err := db.Where("id = ?", tg.ID).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&tg).Error; err != nil {
					panic("failed to seed Target_Group: " + err.Error())
				}
			}else{
				// db.Model(&entity.Target_Group{}).Where("id = ?", tg.ID).Updates(tg)
				panic("failed to query Target_Group: " + err.Error())
			}
		}else{
			if err := db.Model(&entity.Target_Group{}).Where("id = ?", tg.ID).Updates(tg).Error; err != nil {
				panic("failed to update Target_Group: " + err.Error())
		}
	}
	// })
	}
}
