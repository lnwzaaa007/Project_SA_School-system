package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ====== Request / Response ======

type CreateBillReq struct {
	StudentID    uint  `json:"student_id" binding:"required"`
	TermID       *uint `json:"term_id,omitempty"`
	AcademicYear *int  `json:"academicYear,omitempty"`
	Semester     *int  `json:"semester,omitempty"`
}

type CreateBillResp struct {
	BillID     uint              `json:"billId"`
	StatusBill entity.StatusBill `json:"statusBill"`
	StudentID  uint              `json:"student_id"`
	Term       struct {
		ID           uint `json:"id"`
		AcademicYear int  `json:"academic_year"`
		Semester     int  `json:"semester"`
	} `json:"term"`
	Tuition struct {
		ID     uint   `json:"id"`
		Title  string `json:"title"`
		Amount int    `json:"amount"`
	} `json:"tuition"`
}

// ====== Helpers ======

// เก็บเฉพาะตัวเลขจาก string เช่น "ม.1/1" -> "11", "ม.1" -> "1"
func onlyDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// ====== Main Handler ======

func CreateBillByStudentTerm(c *gin.Context) {
	db := config.DB()

	// ---- รับและตรวจ input ----
	var req CreateBillReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request: " + err.Error()})
		return
	}

	// ---- หา/สร้าง Term ----
	var term entity.Term
	if req.TermID != nil {
		if err := db.First(&term, *req.TermID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเทอมที่ระบุ (term_id)"})
			return
		}
	} else {
		if req.AcademicYear == nil || req.Semester == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องส่ง term_id หรือ academicYear+semester อย่างใดอย่างหนึ่ง"})
			return
		}
		if err := db.
			Where("academic_year = ? AND semester = ?", *req.AcademicYear, *req.Semester).
			FirstOrCreate(&term, entity.Term{
				Academic_year: *req.AcademicYear,
				Semester:      *req.Semester,
				Start_date:    time.Now(),
				End_date:      time.Now().AddDate(0, 4, 0),
			}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้าง/หาเทอมไม่สำเร็จ: " + err.Error()})
			return
		}
	}

	// ---- นักเรียน + ชั้นปี ----
	var stu entity.Student
	
	if err := db.
		Preload("Grade").
		Preload("Term").
		First(&stu, req.StudentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียน"})
		return
	}

	if stu.Grade == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "นักเรียนยังไม่ได้ผูกชั้นเรียน (Grade) จึงหาอัตราเทอมไม่ได้"})
		return
	}

	// ตาราง tuition.grade_year เก็บเป็น "1..6" แบบ TEXT -> normalize ให้เหลือตัวเลข
	gy := onlyDigits(stu.Grade.Grade_Year)
	if gy == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชั้นปีของนักเรียนไม่ถูกต้อง (grade_year ว่าง)"})
		return
	}

	// ---- ถ้ามีบิล Student+Term อยู่แล้ว คืนข้อมูลบิลเดิม ----
	var existing entity.Bill
	if err := db.
		Where("student_id = ? AND term_id = ?", stu.ID, term.ID).
		Preload("Tuition").
		First(&existing).Error; err == nil {

		var resp CreateBillResp
		resp.BillID = existing.ID
		resp.StatusBill = existing.StatusBill
		resp.StudentID = existing.StudentID
		resp.Term.ID = term.ID
		resp.Term.AcademicYear = term.Academic_year
		resp.Term.Semester = term.Semester
		if existing.Tuition != nil {
			resp.Tuition.ID = existing.Tuition.ID
			resp.Tuition.Title = existing.Tuition.Title
			resp.Tuition.Amount = existing.Tuition.AmountTuition
		}
		c.JSON(http.StatusOK, resp)
		return
	}

	// ---- ดึงเรตราคาเทอมจาก tuition (master) : grade_year + term_id ----
	var tuition entity.Tuition
	if err := db.
		Where("grade_year = ? AND term_id = ?", gy, term.ID).
		First(&tuition).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": fmt.Sprintf("ไม่พบเรตราคาเทอมของชั้น %s (term=%d). กรุณา seed tuition ก่อน (/dev/seed/tuition)", gy, term.ID),
		})
		return
	}

	// ---- สร้าง Bill ใหม่ ----
	bill := entity.Bill{
		DateTime:   time.Now(),
		StatusBill: entity.Pending,
		TermID:     term.ID,
		StudentID:  stu.ID,
		TuitionID:  tuition.ID, // อ้าง master tuition
	}
	if err := db.Create(&bill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างบิลไม่สำเร็จ: " + err.Error()})
		return
	}

	// ---- ตอบกลับ ----
	var resp CreateBillResp
	resp.BillID = bill.ID
	resp.StatusBill = bill.StatusBill
	resp.StudentID = bill.StudentID
	resp.Term.ID = term.ID
	resp.Term.AcademicYear = term.Academic_year
	resp.Term.Semester = term.Semester
	resp.Tuition.ID = tuition.ID
	resp.Tuition.Title = tuition.Title
	resp.Tuition.Amount = tuition.AmountTuition

	c.JSON(http.StatusCreated, resp)
}
