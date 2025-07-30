
// เทอม
package entity

import (
	"time"

	"gorm.io/gorm"
)

type Term struct{
	gorm.Model
	Academic_year 	int
	Semester 		int
	Start_date 		time.Time
	End_date 		time.Time

	Course []Course `gorm:"foreignKey:TermID"`


	Bill []Bill `gorm:"foreignKey:Term_ID"`

	Announcement []Announcement `gorm:"foreignKey:TermID"`

}




