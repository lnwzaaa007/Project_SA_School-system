package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type NameOnly struct {
    Student_ID string `json:"student_id"`
	TFirst_Name string `json:"t_first_name"`
	TLast_Name  string `json:"t_last_name"`
}

func GetNameStudent(c *gin.Context) {
	var student []entity.Student
	if err := config.DB().Raw("SELECT TFirst_Name,TLast_Name FROM Student").Find(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, student)
}

// GET /NameStudent/:id
func GetNameStudentById(c *gin.Context) {
	var name NameOnly
	id := c.Param("id")

	if err := config.DB().Table("students").
		Select("student_id,t_first_name, t_last_name").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}


