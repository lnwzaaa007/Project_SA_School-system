package controllers

import (
	
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	

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

// ---------- อัปโหลดไฟล์อย่างเดียว เก็บไว้ในระบบ ----------
func UploadFileOnly(c *gin.Context) {
	// รับไฟล์: รองรับทั้ง "file" และ "assignment_file"
	fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("assignment_file")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ (file หรือ assignment_file)"})
		return
	}

	// จำกัดชนิด/ขนาด (ปรับตามที่ต้องการ)
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

	// โฟลเดอร์เก็บไฟล์
	baseDir := filepath.Join("uploads", "raw")
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์อัปโหลดได้"})
		return
	}

	// ตั้งชื่อไฟล์: UUID + safe name
	safe := sanitizeFilename(fileHeader.Filename)
	filename := uuid.New().String() + "_" + safe
	savePath := filepath.Join(baseDir, filename)

	// เซฟไฟล์ลงดิสก์
	if err := c.SaveUploadedFile(fileHeader, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์ไม่สำเร็จ"})
		return
	}

	// ตอบกลับด้วยข้อมูลไฟล์ที่บันทึก
	c.JSON(http.StatusOK, gin.H{
		"message":  "uploaded",
		"filename": filename,
		"path":     filepath.ToSlash(savePath),
		"size":     fileHeader.Size,
	})
}
