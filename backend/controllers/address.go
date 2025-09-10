// controllers/address.go
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

type AddressCreateRequest struct {
	Address_Number     string `json:"address_number" binding:"required"`
	Road               string `json:"road"` // optional
	Thai_ProvinceID    uint   `json:"thai_province_id" binding:"required"`
	Thai_DistrictID    uint   `json:"thai_district_id" binding:"required"`
	Thai_SubdistrictID uint   `json:"thai_subdistrict_id" binding:"required"`

	// ถ้าต้องการผูกกับนักเรียนหรือครู ให้ส่ง id มาด้วย (ไม่บังคับ)
	StudentID *uint `json:"student_id"`
	TeacherID *uint `json:"teacher_id"`
}

func CreateAddress(c *gin.Context) {
	var req AddressCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload", "detail": err.Error()})
		return
	}

	db := config.DB()

	// ตรวจสอบว่า province/district/subdistrict มีอยู่จริง (กัน FK ผิด)
	// ถ้าไม่ต้องการ strict validation สามารถตัดบล็อกตรวจสอบเหล่านี้ออกได้
	var prov entity.Thai_Province
	if err := db.First(&prov, req.Thai_ProvinceID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "thai_province_id not found"})
		return
	}
	var dist entity.Thai_District
	if err := db.First(&dist, req.Thai_DistrictID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "thai_district_id not found"})
		return
	}
	var subd entity.Thai_Subdistrict
	if err := db.First(&subd, req.Thai_SubdistrictID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "thai_subdistrict_id not found"})
		return
	}

	addr := entity.Address{
		Address_Number:     req.Address_Number,
		Road:               req.Road,
		Thai_ProvinceID:    req.Thai_ProvinceID,
		Thai_DistrictID:    req.Thai_DistrictID,
		Thai_SubdistrictID: req.Thai_SubdistrictID,
	}

	tx := db.Begin()

	// สร้าง Address
	if err := tx.Create(&addr).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create address failed", "detail": err.Error()})
		return
	}

	// ถ้าส่ง StudentID มา ให้ไปอัปเดต address_id ในตาราง students
	if req.StudentID != nil {
		if err := tx.Model(&entity.Student{}).
			Where("id = ?", *req.StudentID).
			Update("address_id", addr.ID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "link student failed", "detail": err.Error()})
			return
		}
	}

	// ถ้าส่ง TeacherID มา ให้ไปอัปเดต address_id ในตาราง teachers
	if req.TeacherID != nil {
		if err := tx.Model(&entity.Teacher{}).
			Where("id = ?", *req.TeacherID).
			Update("address_id", addr.ID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "link teacher failed", "detail": err.Error()})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction commit failed", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "address created",
		"data":    addr,
	})
}
