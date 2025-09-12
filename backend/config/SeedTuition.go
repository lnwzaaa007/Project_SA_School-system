// backend/config/seed_tuition.go
package config

import (
	"fmt"
	"time"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/gorm"
)

// SeedTuition สร้าง/อัปเดตเรตราคาเทอม (Normalize: grade_year + term_id)
// คืนค่า term1ID, term2ID
func SeedTuition(db *gorm.DB, academicYear int) (uint, uint, error) {
	if academicYear == 0 {
		academicYear = time.Now().Year() + 543 // ปี พ.ศ.
	}

	// ensure term 1 & 2
	var term1, term2 entity.Term
	if err := db.
		// Where("academic_year = ? AND semester = 1", academicYear).
		// FirstOrCreate(&term1, entity.Term{
		// 	Academic_year: academicYear, Semester: 1,
		// 	Start_date: time.Now(), End_date: time.Now().AddDate(0, 4, 0),
		// }).Error; err != nil {
		// return 0, 0, fmt.Errorf("ensure term1: %w", err)
		
		Where("academic_year = ? AND semester = ?", academicYear, 1).
		Attrs(entity.Term{
			Start_date: time.Now(),
			End_date:   time.Now().AddDate(0, 4, 0),
		}).
		FirstOrCreate(&term1).Error; err != nil {
		return 0, 0, fmt.Errorf("ensure term1: %w", err)
	}
	

	if err := db.
    Where("academic_year = ? AND semester = ?", academicYear, 2).
    Attrs(entity.Term{
        Start_date: time.Now(),
        End_date:   time.Now().AddDate(0, 4, 0),
    }).
    FirstOrCreate(&term2).Error; err != nil {
    return 0, 0, fmt.Errorf("ensure term2: %w", err)
}

	// rates ตามชั้น (เก็บ grade_year = "1".."6")
	rates := map[string][2]int{
		"1": {12000, 13000},
		"2": {14000, 15000},
		"3": {16000, 17000},
		"4": {18000, 19000},
		"5": {20000, 21000},
		"6": {22000, 23000},
	}

	// upsert tuition master
	for gy, pair := range rates {
		// เทอม 1
		if err := db.
			Where("grade_year = ? AND term_id = ?", gy, term1.ID).
			FirstOrCreate(&entity.Tuition{
				GradeYear:     gy,
				TermID:        term1.ID,
				Title:         fmt.Sprintf("%s เทอม 1", gy),
				AmountTuition: pair[0],
			}).Error; err != nil {
			return 0, 0, fmt.Errorf("seed tuition gy=%s term1: %w", gy, err)
		}
		// เทอม 2
		if err := db.
			Where("grade_year = ? AND term_id = ?", gy, term2.ID).
			FirstOrCreate(&entity.Tuition{
				GradeYear:     gy,
				TermID:        term2.ID,
				Title:         fmt.Sprintf("%s เทอม 2", gy),
				AmountTuition: pair[1],
			}).Error; err != nil {
			return 0, 0, fmt.Errorf("seed tuition gy=%s term2: %w", gy, err)
		}
	}

	return term1.ID, term2.ID, nil
}
