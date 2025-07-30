// กลุ่มสาระ
package entity

import "gorm.io/gorm"

type SubjectGroup struct{
	gorm.Model
	SubjectGroup_Name	string

	Course []Course `gorm:"foreignKey:SubjectGroupID"`
}