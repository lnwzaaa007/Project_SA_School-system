
// เทอม
package entity

import (
	"time"

	"gorm.io/gorm"
)

type Term struct {
	gorm.Model
	Academic_year int `gorm:"uniqueIndex:idx_year_semester" json:"academic_year"`
	Semester      int `gorm:"uniqueIndex:idx_year_semester" json:"semester"`
	Start_date    time.Time `json:"start_date"`
	End_date      time.Time `json:"end_date"`

	Course        []Course        `gorm:"foreignKey:TermID" json:"course"`
	Bill          []Bill          `gorm:"foreignKey:TermID" json:"bill"`
	Announcement  []Announcement  `gorm:"foreignKey:TermID" json:"announcement"`
}





