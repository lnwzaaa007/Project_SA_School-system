// ชั้นปี
package entity

import "gorm.io/gorm"

type Grade struct{
	gorm.Model
	Grade_Year	string
	Grade_Class	int

	TeacherID uint //FK

	Course []Course `gorm:"foreignKey:GradeID"`
}