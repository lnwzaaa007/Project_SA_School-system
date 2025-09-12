// backend/controllers/seed_tuition.go
package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
)

func SeedTuition(c *gin.Context) {
	db := config.DB()

	year := 0
	if y := c.Query("year"); y != "" {
		if v, err := strconv.Atoi(y); err == nil {
			year = v
		}
	}

	t1, t2, err := config.SeedTuition(db, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "seed tuition: " + err.Error()})
		return
	}
	if year == 0 {
		year = time.Now().Year() + 543
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "seed tuition completed",
		"academicYear": year,
		"term1":        t1,
		"term2":        t2,
	})
}
