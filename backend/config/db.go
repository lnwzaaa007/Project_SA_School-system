package config

import (
	"fmt"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB { return db }

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

    // --- เคลียร์คอลัมน์เก่าๆ ตามโค้ดเดิมของคุณ ---
    if db.Migrator().HasColumn(&entity.Tuition{}, "bill_id") {
        _ = db.Migrator().DropColumn(&entity.Tuition{}, "bill_id")
    }
    if db.Migrator().HasColumn(&entity.Bill{}, "payment_bill_id") {
        _ = db.Migrator().DropColumn(&entity.Bill{}, "payment_bill_id")
    }

    // --- AutoMigrate รอบใหญ่ (เหมือนที่คุณทำ) ---
    if err := db.AutoMigrate(
        &entity.Address{}, &entity.Admin_User{}, &entity.Announcement{},
        &entity.AssignmentSubmit{}, &entity.Attendances{}, &entity.AttendanceStatus{},
        &entity.Course{}, &entity.District{}, &entity.EducationRecords{},
        &entity.Enrollment{}, &entity.Grade{}, &entity.Guardian{}, &entity.GuardianStudent{},
        &entity.Province{}, &entity.Schedules{}, &entity.Student{}, &entity.StudentRecords{},
        &entity.Subdistrict{}, &entity.Subject_Group{}, &entity.Target_Group{}, &entity.Teacher{},
        &entity.Term{},
        &entity.Tuition{},
        &entity.Payment{},
        &entity.Bill{},
        &entity.Payment_Bill{},
        &entity.Users{}, &entity.UserType{}, &entity.Zipcode{}, &entity.Notifications{}, &entity.Title{},
    ); err != nil {
        panic("failed to migrate database: " + err.Error())
    }

    // --------- 🔧 ซ่อม unique เดี่ยวบน tuitions.grade_year (ครั้งเดียว) ---------
    // พยายามดรอปชื่อ index ที่เป็นไปได้ (บางทีชื่อไม่ตรง, ขึ้นกับเวอร์ชันก่อนหน้า)
    // ถ้าไม่พบก็ไม่เป็นไร (ignore error)
    _ = db.Migrator().DropIndex(&entity.Tuition{}, "idx_grade_year")          // เผื่อเคยตั้งชื่อนี้
    _ = db.Migrator().DropIndex(&entity.Tuition{}, "tuitions_grade_year")     // เผื่อ GORM ตั้งให้
    _ = db.Migrator().DropIndex(&entity.Tuition{}, "uix_tuitions_grade_year") // เผื่อแบบอื่น
    _ = db.Migrator().DropIndex(&entity.Tuition{}, "grade_year")              // ดรอปโดยอ้างชื่อคอลัมน์

    // ให้ GORM สร้าง composite unique (grade_year + term_id) ตามแท็กใหม่
    _ = db.AutoMigrate(&entity.Tuition{})

    // 🛟 ถ้าโปรเจกต์ dev แล้วยังชนอยู่ (SQLite บางกรณีเป็น table-level unique ดรอปไม่ได้)
    // ให้ใช้ hard reset ตาราง tuition (จะลบข้อมูล tuition ทั้งหมด):
    // _ = db.Migrator().DropTable(&entity.Tuition{})
    // _ = db.AutoMigrate(&entity.Tuition{})

    // --- Seeds อื่น ๆ ของคุณ (ตามเดิม) ---
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
    seedSubjectGroup()
    seedTargetGroup(db)
}


// func SetupDatabase() {
// 	if db == nil {
// 		ConnectionDB()
// 	}

// 	// ===== Cleanup columns จากสคีมาเก่า (ครั้งเดียวถ้ามี) =====
// 	// tuition.bill_id ไม่ใช้แล้ว (normalize)
// 	if db.Migrator().HasColumn(&entity.Tuition{}, "bill_id") {
// 		_ = db.Migrator().DropColumn(&entity.Tuition{}, "bill_id")
// 	}
// 	// bills.payment_bill_id ไม่ใช้แล้ว (ตัดวงจร FK)
// 	if db.Migrator().HasColumn(&entity.Bill{}, "payment_bill_id") {
// 		_ = db.Migrator().DropColumn(&entity.Bill{}, "payment_bill_id")
// 	}

// 	// ===== AutoMigrate (สั่งครั้งเดียวครบ) =====
// 	// ลำดับไม่เคร่งมาก แต่เพื่อความสบายใจวางประมาณนี้
// 	err := db.AutoMigrate(
// 		&entity.Address{}, &entity.Admin_User{}, &entity.Announcement{},
// 		&entity.AssignmentSubmit{}, &entity.Attendances{}, &entity.AttendanceStatus{},
// 		&entity.Course{}, &entity.District{}, &entity.EducationRecords{},
// 		&entity.Enrollment{}, &entity.Grade{}, &entity.Guardian{}, &entity.GuardianStudent{},
// 		&entity.Province{}, &entity.Schedules{}, &entity.Student{}, &entity.StudentRecords{},
// 		&entity.Subdistrict{}, &entity.Subject_Group{}, &entity.Target_Group{}, &entity.Teacher{},
// 		&entity.Term{}, // term มาก่อน
// 		&entity.Tuition{}, // ✅ master rate (GradeYear + TermID)
// 		&entity.Payment{}, // payment มาก่อน
// 		&entity.Bill{},    // bill อ้าง term/tuition/student
// 		&entity.Payment_Bill{}, // ตารางเชื่อม (อ้าง payment + bill)
// 		&entity.Users{}, &entity.UserType{}, &entity.Zipcode{}, &entity.Notifications{}, &entity.Title{},
// 	)
	
// 	if err != nil {
// 		panic("failed to migrate database: " + err.Error())
// 	}

// 	// ===== Seeds อื่น ๆ ของคุณ (คงเดิม) =====
// 	seedDays()
// 	seedTimeStart()
// 	seedTimeEnd()
// 	seedStudent()
// 	seedTeachers()
// 	seedAdmin()
// 	seedUserType()
// 	seedGrade()
// 	seedTerm()
// 	seedUsers()
// 	seedProvince()
// 	// seeddistrict()
// 	// seedCourses()
// 	seedSubjectGroup()
// 	seedTargetGroup(db)
	
// }

