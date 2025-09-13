package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ✅ ดึง submission นักเรียนของ assignment id ที่ครูสร้าง
func GetSubmissionsByAssignmentID(c *gin.Context) {
	assignmentID := c.Param("assignment_id")
	if assignmentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ assignment_id"})
		return
	}

	// 1) หางานการบ้านต้นฉบับของครู
	var def entity.AssignmentSubmit
	if err := config.DB().
		Where("id = ?", assignmentID).
		First(&def).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการบ้านต้นฉบับ"})
		return
	}

	// 2) หางานที่นักเรียนส่ง (student_id != 0) โดยเทียบตาม course_id และ assignment_title
	var subs []entity.AssignmentSubmit
	if err := config.DB().
		Preload("Student").
		Where("course_id = ? AND assignment_title = ? AND student_id <> 0",
			def.CourseID, def.Assignment_title).
		Find(&subs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการส่งงานได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": subs})
}
// ✅ ครูบันทึกคะแนน
func UpdateSubmissionScoreID(c *gin.Context) {
	submissionID := c.Param("id")

	var payload struct {
		Score float32 `json:"score"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var sub entity.AssignmentSubmit
	if err := config.DB().First(&sub, submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลการส่งงาน"})
		return
	}

	sub.Submit_Point = payload.Score
	sub.Submit_status = entity.Success

	if err := config.DB().Save(&sub).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกคะแนนล้มเหลว"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตคะแนนสำเร็จ", "data": sub})
}
