//จังหวัด

package entity

import (
	"gorm.io/gorm"
)
type Thai_Province struct {
	gorm.Model
	Thai_Province_Name string `gorm:"uniqueIndex" json:"name_th"`

	Thai_District []Thai_District `gorm:"foreignKey:ProvinceID" json:"thai_amphures"`

	Address Address `gorm:"foreignKey:Thai_Province_ID" json:"address"`

} 