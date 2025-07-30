// อำเภอ

package entity

import (
	"gorm.io/gorm"
)
type District struct {
	gorm.Model
	District_name string
	
	Subdistrict []Subdistrict `gorm:"foreignKey:SubdistrictID"`

	ProvinceID *uint
	Province   Province `gorm:"foriegnKey:ProvinceID"`

	Address Address
}