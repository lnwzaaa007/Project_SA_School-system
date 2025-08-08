package main

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("sa.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&entity.Address{}, &entity.Admin_User{}, &entity.Announcement{}, &entity.AssignmentSubmit{}, &entity.Attendances{},
				   &entity.AttendanceStatus{}, &entity.Bill{}, &entity.Course{}, &entity.District{}, &entity.EducationRecords{},
				   &entity.Enrollment{}, &entity.Grade{}, &entity.Guardian{}, &entity.GuardianStudent{}, &entity.Payment{},
				   &entity.Province{}, &entity.Schedules{}, &entity.Student{}, &entity.StudentRecords{}, &entity.Subdistrict{},
				   &entity.Subject_Group{}, &entity.Target_Group{}, &entity.Teacher{}, &entity.Term{}, &entity.Tuition{},
				   &entity.Users{}, &entity.UserType{}, &entity.Zipcode{})

	
}
