package config

import (
	"time"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// 🕒 แปลง string เป็น time.Time (ใช้กับ FullTime)
func MustTimeOnly(timeStr string) time.Time {
	t, err := time.Parse("15:04:05", timeStr)
	if err != nil {
		panic(err)
	}
	return t
}

// 📅 Seed ข้อมูลวันในสัปดาห์
func seedDays() {
	db.Model(&entity.Days{}).Create([]entity.Days{
		{ThaiDay: "จันทร์", EngDay: "Monday"},
		{ThaiDay: "อังคาร", EngDay: "Tuesday"},
		{ThaiDay: "พุธ", EngDay: "Wednesday"},
		{ThaiDay: "พฤหัสบดี", EngDay: "Thursday"},
		{ThaiDay: "ศุกร์", EngDay: "Friday"},
		{ThaiDay: "เสาร์", EngDay: "Saturday"},
		{ThaiDay: "อาทิตย์", EngDay: "Sunday"},
	})
}

// 🕘 Seed เวลาเริ่มคาบเรียน
func seedTimeStart() {
	db.Model(&entity.TimeStart{}).Create([]entity.TimeStart{
		{Period: "08:40", FullTime: MustTimeOnly("08:40:00")},
		{Period: "09:30", FullTime: MustTimeOnly("09:30:00")},
		{Period: "10:20", FullTime: MustTimeOnly("10:20:00")},
		{Period: "11:10", FullTime: MustTimeOnly("11:10:00")},
		{Period: "12:00", FullTime: MustTimeOnly("12:00:00")},
		{Period: "13:00", FullTime: MustTimeOnly("13:00:00")},
		{Period: "13:50", FullTime: MustTimeOnly("13:50:00")},
		{Period: "14:40", FullTime: MustTimeOnly("14:40:00")},
		{Period: "15:30", FullTime: MustTimeOnly("15:30:00")},
		{Period: "16:30", FullTime: MustTimeOnly("16:30:00")},
	})
}

// 🕔 Seed เวลาสิ้นสุดคาบเรียน
func seedTimeEnd() {
	db.Model(&entity.TimeEnd{}).Create([]entity.TimeEnd{
		{Period: "09:30", FullTime: MustTimeOnly("09:30:00")},
		{Period: "10:20", FullTime: MustTimeOnly("10:20:00")},
		{Period: "11:10", FullTime: MustTimeOnly("11:10:00")},
		{Period: "12:00", FullTime: MustTimeOnly("12:00:00")},
		{Period: "13:00", FullTime: MustTimeOnly("13:00:00")},
		{Period: "13:50", FullTime: MustTimeOnly("13:50:00")},
		{Period: "14:40", FullTime: MustTimeOnly("14:40:00")},
		{Period: "15:30", FullTime: MustTimeOnly("15:30:00")},
		{Period: "16:30", FullTime: MustTimeOnly("16:30:00")},
		{Period: "17:20", FullTime: MustTimeOnly("17:20:00")},
	})
}

// Term
func seedTerm() {
	db.Model(&entity.Term{}).Create([]entity.Term{
		{
			Academic_year: 2566,
			Semester:      1,
			Start_date:    time.Date(2023, 5, 15, 0, 0, 0, 0, time.Local),
			End_date:      time.Date(2023, 9, 30, 0, 0, 0, 0, time.Local),
		},
		{
			Academic_year: 2566,
			Semester:      2,
			Start_date:    time.Date(2023, 11, 1, 0, 0, 0, 0, time.Local),
			End_date:      time.Date(2024, 3, 31, 0, 0, 0, 0, time.Local),
		},
		{
			Academic_year: 2567,
			Semester:      1,
			Start_date:    time.Date(2024, 5, 15, 0, 0, 0, 0, time.Local),
			End_date:      time.Date(2024, 9, 30, 0, 0, 0, 0, time.Local),
		},
		{
			Academic_year: 2567,
			Semester:      2,
			Start_date:    time.Date(2024, 11, 1, 0, 0, 0, 0, time.Local),
			End_date:      time.Date(2025, 3, 31, 0, 0, 0, 0, time.Local),
		},
	})
}

// GradeLevel
func seedGrade() {	
	db.Model(&entity.Grade{}).Create([]entity.Grade{
		{Grade_Year: "1" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "1" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "1" ,Grade_Class: 3 ,TeacherID :nil },

		{Grade_Year: "2" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "2" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "2" ,Grade_Class: 3 ,TeacherID :nil },
		
		{Grade_Year: "3" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "3" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "3" ,Grade_Class: 3 ,TeacherID :nil },

		{Grade_Year: "4" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "4" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "4" ,Grade_Class: 3 ,TeacherID :nil },

		{Grade_Year: "5" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "5" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "5" ,Grade_Class: 3 ,TeacherID :nil },

		{Grade_Year: "6" ,Grade_Class: 1 ,TeacherID :nil },
		{Grade_Year: "6" ,Grade_Class: 2 ,TeacherID :nil },
		{Grade_Year: "6" ,Grade_Class: 3 ,TeacherID :nil },
	})
}
