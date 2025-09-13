package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ---- helper: ยอมรับเลขหรือสตริง แล้วแปลงเป็น string ----
type FlexString string

func (s *FlexString) UnmarshalJSON(b []byte) error {
	// ลองเป็น string ก่อน
	var str string
	if err := json.Unmarshal(b, &str); err == nil {
		*s = FlexString(strings.TrimSpace(str))
		return nil
	}
	// ลองเป็น number → แปลงเป็นสตริง
	var num json.Number
	if err := json.Unmarshal(b, &num); err == nil {
		*s = FlexString(num.String())
		return nil
	}
	return fmt.Errorf("must be string or number")
}

// ========= Create / Update payload =========

type CreateAddressReq struct {
	AddressNumber FlexString `json:"address_number" binding:"required"`
	Road          string     `json:"road"`

	// รองรับได้ทั้งคู่: thai_* หรือไม่มี thai_ ก็ได้
	ProvinceID      uint `json:"province_id"`
	DistrictID      uint `json:"district_id"`
	SubdistrictID   uint `json:"subdistrict_id"`
	ThaiProvinceID  uint `json:"thai_province_id"`
	ThaiDistrictID  uint `json:"thai_district_id"`
	ThaiSubdistictID uint `json:"thai_subdistrict_id"`
}

func (r *CreateAddressReq) normalize() (prov, dist, sub uint) {
	prov = r.ProvinceID
	dist = r.DistrictID
	sub  = r.SubdistrictID
	if r.ThaiProvinceID != 0 {
		prov = r.ThaiProvinceID
	}
	if r.ThaiDistrictID != 0 {
		dist = r.ThaiDistrictID
	}
	if r.ThaiSubdistictID != 0 {
		sub = r.ThaiSubdistictID
	}
	return
}

type UpdateAddressReq struct {
	AddressNumber *FlexString `json:"address_number"`
	Road          *string     `json:"road"`

	ProvinceID       *uint `json:"province_id"`
	DistrictID       *uint `json:"district_id"`
	SubdistrictID    *uint `json:"subdistrict_id"`
	ThaiProvinceID   *uint `json:"thai_province_id"`
	ThaiDistrictID   *uint `json:"thai_district_id"`
	ThaiSubdistrictID *uint `json:"thai_subdistrict_id"`
}

func pickUint(primary, alt *uint) *uint {
	if primary != nil && *primary != 0 {
		return primary
	}
	return alt
}

// ========= Handlers =========

// POST /addresses
func CreateAddressN(c *gin.Context) {
	var req CreateAddressReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	prov, dist, sub := req.normalize()
	if prov == 0 || dist == 0 || sub == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "thai_province_id, thai_district_id และ thai_subdistrict_id ต้องไม่เป็นศูนย์"})
		return
	}

	addr := entity.Address{
		Address_Number:   string(req.AddressNumber),
		Road:             strings.TrimSpace(req.Road),
		Thai_ProvinceID:  prov,
		Thai_DistrictID:  dist,
		Thai_SubdistrictID: sub,
	}
	if err := config.DB().Create(&addr).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": gin.H{
		"id":                 addr.ID,
		"address_number":     addr.Address_Number,
		"road":               addr.Road,
		"thai_province_id":   addr.Thai_ProvinceID,
		"thai_district_id":   addr.Thai_DistrictID,
		"thai_subdistrict_id": addr.Thai_SubdistrictID,
	}})
}

// GET /addresses
func ListAddressesN(c *gin.Context) {
	var out []entity.Address
	if err := config.DB().
		Order("id ASC").
		Find(&out).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	// map เป็นรูปแบบที่ FE คาด
	result := make([]gin.H, 0, len(out))
	for _, a := range out {
		result = append(result, gin.H{
			"id":                 a.ID,
			"address_number":     a.Address_Number,
			"road":               a.Road,
			"thai_province_id":   a.Thai_ProvinceID,
			"thai_district_id":   a.Thai_DistrictID,
			"thai_subdistrict_id": a.Thai_SubdistrictID,
			"created_at":         a.CreatedAt,
			"updated_at":         a.UpdatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": result})
}

// GET /addresses/:id
func GetAddressN(c *gin.Context) {
	id := c.Param("id")
	var a entity.Address
	if err := config.DB().First(&a, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"id":                 a.ID,
		"address_number":     a.Address_Number,
		"road":               a.Road,
		"thai_province_id":   a.Thai_ProvinceID,
		"thai_district_id":   a.Thai_DistrictID,
		"thai_subdistrict_id": a.Thai_SubdistrictID,
		"created_at":         a.CreatedAt,
		"updated_at":         a.UpdatedAt,
	}})
}

// PUT /addresses/:id
func UpdateAddressN(c *gin.Context) {
	id := c.Param("id")
	var a entity.Address
	if err := config.DB().First(&a, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var req UpdateAddressReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.AddressNumber != nil {
		updates["address_number"] = string(*req.AddressNumber)
	}
	if req.Road != nil {
		updates["road"] = strings.TrimSpace(*req.Road)
	}

	// รองรับทั้งคู่ (เลือกอันที่มีค่า)
	if v := pickUint(req.ThaiProvinceID, req.ProvinceID); v != nil {
		updates["thai_province_id"] = *v
	}
	if v := pickUint(req.ThaiDistrictID, req.DistrictID); v != nil {
		updates["thai_district_id"] = *v
	}
	if v := pickUint(req.ThaiSubdistrictID, req.SubdistrictID); v != nil {
		updates["thai_subdistrict_id"] = *v
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

// DELETE /addresses/:id
func DeleteAddressN(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.Address{}, id).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": true})
}
