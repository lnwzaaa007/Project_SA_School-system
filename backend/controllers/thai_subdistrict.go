package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	// "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

type thaisubdistrict struct {
	Subdistrict_ID   uint   `json:"id" gorm:"column:id"`
	ZipCode          uint   `json:"zip_code" gorm:"column:zip_code"`
	District_ID      uint   `json:"amphure_id" gorm:"column:amphure_id"`
	Subdistrict_Name string `json:"Sname_th" gorm:"column:name_th"`
	District_name    string `json:"Dname_th" gorm:"column:name_th"`
}

func GetThaiSubdistrict(c *gin.Context) {
	var thaisubdistrict []thaisubdistrict
	if err := config.DB().
		Raw("SELECT thai_tambons.*,thai_amphures.name_th FROM thai_tambons inner join thai_amphures on thai_tambons.amphure_id = thai_amphures.id ").
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
		Table("thai_tambons").
		Select("id, amphure_id, name_th, zip_code").
		Where("amphure_id = ?", districtID).
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
		Table("thai_tambons").
		Select("id, amphure_id, name_th, zip_code").
		Where("id = ?", subdistrictID).
		Order("id ASC").
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, rows)
}
