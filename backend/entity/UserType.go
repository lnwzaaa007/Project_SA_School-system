// ผุ็ใช้งาน
package entity

import "gorm.io/gorm"

type UserType struct {
	gorm.Model
	UserType_Name string  `gorm:"uniqueIndex" json:"user_type_name"`
	UserType_Prefix string	`gorm:"uniqueIndex" json:"user_type_prefix"`
	
	Users []Users `gorm:"foreignKey:UserTypeID"`	
}