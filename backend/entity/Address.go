//ที่อยู่
package entity

import (
	"gorm.io/gorm"
)
type Address struct {
	gorm.Model
	Address_Number  string `json:"address_number"`
	Road string `json:"road"`

	 Thai_ProvinceID uint  ` json:"thai_province_id"`// FK
	 Thai_DistrictID uint  ` json:"thai_district_id"`
	 Thai_SubdistrictID uint  ` json:"thai_subdistrict_id"`
	
	

	Teacher Teacher `gorm:"foreignKey:AddressID" json:"teacher"`

	Student Student `gorm:"foreignKey:AddressID" json:"student"`

}