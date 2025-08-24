	// ชั้นปี
	package entity

	import "gorm.io/gorm"

	type Grade struct{
		gorm.Model
		Grade_Year		string  `gorm:"column:grade_year;uniqueIndex:ux_year_class" json:"grade_year"`
		Grade_Class		int		`gorm:"column:grade_class;uniqueIndex:ux_year_class" json:"grade_class"`
		TeacherID 		*uint  	`gorm:"column:teacher_id" json:"teacher_id"` //FK
		Course 			[]Course `gorm:"foreignKey:GradeID" json:"course_id"`
		Student 		[]Student `gorm:"foreignKey:GradeID" json:"student_id"`
	}