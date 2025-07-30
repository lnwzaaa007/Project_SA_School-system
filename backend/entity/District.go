// อำเภอ

package entity

import (
	"gorm.io/gorm"
)
type District struct {
	gorm.Model
	District_name string
	
	Subdistrict []Subdistrict `gorm:"foreignKey:DistrictID"`

	ProvinceID uint
	Province   *Province `gorm:"foreignKey:ProvinceID"`

	Address Address 
}