package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type district struct {
	District_ID uint `json:"id" gorm:"column:id"`
	Province_ID 	  uint   `json:"province_id" gorm:"column:province_id"`
	Province_Name string `json:"province_name" gorm:"column:province_name"`
	District_name string `json:"district_name" gorm:"column:district_name"`
	
}

func GetDistrict(c *gin.Context) {
	var district []district
	if err := config.DB().
        Raw("SELECT districts.*,provinces.province_name FROM districts inner join provinces on districts.province_id = provinces.id ").
        Scan(&district).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, district)
}

func GetDistrictById(c *gin.Context) {
	provinceID := c.Param("id")
    var rows []district

    if err := config.DB().
        Table("districts").
        Select("id, province_id, district_name").
        Where("province_id = ?", provinceID).
        Order("id ASC").
        Scan(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, rows)
}
