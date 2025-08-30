package config

import (
	"fmt"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {
	if db == nil {
		ConnectionDB()
	}

	err := db.AutoMigrate(
		&entity.Address{}, &entity.Admin_User{}, &entity.Announcement{}, &entity.AssignmentSubmit{}, &entity.Attendances{},
		&entity.AttendanceStatus{}, &entity.Bill{}, &entity.Course{}, &entity.District{}, &entity.EducationRecords{},
		&entity.Enrollment{}, &entity.Grade{}, &entity.Guardian{}, &entity.GuardianStudent{}, &entity.Payment{},
		&entity.Province{}, &entity.Schedules{}, &entity.Student{}, &entity.StudentRecords{}, &entity.Subdistrict{},
		&entity.Subject_Group{}, &entity.Target_Group{}, &entity.Teacher{}, &entity.Term{}, &entity.Tuition{},
		&entity.Users{}, &entity.UserType{}, &entity.Zipcode{},
	)
	if err != nil {
		panic("failed to migrate database: " + err.Error())
	}
    //ฟังก์ชัน seed ข้อมูล

    seedDays()
    seedTimeStart()
    seedTimeEnd()
    seedStudent()
    seedTeachers()
    seedAdmin()
    seedUserType()
    seedGrade()
    seedTerm()
    seedUsers()
	seedProvince()
	//seeddistrict()

}