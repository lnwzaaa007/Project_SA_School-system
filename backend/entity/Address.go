//ที่อยู่
package entity

import (
	"gorm.io/gorm"
)
type Address struct {
	gorm.Model
	Address_Number  string
	Road string
	
}