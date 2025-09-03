package config

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

func seedCourses() {
	db.Model(&entity.Course{}).Create([]entity.Course{
		{
			Course_Code:    "CS101",
			Course_Name:    "Introduction to Computer Science",
			Credit_Num:     3,
			Classroom:      101,
			Class_in_week:  3,
			Hours_of_term:  45,
			SubjectGroupID: 1,
			GradeID:        1,
			TermID:         1,
			TeacherID:      1,
		},
		{
			Course_Code:    "MA201",
			Course_Name:    "Calculus II",
			Credit_Num:     4,
			Classroom:      202,
			Class_in_week:  4,
			Hours_of_term:  60,
			SubjectGroupID: 2,
			GradeID:        2,
			TermID:         2,
			TeacherID:      2,
		},
		{
			Course_Code:    "EN102",
			Course_Name:    "English Communication",
			Credit_Num:     2,
			Classroom:      303,
			Class_in_week:  2,
			Hours_of_term:  30,
			SubjectGroupID: 3,
			GradeID:        1,
			TermID:         1,
			TeacherID:      3,
		},
		{
			Course_Code:    "PHY301",
			Course_Name:    "Physics for Engineers",
			Credit_Num:     3,
			Classroom:      404,
			Class_in_week:  3,
			Hours_of_term:  45,
			SubjectGroupID: 1,
			GradeID:        3,
			TermID:         1,
			TeacherID:      4,
		},
	})
}

func seedSubjectGroup() {
	db.Model(&entity.Subject_Group{}).Create([]entity.Subject_Group{
		{SubjectGroup_Name: "คณิตศาสตร์"},
		{SubjectGroup_Name: "วิทยาศาสตร์"},
	})
}