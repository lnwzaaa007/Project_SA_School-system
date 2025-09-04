// กลุ่มเป้าหมาย
package entity

import "gorm.io/gorm"

type Target_Group struct{
	gorm.Model
	Group_name	string `json:"group_name"`

	Announcement []Announcement `gorm:"foreignKey:TargetGroupID" json:"announcement"`
}