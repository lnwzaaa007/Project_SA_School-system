//เพศ
package entity

	import "gorm.io/gorm"

type Gender struct{
	gorm.Model
	Gender_Name string `gorm:"uniqueIndex" json:"gender_name"`

	Enrollment	Enrollment	`gorm:"foreignKey:GenderID" json:"enrollment"`

	Teacher Teacher `gorm:"foreignKey:GenderID" json:"teacher"`

	Enrollments	Enrollments	`gorm:"foreignKey:GenderID" json:"enrollments"`

}