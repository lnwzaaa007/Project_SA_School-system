//จังหวัด

package entity

import (
	"gorm.io/gorm"
)
type Province struct {
	gorm.Model
	Province_Name string `gorm:"uniqueIndex" json:"province_name"`

	District []District `gorm:"foreignKey:ProvinceID" json:"district"`

	Address Address 
} 