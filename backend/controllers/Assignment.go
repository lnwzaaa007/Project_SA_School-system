package controllers

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ---------- ตัวช่วย ----------
var filenameSafeRe = regexp.MustCompile(`[^a-zA-Z0-9._ -]+`)

func sanitizeFilename(name string) string {
	name = strings.ReplaceAll(name, string(os.PathSeparator), "_")
	name = filenameSafeRe.ReplaceAllString(name, "_")
	return strings.TrimSpace(name)
}

// ---------- ดึงรายวิชา ----------
func GetCourses(c *gin.Context) {
	var courses []entity.Course
	if err := config.DB().Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลวิชาได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": courses})
}

// ---------- ดึง assignment submit ตาม id (ถ้าต้องการ) ----------
func GetAllAssignment(c *gin.Context) {
	var assignments []entity.AssignmentSubmit
	id := c.Param("id")
	if err := config.DB().Where("id = ?", id).Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล assignment ได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// ---------- อัปโหลด/ส่งงาน ----------
func AssignmentSubmit(c *gin.Context) {
	// ฟิลด์จาก form-data
	assignmentTitle := c.PostForm("assignment_title")
	description := c.PostForm("description")
	studentComment := c.PostForm("student_comment")
	submitPointAll := c.PostForm("submit_point_all")

	// แปลง IDs
	parseUint := func(k string) (uint, bool) {
		v := c.PostForm(k)
		u, err := strconv.ParseUint(v, 10, 32)
		if v == "" || err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": k + " ไม่ถูกต้อง"})
			return 0, false
		}
		return uint(u), true
	}
	gradeID, ok := parseUint("grade_id"); if !ok { return }
	courseID, ok := parseUint("course_id"); if !ok { return }
	teacherID, ok := parseUint("teacher_id"); if !ok { return }
	termID, ok := parseUint("term_id"); if !ok { return }
	studentID, ok := parseUint("student_id"); if !ok { return }

	// คะแนนเต็ม
	pointAll := float32(0)
	if submitPointAll != "" {
		f, err := strconv.ParseFloat(submitPointAll, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "submit_point_all ไม่ถูกต้อง"})
			return
		}
		pointAll = float32(f)
	}

	// รับไฟล์
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์งาน (file)"})
		return
	}

	// จำกัดชนิด/ขนาด
	allowedExt := map[string]bool{
		".pdf": true, ".doc": true, ".docx": true,
		".ppt": true, ".pptx": true, ".zip": true,
		".png": true, ".jpg": true, ".jpeg": true, ".txt": true,
	}
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if !allowedExt[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชนิดไฟล์ไม่รองรับ"})
		return
	}
	const maxSize = int64(25 << 20) // 25MB
	if fileHeader.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไฟล์ใหญ่เกินกำหนด (สูงสุด 25MB)"})
		return
	}

	// เตรียมโฟลเดอร์: uploads/assignments/<course_id>/<student_id>/
	baseDir := filepath.Join("uploads", "assignments", strconv.Itoa(int(courseID)), strconv.Itoa(int(studentID)))
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์อัปโหลดได้"})
		return
	}

	// ตั้งชื่อไฟล์: UUID + safe name
	safe := sanitizeFilename(fileHeader.Filename)
	uid := uuid.New().String()
	filename := uid + "_" + safe
	savePath := filepath.Join(baseDir, filename)

	// เขียนไฟล์ + hash (เผื่ออยากเก็บ)
	src, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปิดไฟล์ไม่สำเร็จ"})
		return
	}
	defer src.Close()

	out, err := os.Create(savePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}
	defer out.Close()

	h := sha256.New()
	if _, err := io.Copy(io.MultiWriter(out, h), src); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เขียนไฟล์ไม่สำเร็จ"})
		return
	}
	_ = hex.EncodeToString(h.Sum(nil)) // ถ้าต้องการ เก็บใน DB ได้

	// บันทึก DB
	submission := entity.AssignmentSubmit{
		Assignment_title: assignmentTitle,
		Description:      description,
		Student_comment:  studentComment,
		Assignment_file:  filepath.ToSlash(savePath), // เก็บ path ไฟล์
		Submit_at:        time.Now(),
		Submit_Point_all: pointAll,
		Submit_status:    entity.Waiting,

		GradeID:   gradeID,
		CourseID:  courseID,
		TeacherID: teacherID,
		TermID:    termID,
		StudentID: studentID,
	}

	if err := config.DB().Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "ส่งงานสำเร็จ", "data": submission})
}

// ---------- ดาวน์โหลดไฟล์ตาม id ----------
func DownloadSubmission(c *gin.Context) {
	id := c.Param("id")
	var sub entity.AssignmentSubmit
	if err := config.DB().First(&sub, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบงานนี้"})
		return
	}
	// TODO: ตรวจสิทธิ์ที่นี่ (เจ้าของไฟล์/ครู/ฯลฯ)
	c.FileAttachment(sub.Assignment_file, filepath.Base(sub.Assignment_file))
}
