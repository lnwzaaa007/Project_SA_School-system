package controllers

import (
	"net/http"
	"strconv"
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type GradeYearBrief struct {
	ID 	  uint   `json:"id"`
	GradeYear string `json:"grade_year"`
}
type GradeClassBrief struct {
	ID 	  uint   `json:"id"`
	GradeClass int `json:"grade_class"`
}

// func GetGradeYearAll(c *gin.Context) {
// 	var gradeYears []GradeYearBrief
// 	if err := config.DB().
// 		Model(&entity.Grade{}).
// 		Select("DISTINCT grade_year").
// 		Scan(&gradeYears).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gradeYears)
// }

// func GetGradeClassAll(c *gin.Context) {
// 	var gradeClasses []GradeClassBrief
// 	if err := config.DB().
// 		Model(&entity.Grade{}).
// 		Select("DISTINCT grade_class").
// 		Scan(&gradeClasses).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gradeClasses)
// }
//ger/grade year/all
func GetGradeYearAll(c *gin.Context) {
	var gradeYears []GradeYearBrief
	if err := config.DB().Raw("SELECT DISTINCT grade_year, MIN(id) AS id FROM grades GROUP BY grade_year").
		Scan(&gradeYears).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, gradeYears)
}
//ger/grade class/all
func GetGradeClassAll(c *gin.Context) {
	var gradeClasses []GradeClassBrief
	if err := config.DB().Raw("SELECT DISTINCT grade_class AS grade_class, MIN(id) AS id FROM grades GROUP BY grade_class").
		Scan(&gradeClasses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, gradeClasses)
}


func GetGradesByYearAndClass(c *gin.Context) {
	type GradeDetail struct {
		ID         uint   `json:"id"`
		GradeYear  int    `json:"grade_year"`  // ถ้าเป็นเลข ให้ใช้ int
		GradeClass int    `json:"grade_class"` // ถ้าเป็นเลข ให้ใช้ int
	}

	gradeYearIDStr := c.Query("grade_year_id")
	gradeClassIDStr := c.Query("grade_class_id")

	if gradeYearIDStr == "" || gradeClassIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "grade_year_id and grade_class_id are required"})
		return
	}

	gradeYearID, err1 := strconv.Atoi(gradeYearIDStr)
	gradeClassID, err2 := strconv.Atoi(gradeClassIDStr)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "grade_year_id and grade_class_id must be integers"})
		return
	}

	var grades []GradeDetail

	// เลือกอย่างใดอย่างหนึ่ง: ใช้ GORM หรือ Raw ตามสะดวก

	// ✅ แบบ GORM (อ่านง่าย แนะนำ)
	if err := config.DB().
		Table("grades").
		Select("id, grade_year, grade_class").
		Where("grade_year = ? AND grade_class = ?", gradeYearID, gradeClassID).
		Scan(&grades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	/* ✅ แบบ Raw SQL ก็ได้
	query := `SELECT id, grade_year, grade_class FROM grades
			  WHERE grade_year = ? AND grade_class = ?`
	if err := config.DB().Raw(query, gradeYearID, gradeClassID).Scan(&grades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	*/

	c.JSON(http.StatusOK, grades)
}
