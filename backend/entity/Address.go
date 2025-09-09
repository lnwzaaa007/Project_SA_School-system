//ที่อยู่
package entity

import (
	"gorm.io/gorm"
)
type Address struct {
	gorm.Model
	Address_Number  string `json:"address_number"`
	Road string `json:"road"`

	Thai_ProvinceID uint  `gorm:"foreignKey:Thai_ProvinceID" json:"thai_provinces_id"`// FK
	Thai_DistrictID uint  `gorm:"foreignKey:Thai_DistrictID" json:"thai_amphures_id"`
	Thai_SubdistrictID uint  `gorm:"foreignKey:Thai_SubdistrictID" json:"thai_tambons_id"`
	
	

	Teacher Teacher `gorm:"foreignKey:AddressID" json:"teacher"`

	Student Student `gorm:"foreignKey:AddressID" json:"student"`

}