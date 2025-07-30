//รหัสไปรษณีย์

package entity

import (
	"gorm.io/gorm"
)
type Zipcode struct {
	gorm.Model
	Zipcode_name string

	SubdistrictID *uint
	Subdistrict   Subdistrict `gorm:"foreignKey:SubdistrictID"`

	Address Address
}