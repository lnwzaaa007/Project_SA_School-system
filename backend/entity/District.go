// อำเภอ

package entity

import (
	"gorm.io/gorm"
)
type District struct {
	gorm.Model
	District_name string `json:"district_name"`
	
	Subdistrict []Subdistrict `gorm:"foreignKey:DistrictID" json:"subdistrict"`

	ProvinceID uint ` json:"province_id"` 
	Province   *Province `gorm:"foreignKey:ProvinceID" json:"province"`

	Address Address  
}