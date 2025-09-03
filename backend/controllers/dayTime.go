// controllers/enums.go

package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
)
type DayResponse struct {
	ID     uint   `json:"id"`
	ThaiDay string `json:"thai_day"`
}
func GetDaysAll(c *gin.Context) {
	var days []DayResponse
	if err := config.DB().
		Model(&entity.Days{}).
		Select("id,thai_day").
		Scan(&days).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, days)
}
type TimeStartResponse struct {
	ID     uint   `json:"id"`
	Period string `json:"period"`
}
func GetTimeSrartAll(c *gin.Context) {
	var timeStart []TimeStartResponse
	if err := config.DB().
		Model(&entity.TimeStart{}).
		Select("id,period").
		Scan(&timeStart).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"times": timeStart})
}
type TimeEndResponse struct {
	ID     uint   `json:"id"`
	Period string `json:"period"`
}

func GetTimeEndAll(c *gin.Context) {
	var timeEnd []TimeEndResponse

	if err := config.DB().
		Model(&entity.TimeEnd{}).
		Select("id, period").
		Scan(&timeEnd).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"times": timeEnd})
}