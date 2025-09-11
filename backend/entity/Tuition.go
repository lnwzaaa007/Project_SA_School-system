// package entity

// import "gorm.io/gorm"
// type Tuition struct {
// 	gorm.Model
// 	Title         string `json:"title"`
// 	AmountTuition int    `json:"amountTuition"`

// 	GradeYear string `gorm:"size:20;uniqueIndex:ux_tuition_grade_term" json:"grade_year"`
// 	TermID    uint   `gorm:"uniqueIndex:ux_tuition_grade_term" json:"term_id"`
// 	Term      *Term

// 	Bills []Bill `gorm:"foreignKey:TuitionID"` // 1 ค่าเทอม ผูกหลายบิล
// }
// backend/entity/tuition.go
package entity

import "gorm.io/gorm"

type Tuition struct {
    gorm.Model
    GradeYear     string `gorm:"size:10;uniqueIndex:ux_tuition_grade_term" json:"grade_year"`
    TermID        uint   `gorm:"uniqueIndex:ux_tuition_grade_term" json:"term_id"`
    Term          *Term  `json:"term"`
    Title         string `json:"title"`
    AmountTuition int    `json:"amount_tuition"`
}

