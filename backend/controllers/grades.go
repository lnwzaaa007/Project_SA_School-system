package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type GradeYearBrief struct {
	GradeYear string `json:"grade_year"`
}
type GradeClassBrief struct {
	GradeClass int `json:"grade_class"`
}

func GetGradeYearAll(c *gin.Context) {
	var gradeYears []GradeYearBrief
	if err := config.DB().
		Model(&entity.Grade{}).
		Select("DISTINCT grade_year").
		Scan(&gradeYears).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, gradeYears)
}

func GetGradeClassAll(c *gin.Context) {
	var gradeClasses []GradeClassBrief
	if err := config.DB().
		Model(&entity.Grade{}).
		Select("DISTINCT grade_class").
		Scan(&gradeClasses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, gradeClasses)
}


