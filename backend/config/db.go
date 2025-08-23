package config

import (
	"fmt"
	"time"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	// "golang.org/x/crypto/bcrypt"
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

func mustDate(iso string) time.Time {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		panic(err)
	}
	return t
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

// 	password, _ := bcrypt.GenerateFromPassword([]byte("123456"), 14)

// 	// ✅ Insert student ได้เลย
// 	db.Model(&entity.Student{}).Create(&entity.Student{
// 		Student_ID:   "S650001",
// 		TitleTH:      entity.TitleNameTH("นาย"),
// 		TFirst_Name:  "นนทชัย",
// 		TLast_Name:   "ศิริพัฒน์",
// 		TitleENG:     entity.TitleNameENG("Mr."),
// 		EFirst_Name:  "Nonthachai",
// 		ELast_Name:   "Siriphat",
// 		Citizen_ID:   "1101700234567",
// 		Tel:          "0812345678",
// 		DateOfBirth:  mustDate("2007-03-14"),
// 		Gender:       entity.Gendertype("Male"),
// 		Nationality:  "Thai",
// 		Email:        "nonthachai.s650001@example.com",
// 		Religious:    "Buddhist",
// 		Student_image: nil,
// 		AddressID:    0,
// 		GradeID:      0,
// 		UsersID: 1,
// 	})
// 	db.Model(&entity.Student{}).Create(&entity.Student{
// 		Student_ID:   "S650002",
// 		TitleTH:      entity.TitleNameTH("นาย"),
// 		TFirst_Name:  "ธนกร",
// 		TLast_Name:   "ชินวัตร",
// 		TitleENG:     entity.TitleNameENG("Mr."),
// 		EFirst_Name:  "Thanakorn",
// 		ELast_Name:   "Chinnawat",
// 		Citizen_ID:   "1101700234575",
// 		Tel:          "0890001122",
// 		DateOfBirth:  mustDate("2007-06-09"),
// 		Gender:       entity.Gendertype("Male"),
// 		Nationality:  "Thai",
// 		Email:        "thanakorn.s650009@example.com",
// 		Religious:    "Buddhist",
// 		Student_image: nil,
// 		AddressID:    0,
// 		GradeID:      0,
// 		UsersID: 2,
// 	})
// 	// User type
// 	db.Model(&entity.UserType{}).Create(&entity.UserType{
// 		UserType_Name: "Student",
// 		UserType_Prefix: "S",
// 	})
// 	db.Model(&entity.UserType{}).Create(&entity.UserType{
// 		UserType_Name: "Teacher",
// 		UserType_Prefix: "T",
// 	})
// 	db.Model(&entity.UserType{}).Create(&entity.UserType{
// 		UserType_Name: "Admin",
// 		UserType_Prefix: "A",
// 	})
// 	// User
// 	db.Model(&entity.Users{}).Create(&entity.Users{
// 		Username: "S650001",
// 		Password: string(password),
// 		UserTypeID: 1,
// 	})
// 	db.Model(&entity.Users{}).Create(&entity.Users{
// 		Username: "S650002",
// 		Password: string(password),
// 		UserTypeID: 2,
// 	})
}
