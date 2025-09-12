package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"time"
)

type CreateAssignmentInput struct {
	CourseID        uint      `json:"course_id"`
	Assignment_title string  `json:"assignment_title"`
	Description      string  `json:"description"`
	TimeStart        time.Time  `json:"time_start"`
	TimeEnd          time.Time  `json:"time_end"`
	Submit_Point_all float32 `json:"submit_Point_all"`
}

func GetCoursesByIDTeacher(c *gin.Context) {
    teacherID := c.Param("teacher_id") // รับ grade_id จาก URL

    var courses []entity.Course
    if err := config.DB().
        Where("teacher_id = ?", teacherID). // กรองเฉพาะวิชาของ grade นี้
        Find(&courses).Error; err != nil {
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
		CourseID: 	  input.CourseID,
		Assignment_title: input.Assignment_title,
		Description:      input.Description,
		TimeStart:        input.TimeStart,
		TimeEnd:          input.TimeEnd,
		Submit_Point_all: input.Submit_Point_all,

		// ✅ ตั้งค่าเริ่มต้น (ยังไม่ส่ง, ยังไม่มีไฟล์/เวลา)
		Submit_status:   entity.NotSubmitted,
		Assignment_file: "",
		Submit_at:       time.Time{}, // zero
	}

	// ✅ แก้ validation: เช็ค TimeEnd ให้ถูกฟิลด์
	
	if assignment.Assignment_title == "" ||
   assignment.Description == "" ||
   assignment.TimeStart.IsZero() ||
   assignment.TimeEnd.IsZero() ||
   assignment.Submit_Point_all == 0 {
   c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วน"})
   return
}

	if err := config.DB().Create(&assignment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// แนะนำ: ใช้ 201 Created
	c.JSON(http.StatusCreated, gin.H{"data": assignment})
}
