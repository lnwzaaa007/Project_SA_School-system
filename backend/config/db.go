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
func mustTimeOnly(timeStr string) time.Time {
	t, err := time.Parse("15:04:05", timeStr)
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

//     // User type
//         db.Model(&entity.UserType{}).Create(&entity.UserType{
//             UserType_Name: "Student",
//             UserType_Prefix: "S",
//         })
//         db.Model(&entity.UserType{}).Create(&entity.UserType{
//             UserType_Name: "Teacher",
//             UserType_Prefix: "T",
//         })
//         db.Model(&entity.UserType{}).Create(&entity.UserType{
//             UserType_Name: "Admin",
//             UserType_Prefix: "A",
//         })
//     // ✅ Insert student ได้เลย
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
// // User
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
//     // teacher
//     db.Model(&entity.Teacher{}).Create(&entity.Teacher{
// 		Teacher_ID:   "T540001",
// 		TitleTH:      entity.TitleNameTH("นาง"),
// 		TFirst_Name:  "สมศรี",
// 		TLast_Name:   "ผ่องใจ",
// 		TitleENG:     entity.TitleNameENG("Ms."),
// 		EFirst_Name:  "Somsri",
// 		ELast_Name:   "pongjia",
// 		Citizen_ID:   "1101700234567",
// 		Tel:          "0812345678",
// 		DateOfBirth:  mustDate("1986-03-20"),
// 		Gender:       entity.Gendertype("Female"),
// 		Nationality:  "Thai",
// 		Email:        "Somsri.T540001@example.com",
// 		Religious:    "Buddhist",
// 		Teacher_image: nil,
// 		Qualification: "สาขาคณิตศาสตร์",
// 		Qualification_image: nil,
// 		AddressID:    1,
// 		UsersID: 3,
// 	})
// 	db.Model(&entity.Users{}).Create(&entity.Users{
// 		Username: "T540001",
// 		Password: string(password),
// 		UserTypeID: 2,
// 	})
//     // admin
//     db.Model(&entity.Admin_User{}).Create(&entity.Admin_User{
//         Admin_ID:    "A0001",
//         TitleTH:    "นาย",
//         TFirst_Name: "สมชาย",
//         TLast_Name:  "ใจดี",
//         TitleENG:   "Mr",
//         EFirst_Name: "Somchai",
//         ELast_Name:  "Jaidee",
//         Tel:        "0812345678",
//         Email:      "somchai@example.com",
//         UsersID:    4,
// 	})
    
//      db.Model(&entity.Users{}).Create(&entity.Users{
//     	Username: "A0001",
// 		Password: string(password),
// 		UserTypeID: 3,
// 	})
//     // grade
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 1",		
// 		Grade_Class	: 1,
// 		TeacherID :nil ,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 1",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 1",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 2",		
// 		Grade_Class	: 1,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 2",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 2",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 3",		
// 		Grade_Class	: 1,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 3",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 3",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 4",		
// 		Grade_Class	: 1,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 4",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 4",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 5",		
// 		Grade_Class	: 1,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 5",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 5",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 6",		
// 		Grade_Class	: 1,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 6",		
// 		Grade_Class	: 2,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     db.Model(&entity.Grade{}).Create(&entity.Grade{
// 		Grade_Year: "มัธยมศึกษาปีที่ 6",		
// 		Grade_Class	: 3,
// 		TeacherID : nil,	
// 		Course 	: nil,	
// 		Student: nil,
//     })
//     // term
//     db.Model(&entity.Term{}).Create(&entity.Term{
// 		Academic_year: 2566,
//         Semester:      1,
//         Start_date:    time.Date(2023, 5, 15, 0, 0, 0, 0, time.Local),
//         End_date:      time.Date(2023, 9, 30, 0, 0, 0, 0, time.Local),
//     })
//     db.Model(&entity.Term{}).Create(&entity.Term{
// 		Academic_year: 2566,
//         Semester:      2,
//         Start_date:    time.Date(2023, 11, 1, 0, 0, 0, 0, time.Local),
//         End_date:      time.Date(2024, 3, 31, 0, 0, 0, 0, time.Local),
//     })
//     db.Model(&entity.Term{}).Create(&entity.Term{
// 		Academic_year: 2567,
//         Semester:      1,
//         Start_date:    time.Date(2024, 5, 15, 0, 0, 0, 0, time.Local),
//         End_date:      time.Date(2024, 9, 30, 0, 0, 0, 0, time.Local),
//     })
//     db.Model(&entity.Term{}).Create(&entity.Term{
// 		Academic_year: 2567,
//         Semester:      2,
//         Start_date:    time.Date(2024, 11, 1, 0, 0, 0, 0, time.Local),
//         End_date:      time.Date(2025, 3, 31, 0, 0, 0, 0, time.Local),
//     })

    //days
    // db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "จันทร์",
    //     EngDay: "Monday",
    //     Schedules: nil,
    // })
    // db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "อังคาร",
    //     EngDay: "Tuesday",
    //     Schedules: nil,
    // })
    //  db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "พุธ",
    //     EngDay: "Wednesday",
    //     Schedules: nil,
    // })
    // db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "พฤหัสบดี",
    //     EngDay: "Thursday",
    //     Schedules: nil,
    // })
    //  db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "ศุกร์",
    //     EngDay: "Friday",
    //     Schedules: nil,
    // })
    // db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "เสาร์",
    //     EngDay: "Saturday",
    //     Schedules: nil,
    // }) 
    // db.Model(&entity.Days{}).Create(&entity.Days{
	// 	ThaiDay: "อาทิตย์",
    //     EngDay: "Sunday",
    //     Schedules: nil,
    // })
    // TimeStart
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "08:40",
    //     FullTime: mustTimeOnly("08:40:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "09:30",
    //     FullTime: mustTimeOnly("09:30:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "10:20",
    //     FullTime: mustTimeOnly("10:20:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "11:10",
    //     FullTime: mustTimeOnly("11:10:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "12:00",
    //     FullTime: mustTimeOnly("12:00:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "13:00",
    //     FullTime: mustTimeOnly("13:00:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "13:50",
    //     FullTime: mustTimeOnly("13:50:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "14:40",
    //     FullTime: mustTimeOnly("14:40:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "15:30",
    //     FullTime: mustTimeOnly("15:30:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeStart{}).Create(&entity.TimeStart{
    //     Period: "16:30",
    //     FullTime: mustTimeOnly("16:30:00"),
    //     Schedules: nil,
    // })
    // // TimeEnd
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "08:40",
    //     FullTime: mustTimeOnly("08:40:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "09:30",
    //     FullTime: mustTimeOnly("09:30:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "10:20",
    //     FullTime: mustTimeOnly("10:20:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "11:10",
    //     FullTime: mustTimeOnly("11:10:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "12:00",
    //     FullTime: mustTimeOnly("12:00:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "13:00",
    //     FullTime: mustTimeOnly("13:00:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "13:50",
    //     FullTime: mustTimeOnly("13:50:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "14:40",
    //     FullTime: mustTimeOnly("14:40:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "15:30",
    //     FullTime: mustTimeOnly("15:30:00"),
    //     Schedules: nil,
    // })
    // db.Model(&entity.TimeEnd{}).Create(&entity.TimeEnd{
    //     Period: "16:30",
    //     FullTime: mustTimeOnly("16:30:00"),
    //     Schedules: nil,
    // })
}