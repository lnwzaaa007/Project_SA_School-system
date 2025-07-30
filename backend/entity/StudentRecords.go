//ผลการเรียนกับนักเรียน

package entity

import (
	"gorm.io/gorm"
)
type StudentRecords struct {
	gorm.Model
	
	StudentID *uint
	Student   Student `gorm:"foriegnKey:StudentID"`

	
	EducationRecordsID *uint
	EducationRecords EducationRecords `gorm:"foriegnKey:EducationRecordsID"`

}