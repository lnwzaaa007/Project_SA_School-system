//ตำบล


package entity

import (
	"gorm.io/gorm"
)
type Subdistrict struct {
	gorm.Model
	Subdistrict_name string

	Zipcode []Zipcode `gorm:"foreignKey:SubdistrictID"`

	DistrictID *uint
	District   District `gorm:"foriegnKey:DistrictID"`

	Address Address
}