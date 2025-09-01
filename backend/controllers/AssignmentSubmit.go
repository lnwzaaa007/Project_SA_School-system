package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
func GetCourses(c *gin.Context) {
	var courses []entity.Course
	if err := config.DB().Find(&courses).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลวิชาได้"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": courses})
}

func AssignmentSubmit(c *gin.Context) {
	// รับค่าจาก form-data
	assignmentTitle := c.PostForm("assignment_title")
	description := c.PostForm("description")
	studentComment := c.PostForm("student_comment")
	submitPointAll := c.PostForm("submit_point_all")

	// รับและแปลงค่า ID ต่าง ๆ
	gradeID, err := strconv.ParseUint(c.PostForm("grade_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "grade_id ไม่ถูกต้อง"})
		return
	}
	courseID, err := strconv.ParseUint(c.PostForm("course_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "course_id ไม่ถูกต้อง"})
		return
	}
	teacherID, err := strconv.ParseUint(c.PostForm("teacher_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher_id ไม่ถูกต้อง"})
		return
	}
	termID, err := strconv.ParseUint(c.PostForm("term_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "term_id ไม่ถูกต้อง"})
		return
	}
	studentID, err := strconv.ParseUint(c.PostForm("student_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student_id ไม่ถูกต้อง"})
		return
	}

	// parse คะแนนรวม
	pointAll, err := strconv.ParseFloat(submitPointAll, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "submit_point_all ไม่ถูกต้อง"})
		return
	}

	// รับไฟล์งาน
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์งาน"})
		return
	}

	// ตรวจสอบ/สร้างโฟลเดอร์
	saveDir := "uploads/assignments"
	if _, err := os.Stat(saveDir); os.IsNotExist(err) {
		os.MkdirAll(saveDir, os.ModePerm)
	}

	// บันทึกไฟล์ลงโฟลเดอร์
	filename := filepath.Base(file.Filename)
	savePath := filepath.Join(saveDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	// สร้าง AssignmentSubmit record
	submission := entity.AssignmentSubmit{
		Assignment_title: assignmentTitle,
		Description:      description,
		Assignment_file:  savePath,
		Submit_at:        time.Now(),
		Submit_Point_all: float32(pointAll),
		Submit_status:    entity.Waiting,
		Student_comment: studentComment,
		GradeID:   uint(gradeID),
		CourseID:  uint(courseID),
		TeacherID: uint(teacherID),
		TermID:    uint(termID),
		StudentID: uint(studentID),
	}

	// บันทึกลงฐานข้อมูล
	if err := config.DB().Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งกลับ
	c.JSON(http.StatusOK, gin.H{"message": "ส่งงานสำเร็จ", "data": submission})
}
