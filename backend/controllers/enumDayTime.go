// controllers/enums.go

package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDaysEnums(c *gin.Context) {
	days := []string{
		"อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์",
	}

	c.JSON(http.StatusOK, gin.H{
		"days":  days,
	})
}
func GetTimesEnums(c *gin.Context) {
	times := []string{
		"08.40", "09.30", "10.20", "11.10", "12.00",
		"13.00", "13.50", "14.40", "15.30", "16.30",
	}
	c.JSON(http.StatusOK, gin.H{
		"times": times,
	})
}