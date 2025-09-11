package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ---------- View / DTO ----------

type EducationRecordView struct {
	ID            uint      `json:"id"`
	TermID        uint      `json:"term_id"`
	CourseID      uint      `json:"course_id"`
	TeacherID     uint      `json:"teacher_id"`
	StudentID     uint      `json:"student_id"`
	Point         int       `json:"point"`
	MidPoint      float32   `json:"mid_point"`
	FinalPoint    float32   `json:"final_point"`
	GradePoint    float32   `json:"grade_point"`
	BehaviorPoint float32   `json:"behavior_point"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toEduView(r entity.EducationRecords) EducationRecordView {
	return EducationRecordView{
		ID:            r.ID,
		TermID:        r.TermID,
		CourseID:      r.CourseID,
		TeacherID:     r.TeacherID,
		StudentID:     r.StudentID,
		Point:         r.Point,
		MidPoint:      r.Mid_Point,
		FinalPoint:    r.Final_Point,
		GradePoint:    r.Grade_Point,
		BehaviorPoint: r.Behavior_Point,
		CreatedAt:     r.CreatedAt,
		UpdatedAt:     r.UpdatedAt,
	}
}

// ---------- Create (เพิ่ม) ----------

type CreateEducationRecordReq struct {
	TermID    uint `json:"term_id" binding:"required"`
	CourseID  uint `json:"course_id" binding:"required"`
	TeacherID uint `json:"teacher_id" binding:"required"`
	StudentID uint `json:"student_id" binding:"required"`

	// ค่าคะแนน (ไม่ใส่ = เริ่มที่ 0)
	Point         *int     `json:"point"`
	MidPoint      *float32 `json:"mid_point"`
	FinalPoint    *float32 `json:"final_point"`
	GradePoint    *float32 `json:"grade_point"`
	BehaviorPoint *float32 `json:"behavior_point"`
}

// POST /teacher/education-records
// สร้าง record ใหม่สำหรับ (term, course, student) — ถ้ามีอยู่แล้ว จะคืน 409
func CreateEducationRecord(c *gin.Context) {
	var req CreateEducationRecordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔒 กันชนกันที่คีย์ (term,course,student)
	key := fmt.Sprintf("edurec:%d:%d:%d", req.TermID, req.CourseID, req.StudentID)
	unlock := studentKeyLock.Lock(key)
	defer unlock()

	db := config.DB()
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	var exists entity.EducationRecords
	if err := tx.Where("term_id = ? AND course_id = ? AND student_id = ?",
		req.TermID, req.CourseID, req.StudentID).
		First(&exists).Error; err == nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "education record already exists"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	rec := entity.EducationRecords{
		TermID:    req.TermID,
		CourseID:  req.CourseID,
		TeacherID: req.TeacherID,
		StudentID: req.StudentID,
	}
	if req.Point != nil {
		rec.Point = *req.Point
	}
	if req.MidPoint != nil {
		rec.Mid_Point = *req.MidPoint
	}
	if req.FinalPoint != nil {
		rec.Final_Point = *req.FinalPoint
	}
	if req.GradePoint != nil {
		rec.Grade_Point = *req.GradePoint
	}
	if req.BehaviorPoint != nil {
		rec.Behavior_Point = *req.BehaviorPoint
	}

	if err := tx.Create(&rec).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง mapping ใน StudentRecords (ถ้าต้องการลิงก์ไว้)
	link := entity.StudentRecords{
		StudentID:          req.StudentID,
		EducationRecordsID: rec.ID,
	}
	if err := tx.Create(&link).Error; err != nil {
		// ไม่ถือเป็น fatal ต่อผู้ใช้ แต่ rollback เพื่อความสอดคล้องของข้อมูล
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to link student record"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toEduView(rec)})
}

// ---------- Update (แก้ไข) ----------

type UpdateEducationRecordReq struct {
	// แก้คะแนนเฉพาะฟิลด์ที่ส่งมา (pointer = optional)
	Point         *int     `json:"point"`
	MidPoint      *float32 `json:"mid_point"`
	FinalPoint    *float32 `json:"final_point"`
	GradePoint    *float32 `json:"grade_point"`
	BehaviorPoint *float32 `json:"behavior_point"`

	// อนุญาตให้เปลี่ยนครูผู้สอนได้
	TeacherID *uint `json:"teacher_id"`
}

// PUT /teacher/education-records/:id
func UpdateEducationRecord(c *gin.Context) {
	id := c.Param("id")

	var rec entity.EducationRecords
	db := config.DB()
	if err := db.First(&rec, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	var req UpdateEducationRecordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if req.Point != nil {
		updates["point"] = *req.Point
	}
	if req.MidPoint != nil {
		updates["mid_point"] = *req.MidPoint
	}
	if req.FinalPoint != nil {
		updates["final_point"] = *req.FinalPoint
	}
	if req.GradePoint != nil {
		updates["grade_point"] = *req.GradePoint
	}
	if req.BehaviorPoint != nil {
		updates["behavior_point"] = *req.BehaviorPoint
	}
	if req.TeacherID != nil {
		updates["teacher_id"] = *req.TeacherID
	}

	if len(updates) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
		return
	}

	// NOTE:
	// ชื่อ column ใน DB คือ Point, Mid_Point, Final_Point, Grade_Point, Behavior_Point
	// ถ้า GORM ใช้ default naming snake_case จะกลายเป็น point, mid_point, ...
	// ถ้า schema ของคุณตั้งชื่อ column ไม่ตรง ให้เปลี่ยน key ใน updates ให้ตรง column จริง
	if err := db.Model(&rec).Updates(updates).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// reload
	if err := db.First(&rec, id).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
}

// ---------- Delete (ลบ) ----------

// DELETE /teacher/education-records/:id
func DeleteEducationRecord(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	// ลบ mapping ใน StudentRecords ก่อน (กัน FK/ซากข้อมูล)
	if err := tx.Where("education_records_id = ?", id).Delete(&entity.StudentRecords{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Delete(&entity.EducationRecords{}, id).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// ---------- Get (ดู) ----------

// GET /teacher/education-records/:id
func GetEducationRecordByID(c *gin.Context) {
	id := c.Param("id")
	var rec entity.EducationRecords
	if err := config.DB().First(&rec, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
}

// GET /teacher/education-records?term_id=&course_id=&student_id=&teacher_id=&page=&page_size=
func ListEducationRecords(c *gin.Context) {
	db := config.DB()

	qTerm := strings.TrimSpace(c.Query("term_id"))
	qCourse := strings.TrimSpace(c.Query("course_id"))
	qStudent := strings.TrimSpace(c.Query("student_id"))
	qTeacher := strings.TrimSpace(c.Query("teacher_id"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	base := db.Model(&entity.EducationRecords{})
	if qTerm != "" {
		base = base.Where("term_id = ?", qTerm)
	}
	if qCourse != "" {
		base = base.Where("course_id = ?", qCourse)
	}
	if qStudent != "" {
		base = base.Where("student_id = ?", qStudent)
	}
	if qTeacher != "" {
		base = base.Where("teacher_id = ?", qTeacher)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var rows []entity.EducationRecords
	if err := base.Order("id DESC").
		Limit(pageSize).
		Offset((page-1)*pageSize).
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	views := make([]EducationRecordView, 0, len(rows))
	for _, r := range rows {
		views = append(views, toEduView(r))
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      views,
		"page":      page,
		"page_size": pageSize,
		"total":     total,
	})
}

//Student
func currentUserID(c *gin.Context) (uint, bool) {
	// ปกติ middlewares.Authorizes() มัก set ค่าไว้ใน context เช่น "user_id" หรือ "id"
	// รองรับหลายรูปแบบไว้ให้
	if v, ok := c.Get("user_id"); ok {
		switch x := v.(type) {
		case uint:
			return x, true
		case int:
			if x >= 0 { return uint(x), true }
		case int64:
			if x >= 0 { return uint(x), true }
		case float64: // JWT numeric -> float64
			if x >= 0 { return uint(x), true }
		case string:
			if n, err := strconv.ParseUint(x, 10, 64); err == nil {
				return uint(n), true
			}
		}
	}
	if v, ok := c.Get("id"); ok { // เผื่อบางโปรเจ็กต์ใช้ key "id"
		switch x := v.(type) {
		case uint:
			return x, true
		case int:
			if x >= 0 { return uint(x), true }
		case int64:
			if x >= 0 { return uint(x), true }
		case float64:
			if x >= 0 { return uint(x), true }
		case string:
			if n, err := strconv.ParseUint(x, 10, 64); err == nil {
				return uint(n), true
			}
		}
	}
	return 0, false
}

func findStudentIDByUsersID(db *gorm.DB, usersID uint) (uint, error) {
	var s entity.Student
	if err := db.Select("id").Where("users_id = ?", usersID).Take(&s).Error; err != nil {
		return 0, err
	}
	return s.ID, nil
}

// ----- 1) รายการคะแนนของ "ฉัน" (กรอง + แบ่งหน้า) -----
// GET /me/education-records?term_id=&course_id=&page=&page_size=
func ListMyEducationRecords(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := config.DB()
	stuID, err := findStudentIDByUsersID(db, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	qTerm := strings.TrimSpace(c.Query("term_id"))
	qCourse := strings.TrimSpace(c.Query("course_id"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 { page = 1 }
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if pageSize <= 0 || pageSize > 100 { pageSize = 20 }

	base := db.Model(&entity.EducationRecords{}).Where("student_id = ?", stuID)
	if qTerm != "" {
		base = base.Where("term_id = ?", qTerm)
	}
	if qCourse != "" {
		base = base.Where("course_id = ?", qCourse)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var rows []entity.EducationRecords
	if err := base.Order("id DESC").
		Limit(pageSize).
		Offset((page-1)*pageSize).
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	views := make([]EducationRecordView, 0, len(rows))
	for _, r := range rows { views = append(views, toEduView(r)) }

	c.JSON(http.StatusOK, gin.H{
		"data":      views,
		"page":      page,
		"page_size": pageSize,
		"total":     total,
	})
}

// ----- 2) ดูคะแนนเรคอร์ดเดียวของ "ฉัน" -----
// GET /me/education-records/:id
func GetMyEducationRecordByID(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	db := config.DB()
	stuID, err := findStudentIDByUsersID(db, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	id := c.Param("id")
	var rec entity.EducationRecords
	if err := db.Where("id = ? AND student_id = ?", id, stuID).Take(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
}

// ----- 3) (ตัวเลือก) ดูคะแนนของฉันตาม term+course ตรง ๆ -----
// GET /me/education-record?term_id=&course_id=
func GetMyEducationRecordByTermCourse(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	db := config.DB()
	stuID, err := findStudentIDByUsersID(db, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	qTerm := strings.TrimSpace(c.Query("term_id"))
	qCourse := strings.TrimSpace(c.Query("course_id"))
	if qTerm == "" || qCourse == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "term_id and course_id are required"})
		return
	}

	var rec entity.EducationRecords
	if err := db.Where("student_id = ? AND term_id = ? AND course_id = ?", stuID, qTerm, qCourse).
		Take(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
}