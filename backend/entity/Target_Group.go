// กลุ่มเป้าหมาย
package entity

import "gorm.io/gorm"

type Target_Group struct{
	gorm.Model
	Group_name	string

	Announcement []Announcement `gorm:"foreignKey:Group_ID"`
}