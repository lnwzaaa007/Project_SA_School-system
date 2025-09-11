package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type gender struct {
	Gender_ID 	  uint   `json:"id" gorm:"column:id"`
	Gender_Name string `json:"gender_name"`
}

func GetGender(c *gin.Context) {
	var gender []gender
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, gender_name FROM genders GROUP BY gender_name ORDER BY id ASC").
        Scan(&gender).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, gender)
}
func GetGenderById(c *gin.Context) {
	var name gender
	id := c.Param("id")

	if err := config.DB().Table("genders").
		Select("*").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gender not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}