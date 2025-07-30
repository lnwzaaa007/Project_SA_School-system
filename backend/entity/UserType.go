// ผุ็ใช้งาน
package entity

import "gorm.io/gorm"

type UserType struct {
	gorm.Model
	UserType_Name string
	UserType_Prefix string
	
	Users []Users `gorm:"foreignKey:UsersID"`	
}