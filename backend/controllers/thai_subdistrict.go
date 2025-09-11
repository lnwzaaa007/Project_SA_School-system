package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	// "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

type thaisubdistrict struct {
	Subdistrict_ID   uint   `json:"id" gorm:"column:id"`
	ZipCode          uint   `json:"thai_zip_code" gorm:"column:thai_zip_code"`
	District_ID      uint   `json:"thai_district_id" gorm:"column:thai_district_id"`
	Subdistrict_Name string `json:"thai_subdistrict_name" gorm:"column:thai_subdistrict_name"`
	District_name    string `json:"thai_district_name" gorm:"column:thai_district_name"`
}

func GetThaiSubdistrict(c *gin.Context) {
	var thaisubdistrict []thaisubdistrict
	if err := config.DB().
		Raw("SELECT thai_subdistricts.*,thai_districts.thai_district_name FROM thai_subdistricts inner join thai_districts on thai_subdistricts.thai_district_id = thai_districts.id ").
		Scan(&thaisubdistrict).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, thaisubdistrict)
}

func GetThaiSubdistrictById(c *gin.Context) {
	districtID := c.Param("id")
	var rows []thaisubdistrict

	if err := config.DB().
		Table("thai_subdistricts").
		Select("id, thai_district_id, thai_subdistrict_name, thai_zip_code").
		Where("thai_district_id = ?", districtID).
		Order("id ASC").
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetThaiZipcodeById(c *gin.Context) {
	subdistrictID := c.Param("id")
	var rows []thaisubdistrict

	if err := config.DB().
		Table("thai_subdistricts").
		Select("id, thai_district_id, thai_subdistrict_name, thai_zip_code").
		Where("id = ?", subdistrictID).
		Order("id ASC").
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, rows)
}
