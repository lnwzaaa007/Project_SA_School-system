//จังหวัด

package entity

import (
	"gorm.io/gorm"
)
type Thai_Province struct {
	gorm.Model
	Thai_Province_Name string `gorm:"uniqueIndex" json:"name_th"`

    // has-many: จังหวัดหนึ่งมีหลายอำเภอ
    Thai_Districts []Thai_District `gorm:"foreignKey:Thai_ProvinceID;references:ID" json:"thai_amphures"`
	Address Address //`gorm:"foreignKey:Thai_Province_ID" json:"address"`

} 