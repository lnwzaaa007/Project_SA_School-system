//ที่อยู่
package entity

import (
	"gorm.io/gorm"
)
type Address struct {
	gorm.Model
	Address_Number  string
	Road string

	ProvinceID uint // FK
	DistrictID uint
	SubdistrictID uint
	ZipcodeID uint
	

	Teacher Teacher //ไปเป็น FK ให้ตาราง taecher

	Student Student

}