package controllers

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// GetSubmissionsByAssignmentID returns student submissions for a specific assignment (by ID).
// It resolves the assignment definition and fetches student rows that match course_id + assignment_title.
func GetSubmissionsByAssignmentID(c *gin.Context) {
    assignmentID := strings.TrimSpace(c.Param("assignment_id"))
    if assignmentID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ assignment_id"})
        return
    }

    var def entity.AssignmentSubmit
    if err := config.DB().First(&def, assignmentID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการบ้านที่ระบุ"})
        return
    }

    var subs []entity.AssignmentSubmit
    if err := config.DB().
        Preload("Student").
        Where("course_id = ? AND assignment_title = ? AND student_id <> 0", def.CourseID, def.Assignment_title).
        Where("submit_status IN ?", []entity.Submit_status{entity.Submitted, entity.Success}).
        Find(&subs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลงานที่ส่งแล้วได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": subs})
}

