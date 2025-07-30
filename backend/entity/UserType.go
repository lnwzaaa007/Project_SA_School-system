// ผุ็ใช้งาน
package entity

import "gorm.io/gorm"

type UserType struct {
	gorm.Model
	Users []Users `gorm:"foreignKey:UserTypeID"`	
}