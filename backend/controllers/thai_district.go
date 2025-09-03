package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type thaidistrict struct {
	District_ID uint `json:"id" gorm:"column:id"`
	Province_ID 	  uint   `json:"province_id" gorm:"column:province_id"`
	Province_Name string `json:"Pname_th" gorm:"column:name_th"`
	District_name string `json:"Dname_th" gorm:"column:name_th"`
	
}

func GetThaiDistrict(c *gin.Context) {
	var thaidistrict []thaidistrict
	if err := config.DB().
        Raw("SELECT thai_amphures.*,thai_provinces.name_th FROM thai_amphures inner join thai_provinces on thai_amphures.province_id = thai_provinces.id ").
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
        Table("thai_amphures").
        Select("id, province_id, name_th").
        Where("province_id = ?", provinceID).
        Order("id ASC").
        Scan(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, rows)
}
