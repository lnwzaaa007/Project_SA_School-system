package controllers

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// GetAssignmentsByCourse returns assignment definitions for a course.
// It filters to definition rows (student_id = 0) to avoid mixing with student submissions.
func GetAssignmentsByCourse(c *gin.Context) {
    courseID := c.Param("id")

    var assignments []entity.AssignmentSubmit
    if err := config.DB().
        Where("course_id = ?", courseID).
        Where("student_id = 0").
        Order("time_start ASC").
        Find(&assignments).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงรายการการบ้านของรายวิชานี้ได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// GetMySubmissionsByCourse returns submissions for a student in a given course
func GetMySubmissionsByCourse(c *gin.Context) {
    courseID := c.Param("course_id")
    studentID := strings.TrimSpace(c.Query("student_id"))

    db := config.DB().Where("course_id = ?", courseID)
    if studentID != "" {
        db = db.Where("student_id = ?", studentID)
    }

    // Return all submissions for the student in the course (including statuses)
    var subs []entity.AssignmentSubmit
    if err := db.Find(&subs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลงานที่ส่งแล้วได้"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": subs})
}
