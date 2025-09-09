//ตำบล


package entity

import (
	"gorm.io/gorm"
)
type Thai_Subdistrict struct {
	gorm.Model
	Thai_Subdistrict_ID uint ` json:"id"`
	Thai_ZipCode uint ` json:"zip_code"`
	Thai_Subdistrict_name string ` json:"name_th"`

	Thai_DistrictID uint ` json:"province_id"` 
	Thai_District   *Thai_District `gorm:"foreignKey:Thai_DistrictID" json:"thai_district"`

	

	Address Address  `gorm:"foreignKey:Thai_Subdistrict_ID" json:"address"`

}