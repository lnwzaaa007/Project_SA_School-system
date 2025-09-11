//ผลการเรียนกับนักเรียน

package entity

import (
	"gorm.io/gorm"
)
type StudentRecords struct {
	gorm.Model
	
	StudentID uint
	Student   *Student `gorm:"foreignKey:StudentID" json:"student_id"`

	
	EducationRecordsID uint
	EducationRecords *EducationRecords `gorm:"foreignKey:EducationRecordsID" json:"eduRecord_id"`

}