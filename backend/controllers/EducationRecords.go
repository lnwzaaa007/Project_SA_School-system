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
	ID                uint      `json:"id"`
	TermID            uint      `json:"term_id"`
	CourseID          uint      `json:"course_id"`
	TeacherID         uint      `json:"teacher_id"`
	StudentID         uint      `json:"student_id"`
	AssignmentSubmitID uint     `json:"assign_id"`

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
		ID:                 r.ID,
		TermID:             r.TermID,
		CourseID:           r.CourseID,
		TeacherID:          r.TeacherID,
		StudentID:          r.StudentID,
		AssignmentSubmitID: r.AssignmentSubmitID,

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

    AssignmentSubmitID *uint `json:"assign_id"`

    Point         *int     `json:"point"          binding:"omitempty,gte=0,lte=100"`
    MidPoint      *float32 `json:"mid_point"      binding:"omitempty,gte=0,lte=100"`
    FinalPoint    *float32 `json:"final_point"    binding:"omitempty,gte=0,lte=100"`
    GradePoint    *float32 `json:"grade_point"    binding:"omitempty,gte=0,lte=4"`
    BehaviorPoint *float32 `json:"behavior_point" binding:"omitempty,gte=0,lte=100"`
}


// POST /teacher/education-records
func CreateEducationRecord(c *gin.Context) {
	var req CreateEducationRecordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔒 กันชนกันที่คีย์ (term,course,student)
	key := fmt.Sprintf("edurec:%d:%d:%d", req.TermID, req.CourseID, req.StudentID)
	unlock := studentKeyLock.Lock(key) // ถ้าไม่มีตัวแปรนี้ในโปรเจกต์ ให้คอมเมนต์ทิ้งได้
	defer unlock()

	db := config.DB()
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	// กันซ้ำ (unique: term+course+student)
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
	if req.AssignmentSubmitID != nil {
		rec.AssignmentSubmitID = *req.AssignmentSubmitID
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

	// ลิงก์ StudentRecords (ถ้าระบบคุณใช้)
	link := entity.StudentRecords{
		StudentID:          rec.StudentID,
		EducationRecordsID: rec.ID,
	}
	if err := tx.Create(&link).Error; err != nil {
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
	Point         *int     `json:"point"`
	MidPoint      *float32 `json:"mid_point"`
	FinalPoint    *float32 `json:"final_point"`
	GradePoint    *float32 `json:"grade_point"`
	BehaviorPoint *float32 `json:"behavior_point"`

	TeacherID         *uint `json:"teacher_id"`
	AssignmentSubmitID *uint `json:"assign_id"`
}

// PUT /teacher/education-records/:id
func UpdateEducationRecord(c *gin.Context) {
    id := c.Param("id")
    db := config.DB()

    var rec entity.EducationRecords
    if err := db.First(&rec, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"}); return
    }

    var req UpdateEducationRecordReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
    }

    updates := map[string]interface{}{}
    if req.Point != nil { updates["point"] = *req.Point }
    if req.MidPoint != nil { updates["mid_point"] = *req.MidPoint }
    if req.FinalPoint != nil { updates["final_point"] = *req.FinalPoint }
    if req.GradePoint != nil { updates["grade_point"] = *req.GradePoint }
    if req.BehaviorPoint != nil { updates["behavior_point"] = *req.BehaviorPoint }
    if req.TeacherID != nil { updates["teacher_id"] = *req.TeacherID }
    if req.AssignmentSubmitID != nil { updates["assignment_submit_id"] = *req.AssignmentSubmitID }

    if len(updates) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"}); return
    }

    if err := db.Model(&rec).Updates(updates).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
    }

    db.First(&rec, id)
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

	// ลบ mapping ใน StudentRecords ก่อน
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
if err := config.DB().
    Preload("Term").
    Preload("Course").
    Preload("Teacher").
    Preload("Student").
    First(&rec, id).Error; err != nil  {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toEduView(rec)})
}

// GET /teacher/education-records?term_id=&course_id=&student_id=&teacher_id=&assign_id=&page=&page_size=
func ListEducationRecords(c *gin.Context) {
	db := config.DB()

	qTerm := strings.TrimSpace(c.Query("term_id"))
	qCourse := strings.TrimSpace(c.Query("course_id"))
	qStudent := strings.TrimSpace(c.Query("student_id"))
	qTeacher := strings.TrimSpace(c.Query("teacher_id"))
	qAssign := strings.TrimSpace(c.Query("assign_id"))

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
	if qAssign != "" {
		base = base.Where("assignment_submit_id = ?", qAssign)
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

// ---------- "ของฉัน" (Student) ----------

func currentUserID(c *gin.Context) (uint, bool) {
	if v, ok := c.Get("user_id"); ok {
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
	if v, ok := c.Get("id"); ok {
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

// GET /me/education-records?term_id=&course_id=&assign_id=&page=&page_size=
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
	qAssign := strings.TrimSpace(c.Query("assign_id"))

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
	if qAssign != "" {
		base = base.Where("assignment_submit_id = ?", qAssign)
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

func gradeFromTotal(t float32) float32 {
    switch {
    case t >= 80: return 4.0
    case t >= 75: return 3.5
    case t >= 70: return 3.0
    case t >= 65: return 2.5
    case t >= 60: return 2.0
    case t >= 55: return 1.5
    case t >= 50: return 1.0
    default:      return 0.0
    }
}
