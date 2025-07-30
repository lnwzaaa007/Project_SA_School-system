//จังหวัด

package entity

import (
	"gorm.io/gorm"
)
type Province struct {
	gorm.Model
	Province_name string

	District []District `gorm:"foreignKey:ProvinceID"`

	Address Address
}