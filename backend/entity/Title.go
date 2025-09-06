//คำนำหน้า
package entity

import "gorm.io/gorm"

type Title struct{
	gorm.Model
	TitleTH		string `gorm:"uniqueIndex" json:"titleth"`
	TitleENG	string `gorm:"uniqueIndex" json:"titleeng"`

	Student 	[]Student 		`gorm:"foreignKey:TitleID" json:"student"`
	Teacher 	[]Teacher 		`gorm:"foreignKey:TitleID" json:"teacher"`
	Guardian	[]Guardian		`gorm:"foreignKey:TitleID" json:"guardian"`
	Admin_User	[]Admin_User	`gorm:"foreignKey:TitleID" json:"admin_user"`
	Enrollment	Enrollment	`gorm:"foreignKey:TitleID" json:"enrollment"`
}
