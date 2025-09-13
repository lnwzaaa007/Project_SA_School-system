package controllers

import (
	"fmt"
	"mime/multipart"
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

// ✅ ส่วนกลาง: validate & save
var allowedExt = map[string]bool{
	".pdf": true, ".doc": true, ".docx": true,
	".ppt": true, ".pptx": true, ".zip": true,
	".png": true, ".jpg": true, ".jpeg": true, ".txt": true,
}

const maxUploadSize = int64(25 << 20) // 25MB

func validateFile(fh *multipart.FileHeader) error {
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	if !allowedExt[ext] {
		return fmt.Errorf("ชนิดไฟล์ไม่รองรับ")
	}
	if fh.Size > maxUploadSize {
		return fmt.Errorf("ไฟล์ใหญ่เกินกำหนด (สูงสุด 25MB)")
	}
	return nil
}

func saveFile(c *gin.Context, baseDir string, fh *multipart.FileHeader) (relPath, filename string, err error) {
	if err = os.MkdirAll(baseDir, 0755); err != nil {
		return "", "", err
	}
	safe := sanitizeFilename(fh.Filename)
	filename = uuid.New().String() + "_" + safe
	full := filepath.Join(baseDir, filename)
	if err = c.SaveUploadedFile(fh, full); err != nil {
		return "", "", err
	}
	return filepath.ToSlash(full), filename, nil
}

// ---------- (ตัวอย่าง) ดึงรายวิชา ----------
func GetCourses(c *gin.Context) {
    gradeID := c.Param("grade_id") // รับ grade_id จาก URL

    var courses []entity.Course
    if err := config.DB().
        Where("grade_id = ?", gradeID). // กรองเฉพาะวิชาของ grade นี้
        Find(&courses).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลวิชาได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": courses})
}


// ---------- (ตัวอย่าง) ดึง assignment submit ตาม id ----------
func GetAllAssignment(c *gin.Context) {
	var assignments []entity.AssignmentSubmit
	id := c.Param("id")
	if err := config.DB().Where("id = ?", id).Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล assignment ได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// ---------- อัปโหลดไฟล์อย่างเดียว ----------
func UploadFileOnly(c *gin.Context) {
    fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("assignment_file")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ (file หรือ assignment_file)"})
		return
	}
	if vErr := validateFile(fileHeader); vErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": vErr.Error()})
		return
	}
	relPath, filename, err := saveFile(c, filepath.Join("uploads", "raw"), fileHeader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์ไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":  "uploaded",
		"filename": filename,
		"path":     relPath,
		"size":     fileHeader.Size,
	})
}

