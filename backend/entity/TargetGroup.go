// กลุ่มเป้าหมาย
package entity

import "gorm.io/gorm"

type TargetGroup struct{
	gorm.Model
	Group_name	string

	Announcement []Announcement `gorm:"foreignKey:TargetGroupID"`
}