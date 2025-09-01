package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type NameOnlyTeacher struct {
    Teacher_ID string `json:"teacher_id"`
	TFirst_Name string `json:"tfirst_name"`
	TLast_Name  string `json:"tlast_name"`
}

func GetNameTeacher(c *gin.Context) {
	var teacher []entity.Teacher
	if err := config.DB().Raw("SELECT TFirst_Name,TLast_Name FROM Teacher").Find(&teacher).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// GET /NameStudent/:id
func GetNameTeacherById(c *gin.Context) {
	var name NameOnlyTeacher
	id := c.Param("id")

	if err := config.DB().Table("teachers").
		Select("teacher_id,t_first_name,t_last_name").
		Where("users_id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}


