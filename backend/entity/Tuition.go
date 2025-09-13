
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

