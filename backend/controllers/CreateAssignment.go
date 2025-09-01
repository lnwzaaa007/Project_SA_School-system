package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"time"
)

type CreateAssignmentInput struct {
	Assignment_title string  `json:"assignment_title"`
	Description      string  `json:"description"`
	TimeStart        time.Time  `json:"time_start"`
	TimeEnd          time.Time  `json:"time_end"`
	Submit_Point_all float32 `json:"submit_Point_all"`
}

func GetCoursess(c *gin.Context) {
	var courses []entity.Course	
	if err := config.DB().Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลวิชาได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": courses})
}

func CreateHomeWork(c *gin.Context) {
	var input CreateAssignmentInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment := entity.AssignmentSubmit{
		Assignment_title: input.Assignment_title,
		Description:      input.Description,
		TimeStart:        input.TimeStart,
		TimeEnd:          input.TimeEnd,
		Submit_Point_all: input.Submit_Point_all,
	}

	if assignment.Assignment_title == "" || assignment.Description == "" || assignment.TimeStart.IsZero() || assignment.TimeStart.IsZero() || assignment.Submit_Point_all == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วน"})
		return
	}
	if err := config.DB().Create(&assignment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": assignment})
}
