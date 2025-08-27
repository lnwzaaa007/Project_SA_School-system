package controllers

import (
	"net/http"
	"time"
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type Term_ struct {
	Academic_year int `json:"academic_year"`
	Semester      int `json:"semester"`
	Start_date    time.Time `json:"start_date"`
	End_date      time.Time `json:"end_date"`
}


func GetTermAll(c *gin.Context) {
	var term []Term_
	if err := config.DB().
		Model(&entity.Term{}).
		Select("*").
		Scan(&term).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, term)
}



