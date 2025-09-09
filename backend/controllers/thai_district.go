package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type thaidistrict struct {
	District_ID uint `json:"id" gorm:"column:id"`
	Province_ID 	  uint   `json:"thai_province_id" gorm:"column:thai_province_id"`
	Province_Name string `json:"Pname_th" gorm:"column:thai_province_name"`
	District_name string `json:"thai_district_name" gorm:"column:thai_district_name"`
	
}

func GetThaiDistrict(c *gin.Context) {
	var thaidistrict []thaidistrict
	if err := config.DB().
        Raw("SELECT thai_districts.*,thai_provinces.thai_province_name FROM thai_districts inner join thai_provinces on thai_districts.thai_province_id = thai_provinces.id ").
        Scan(&thaidistrict).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, thaidistrict)
}

func GetThaiDistrictById(c *gin.Context) {
	provinceID := c.Param("id")
    var rows []thaidistrict

    if err := config.DB().
        Table("thai_districts").
        Select("id, thai_province_id, thai_district_name").
        Where("thai_province_id = ?", provinceID).
        Order("id ASC").
        Scan(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, rows)
}
