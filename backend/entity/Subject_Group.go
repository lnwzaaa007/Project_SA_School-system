// กลุ่มสาระ
package entity

import "gorm.io/gorm"

type Subject_Group struct{
	gorm.Model
	SubjectGroup_Name	string `gorm:"uniqueIndex"`

	Course []Course `gorm:"foreignKey:SubjectGroupID"`
}