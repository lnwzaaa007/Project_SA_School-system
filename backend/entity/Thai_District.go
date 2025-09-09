// อำเภอ

package entity

import (
	"gorm.io/gorm"
)
type Thai_District struct {
	gorm.Model
	Thai_District_ID uint `json:"id"`
	Thai_District_name string `json:"name_th"`
	
	Thai_Subdistrict []Thai_Subdistrict `gorm:"foreignKey:Thai_DistrictID" json:"thai_tambons"`

	Thai_ProvinceID uint ` json:"province_id"` 
	Thai_Province   *Thai_Province `gorm:"foreignKey:Thai_ProvinceID" json:"thai_province"`

	Address Address   `gorm:"foreignKey:Thai_District_ID" json:"address"`

}