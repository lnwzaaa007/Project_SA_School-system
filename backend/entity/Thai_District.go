// อำเภอ

package entity

import (
	"gorm.io/gorm"
)
type Thai_District struct {
	gorm.Model
	Thai_District_ID uint `json:"id"`
	Thai_District_name string `json:"name_th"`
	
	Thai_Subdistrict []Thai_Subdistrict `gorm:"foreignKey:Thai_DistrictID;references:ID" json:"thai_tambons"`

	// FK ชี้ไปจังหวัด (อย่าลืมชื่อให้ตรงกับ foreignKey ที่ฝั่งจังหวัด)
    Thai_ProvinceID uint `json:"thai_provinces_id"`

    // (optional) back-ref ไปยังจังหวัด
    Thai_Province Thai_Province `gorm:"foreignKey:Thai_ProvinceID;references:ID"`

	Address Address   //`gorm:"foreignKey:Thai_District_ID" json:"address"`

}