// ---------- ส่งงาน (โหมดทดลอง: ไม่บังคับส่ง id ต่าง ๆ) ----------
func AssignmentSubmit(c *gin.Context) {
	// ---- อ่านข้อความจาก form-data ----
	assignmentTitle := c.PostForm("assignment_title")
	description := c.PostForm("description")
	studentComment := c.PostForm("student_comment")
	submitPointAll := c.PostForm("submit_point_all")

	// อ่านเลขแบบ optional (ค่าว่าง/ผิด = 0)
	getUint := func(k string) uint {
		v := c.PostForm(k)
		if v == "" {
			return 0
		}
		u, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			return 0
		}
		return uint(u)
	}
	gradeID := getUint("grade_id")
	courseID := getUint("course_id")
	teacherID := getUint("teacher_id")
	termID := getUint("term_id")
	studentID := getUint("student_id")

	// คะแนนเต็ม (optional)
	pointAll := float32(0)
	if submitPointAll != "" {
		if f64, err := strconv.ParseFloat(submitPointAll, 32); err == nil {
			pointAll = float32(f64)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "submit_point_all ไม่ถูกต้อง"})
			return
		}
	}

	// ---- รับไฟล์ ----
	// ตรวจสอบช่วงเวลาเปิดส่งจาก definition ของงาน (student_id = 0)
	if assignmentTitle == "" || courseID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุชื่อการบ้านและรหัสวิชา (course_id)"})
		return
	}
	{
		var def entity.AssignmentSubmit
		if err := config.DB().
			Where("course_id = ? AND assignment_title = ? AND student_id = 0", courseID, assignmentTitle).
			First(&def).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบการบ้านที่ระบุในรายวิชานี้"})
			return
		}
		now := time.Now()
		if now.Before(def.TimeStart) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ยังไม่ถึงเวลาเปิดส่งงาน"})
			return
		}
		if now.After(def.TimeEnd) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "เลยกำหนดเวลาส่งงานแล้ว"})
			return
		}
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("assignment_file")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์งาน (file หรือ assignment_file)"})
		return
	}
	if vErr := validateFile(fileHeader); vErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": vErr.Error()})
		return
	}

	// ---- ที่เก็บไฟล์ (ถ้าไม่มี id ใช้โฟลเดอร์กันชน) ----
	courseFolder := "_noCourse"
	studentFolder := "_noStudent"
	if courseID > 0 {
		courseFolder = strconv.Itoa(int(courseID))
	}
	if studentID > 0 {
		studentFolder = strconv.Itoa(int(studentID))
	}
	baseDir := filepath.Join("uploads", "assignments", courseFolder, studentFolder)

	relPath, _, err := saveFile(c, baseDir, fileHeader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์ไม่สำเร็จ"})
		return
	}

	// ---- หา/อัปเดต submission เดิม ----
	var sub entity.AssignmentSubmit
	db := config.DB()

	q := db.Where("assignment_title = ?", assignmentTitle)
	// ถ้ามี course + student ให้ใช้เป็นคีย์ร่วม (แน่นขึ้น)
	if courseID > 0 && studentID > 0 {
		q = q.Where("course_id = ? AND student_id = ?", courseID, studentID)
	}
	tx := q.First(&sub)

	// มีไฟล์เก่า และ path เปลี่ยน → ลบทิ้ง (ล้มเหลวได้ ไม่ต้อง fail งาน)
	if tx.Error == nil && sub.Assignment_file != "" && sub.Assignment_file != relPath {
		_ = os.Remove(sub.Assignment_file)
	}

	// ตั้งค่าฟิลด์
	sub.Assignment_title = assignmentTitle
	sub.Description = description
	sub.Student_comment = studentComment
	sub.Assignment_file = relPath
	sub.Submit_at = time.Now()
	sub.Submit_Point_all = pointAll
	sub.Submit_status = entity.Submitted

	// เก็บ id ที่มี (ไม่มี = 0)
	sub.GradeID = gradeID
	sub.CourseID = courseID
	sub.TeacherID = teacherID
	sub.TermID = termID
	sub.StudentID = studentID

	if tx.Error == nil {
		if err := db.Save(&sub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตข้อมูลไม่สำเร็จ"})
			return
		}
	} else {
		if err := db.Create(&sub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ"})
			return
		}
	}

	// คืน URL สาธารณะ (ต้องมี r.StaticFS("/uploads", http.Dir("uploads")))
	c.JSON(http.StatusCreated, gin.H{
		"message":  "ส่งงานสำเร็จ",
		"data":     sub,
		"file_url": "/" + relPath, // เช่น /uploads/assignments/_noCourse/_noStudent/<uuid>_file.pdf
	})
}

func GetSubmissionsByAssignment(c *gin.Context) {
    // รองรับทั้ง :course_id หรือ :assignment_id ที่กำหนดไว้ใน router เดิม
    id := c.Param("course_id")
    if id == "" {
        id = c.Param("assignment_id")
    }

    // ตัวเลือก filter ตามนักเรียนคนใดคนหนึ่ง
    studentID := strings.TrimSpace(c.Query("student_id"))

    db := config.DB().Preload("Student")
    db = db.Where("course_id = ?", id)
    // แสดงทั้งที่ส่งแล้วและตรวจแล้ว
    db = db.Where("submit_status IN ?", []entity.Submit_status{entity.Submitted, entity.Success})
    if studentID != "" {
        db = db.Where("student_id = ?", studentID)
    }

    var subs []entity.AssignmentSubmit
    if err := db.Find(&subs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการส่งงานได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": subs})
}

// ✅ บันทึกคะแนนและสถานะตรวจแล้ว
func UpdateSubmissionScore(c *gin.Context) {
    submissionID := c.Param("id")

    // ข้อมูลที่รับจาก frontend
    var payload struct {
        Score float32 `json:"score"`
    }
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    // หา record ตาม ID
    var sub entity.AssignmentSubmit
    if err := config.DB().First(&sub, submissionID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล"})
        return
    }

    // ✅ อัปเดตคะแนนและสถานะ
    sub.Submit_Point = payload.Score
    sub.Submit_status = entity.Success // ใช้ enum Success = "ตรวจแล้ว"

    if err := config.DB().Save(&sub).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกคะแนนล้มเหลว"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "อัปเดตคะแนนสำเร็จ",
        "data":    sub,
    })
}
