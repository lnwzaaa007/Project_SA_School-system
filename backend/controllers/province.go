package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type province struct {
	Province_ID 	  uint   `json:"id" gorm:"column:id"`
	Province_Name string `json:"province_name"`
}

func GetProvince(c *gin.Context) {
	var province []province
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, province_name FROM provinces GROUP BY province_name ORDER BY id ASC").
        Scan(&province).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, province)
}

func GetProvinceById(c *gin.Context) {
	var name province
	id := c.Param("id")

	if err := config.DB().Table("provinces").
		Select("*").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "province not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}
