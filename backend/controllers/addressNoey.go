package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ---------- DTO ----------
type CreateAddressReq struct {
	AddressNumber string `json:"address_number" binding:"required"` // รายละเอียดบ้าน/หมู่ที่/เลขที่
	Road          string `json:"road"`

	ProvinceID    uint `json:"province_id" binding:"required"`
	DistrictID    uint `json:"district_id" binding:"required"`
	SubdistrictID uint `json:"subdistrict_id" binding:"required"`
	ZipcodeID     uint `json:"zipcode_id" binding:"required"`
}

type UpdateAddressReq struct {
	AddressNumber *string `json:"address_number"`
	Road          *string `json:"road"`

	ProvinceID    *uint `json:"province_id"`
	DistrictID    *uint `json:"district_id"`
	SubdistrictID *uint `json:"subdistrict_id"`
	ZipcodeID     *uint `json:"zipcode_id"`
}

// ---------- CREATE ----------
func CreateAddress(c *gin.Context) {
	var req CreateAddressReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	a := entity.Address{
		Address_Number: req.AddressNumber,
		Road:           req.Road,
		ProvinceID:     req.ProvinceID,
		DistrictID:     req.DistrictID,
		SubdistrictID:  req.SubdistrictID,
		ZipcodeID:      req.ZipcodeID,
	}
	if err := config.DB().Create(&a).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": a})
}

// ---------- LIST (ค้นหา/กรอง/แบ่งหน้า) ----------
func ListAddresses(c *gin.Context) {
	db := config.DB()

	q := strings.TrimSpace(c.Query("q"))
	provinceIDStr := strings.TrimSpace(c.Query("province_id"))
	districtIDStr := strings.TrimSpace(c.Query("district_id"))
	subdistrictIDStr := strings.TrimSpace(c.Query("subdistrict_id"))
	zipcodeIDStr := strings.TrimSpace(c.Query("zipcode_id"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	base := db.Model(&entity.Address{})
	if q != "" {
		like := "%" + q + "%"
		base = base.Where("address_number LIKE ? OR road LIKE ?", like, like)
	}
	// กรองตามรหัสพื้นที่ (ถ้ามี)
	if provinceIDStr != "" {
		if v, err := strconv.Atoi(provinceIDStr); err == nil && v > 0 {
			base = base.Where("province_id = ?", v)
		}
	}
	if districtIDStr != "" {
		if v, err := strconv.Atoi(districtIDStr); err == nil && v > 0 {
			base = base.Where("district_id = ?", v)
		}
	}
	if subdistrictIDStr != "" {
		if v, err := strconv.Atoi(subdistrictIDStr); err == nil && v > 0 {
			base = base.Where("subdistrict_id = ?", v)
		}
	}
	if zipcodeIDStr != "" {
		if v, err := strconv.Atoi(zipcodeIDStr); err == nil && v > 0 {
			base = base.Where("zipcode_id = ?", v)
		}
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var rows []entity.Address
	if err := base.
		Order("id DESC").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      rows,
		"page":      page,
		"page_size": pageSize,
		"total":     total,
	})
}

// ---------- GET BY ID ----------
func GetAddressByID(c *gin.Context) {
	var a entity.Address
	if err := config.DB().First(&a, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": a})
}

// ---------- UPDATE ----------
func UpdateAddress(c *gin.Context) {
	var a entity.Address
	if err := config.DB().First(&a, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	var req UpdateAddressReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.AddressNumber != nil {
		updates["address_number"] = strings.TrimSpace(*req.AddressNumber)
	}
	if req.Road != nil {
		updates["road"] = strings.TrimSpace(*req.Road)
	}
	if req.ProvinceID != nil {
		updates["province_id"] = *req.ProvinceID
	}
	if req.DistrictID != nil {
		updates["district_id"] = *req.DistrictID
	}
	if req.SubdistrictID != nil {
		updates["subdistrict_id"] = *req.SubdistrictID
	}
	if req.ZipcodeID != nil {
		updates["zipcode_id"] = *req.ZipcodeID
	}

	if len(updates) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": a})
		return
	}

	if err := config.DB().Model(&a).Updates(updates).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": a})
}

// ---------- DELETE ----------
func DeleteAddress(c *gin.Context) {
	if err := config.DB().Delete(&entity.Address{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
