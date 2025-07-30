package main

import (
	"github.com/lnwzaaa007/Project_SA_School-system/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("sa.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(
    &entity.Student{},
    &entity.StudentRecords{},
    &entity.EducationRecords{},
    &entity.AssignmentSubmit{},
    &entity.Grade{},
	&entity.Attendances{},
	&entity.Teacher{},
	&entity.Course{},
	&entity.Term{},
	&entity.Schedules{},
	&entity.AttendanceStatus{},
	&entity.AdminUser{},
	&entity.Users{},
	&entity.Announcement{},
	&entity.Enrollment{},
	&entity.TargetGroup{},
	&entity.Bill{},
	&entity.UserType{},
	&entity.Address{},
	&entity.District{},
	&entity.Province{},
	&entity.Subdistrict{},
	&entity.Guardian{},
	&entity.GuardianStudent{},
	&entity.Payment{},
	&entity.SubjectGroup{},
	&entity.Tuition{},
	&entity.Zipcode{},
	
    )
}
