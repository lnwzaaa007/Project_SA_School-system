package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type thaiprovince struct {
	Province_ID 	  uint   `json:"id" gorm:"column:id"`
	Province_Name string `json:"thai_province_name" gorm:"column:thai_province_name"`
}

func GetThaiProvince(c *gin.Context) {
	var thaiprovince []thaiprovince
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, thai_province_name FROM thai_provinces GROUP BY thai_province_name ORDER BY id ASC").
        Scan(&thaiprovince).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, thaiprovince)
}

func GetThaiProvinceById(c *gin.Context) {
	var name thaiprovince
	id := c.Param("id")

	if err := config.DB().Table("thai_provinces").
		Select("*").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "province not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}
