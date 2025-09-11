// backend/controllers/Payment.go
package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/gorm"
)

// ===================== Helpers =====================

// รวมยอดที่ "อนุมัติแล้ว" ของบิล
func sumApproved(tx *gorm.DB, billID uint) (int, error) {
	type Row struct{ Sum int }
	var row Row
	err := tx.Table("payments").
		Select("COALESCE(SUM(payments.amount),0) as sum").
		Joins("JOIN payment_bills pb ON pb.payment_id = payments.id").
		Where("pb.bill_id = ? AND payments.status = ?", billID, entity.Complete).
		Scan(&row).Error
	return row.Sum, err
}

// นับจำนวนสลิปที่ "รอตรวจสอบ" ของบิล
func countWaiting(tx *gorm.DB, billID uint) (int64, error) {
	var cnt int64
	err := tx.Model(&entity.Payment{}).
		Joins("JOIN payment_bills pb ON pb.payment_id = payments.id").
		Where("pb.bill_id = ? AND payments.status = ?", billID, entity.Waitting).
		Count(&cnt).Error
	return cnt, err
}

// sanitize ชื่อไฟล์/โฟลเดอร์ให้ปลอดภัย

// ดึงเฉพาะตัวเลขจาก string เช่น "ม.1/3" -> "1"
func normalizeGradeYear(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	if b.Len() == 0 {
		return s
	}
	out := b.String()
	if len(out) > 1 {
		return string(out[0])
	}
	return out
}

// ===================== DTOs =====================

type BillUI struct {
	BillId   uint   `json:"billId"`
	Title    string `json:"title"`
	Amount   int    `json:"amount"`
	UiStatus string `json:"uiStatus"`
}

type TuitionOption struct {
	TermID       uint   `json:"termId"`
	AcademicYear int    `json:"academicYear"`
	Semester     int    `json:"semester"`
	TuitionID    uint   `json:"tuitionId"`
	Title        string `json:"title"`
	Amount       int    `json:"amount"`
	BillID       *uint  `json:"billId,omitempty"`
	UIStatus     string `json:"uiStatus"` // ยังไม่ชำระ / รอตรวจสอบ / ชำระแล้ว / ยังไม่สร้างบิล
}

type TuitionOptionsResp struct {
	StudentID uint            `json:"studentId"`
	GradeYear string          `json:"gradeYear"`
	Options   []TuitionOption `json:"options"`
}

type verifyReq struct {
	Approve bool `json:"approve"`
}

// ===================== Handlers =====================

// 1) หน้า list บิลของนักเรียน (auto-create ถ้ายังไม่มีบิล)
// รองรับทั้ง /bills/student/:id และ /students/:user_id (ใช้ตัวไหนก็ให้พารามฯ ชื่อ :id)
func ListStudentBills(c *gin.Context) {
	db := config.DB()

	stuID := c.Param("id")
	if stuID == "" {
		stuID = c.Param("user_id")
	}
	if stuID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ student id"})
		return
	}

	// ลองดึงบิลที่มีอยู่ก่อน
	var bills []entity.Bill
	if err := db.Preload("Tuition").
		Where("student_id = ?", stuID).
		Order("created_at desc").
		Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงบิลไม่สำเร็จ: " + err.Error()})
		return
	}

	// ถ้ายังไม่มีบิลเลย → สร้างจาก Grade + TermID ของนักเรียน (ถ้ามี)
	if len(bills) == 0 {
		var stu entity.Student
		if err := db.Preload("Grade").First(&stu, stuID).Error; err == nil && stu.Grade != nil && stu.TermID != 0 {
			gy := normalizeGradeYear(stu.Grade.Grade_Year)

			var tuition entity.Tuition
			if err := db.Where("grade_year = ? AND term_id = ?", gy, stu.TermID).
				First(&tuition).Error; err == nil {

				newBill := entity.Bill{
					DateTime:   time.Now(),
					StatusBill: entity.Pending,
					TermID:     stu.TermID,
					StudentID:  stu.ID,
					TuitionID:  tuition.ID,
				}
				if err := db.Create(&newBill).Error; err == nil {
					db.Preload("Tuition").First(&newBill, newBill.ID)
					bills = append(bills, newBill)
				}
			}
		}
	}

	// map เป็นข้อมูลสำหรับ UI
	resp := make([]BillUI, 0, len(bills))
	for _, b := range bills {
		title := fmt.Sprintf("บิล #%d", b.ID)
		amount := 0
		if b.Tuition != nil {
			title = b.Tuition.Title
			amount = b.Tuition.AmountTuition
		}
		uiStatus := "ยังไม่ชำระ"
		if b.StatusBill == entity.Paid {
			uiStatus = "ชำระแล้ว"
		} else {
			if w, _ := countWaiting(db, b.ID); w > 0 {
				uiStatus = "รอตรวจสอบ"
			}
		}
		resp = append(resp, BillUI{
			BillId:   b.ID,
			Title:    title,
			Amount:   amount,
			UiStatus: uiStatus,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// 2) สรุปยอด + QR สำหรับหน้า checkout
func BillsSummary(c *gin.Context) {
	db := config.DB()

	idsParam := c.Query("billIds")
	if idsParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ billIds"})
		return
	}

	var ids []uint
	for _, s := range strings.Split(idsParam, ",") {
		if n, err := strconv.Atoi(strings.TrimSpace(s)); err == nil && n > 0 {
			ids = append(ids, uint(n))
		}
	}
	if len(ids) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "billIds ไม่ถูกต้อง"})
		return
	}

	var bills []entity.Bill
	if err := db.Preload("Tuition").Find(&bills, ids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงบิลไม่สำเร็จ: " + err.Error()})
		return
	}

	type Item struct {
		BillID uint   `json:"billId"`
	Title  string `json:"title"`
		Amount int    `json:"amount"`
	}

	var items []Item
	total := 0
	for _, b := range bills {
		t := fmt.Sprintf("บิล #%d", b.ID)
		amt := 0
		if b.Tuition != nil {
			t = b.Tuition.Title
			amt = b.Tuition.AmountTuition
		}
		items = append(items, Item{BillID: b.ID, Title: t, Amount: amt})
		total += amt
	}

	sort.Slice(items, func(i, j int) bool { return items[i].BillID < items[j].BillID })

	paymentRef := strings.ToUpper(uuid.NewString())[:12]
	

	// ✅ ส่ง path รูป static กลับไป (ให้ frontend prefix ด้วย API_URL)
    qrImageUrl := "/uploads/qr/promptpay.jpg"

	c.JSON(http.StatusOK, gin.H{
		"items":      items,
		"total":      total,
		"paymentRef": paymentRef,
		"qrImageUrl": qrImageUrl, 
	})
}

// 3) อัปโหลดสลิป & ผูกหลายบิล
func UploadPaymentSlip(c *gin.Context) {
	db := config.DB()

	studentIDStr := c.PostForm("studentId")
	billIdsStr := c.PostForm("billIds")
	if studentIDStr == "" || billIdsStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ studentId และ billIds"})
		return
	}

	stuID64, _ := strconv.ParseUint(studentIDStr, 10, 64)
	stuID := uint(stuID64)

	// นักเรียน + ชั้น/ห้อง
	var stu entity.Student
	if err := db.Preload("Grade").First(&stu, stuID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียน"})
		return
	}
	gradeYear := "unknown"
	gradeClass := "unknown"
	if stu.Grade != nil {
		gradeYear = sanitizeFilename(stu.Grade.Grade_Year)
		gradeClass = fmt.Sprintf("room-%d", stu.Grade.Grade_Class)
	}
	studentFolder := sanitizeFilename(stu.Student_ID)

	// โฟลเดอร์: uploads/payments/<ชั้น>/<ห้อง>/<student>
	base := filepath.Join("uploads", "payments", gradeYear, gradeClass, studentFolder)
	if err := os.MkdirAll(base, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างโฟลเดอร์ไม่สำเร็จ"})
		return
	}

	// รับไฟล์
	fh, err := c.FormFile("slip")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์สลิป"})
		return
	}
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".pdf": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "อนุญาตเฉพาะ JPG/PNG/PDF"})
		return
	}
	newName := sanitizeFilename(fmt.Sprintf("%s_%s%s", time.Now().Format("20060102_150405"), uuid.NewString()[:8], ext))
	dst := filepath.Join(base, newName)
	if err := c.SaveUploadedFile(fh, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์ไม่สำเร็จ"})
		return
	}

	// แปลง billIds
	var billIDs []uint
	for _, s := range strings.Split(billIdsStr, ",") {
		if n, err := strconv.Atoi(strings.TrimSpace(s)); err == nil && n > 0 {
			billIDs = append(billIDs, uint(n))
		}
	}
	if len(billIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "billIds ไม่ถูกต้อง"})
		return
	}

	// รวมยอด
	var bills []entity.Bill
	if err := db.Preload("Tuition").Find(&bills, billIDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงบิลไม่สำเร็จ"})
		return
	}
	total := 0
	for _, b := range bills {
		if b.Tuition != nil {
			total += b.Tuition.AmountTuition
		}
	}

	// บันทึก payment + ผูกหลายบิล
	err = db.Transaction(func(tx *gorm.DB) error {
		p := entity.Payment{
			SlipPath: dst,
			DateTime: time.Now(),
			Amount:   total,
			Status:   entity.Waitting,
		}
		if err := tx.Create(&p).Error; err != nil {
			return err
		}
		for _, b := range bills {
			if err := tx.Create(&entity.Payment_Bill{
				PaymentID: &p.ID,
				BillID:    &b.ID,
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกการชำระเงินไม่สำเร็จ: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "อัปโหลดสลิปแล้ว: รอตรวจสอบ",
		"path":    dst,
	})
}

// 4) คืนตัวเลือกค่าเทอมตามชั้นปี + เทอมในปีที่ระบุ (ใช้บนหน้าเลือกเทอมจะจ่าย)
// GET /payments/options/:student_id?year=2568
func GetStudentTuitionOptions(c *gin.Context) {
	db := config.DB()

	// 1) นักเรียน + เกรด
	sidStr := c.Param("student_id")
	var stu entity.Student
	if err := db.Preload("Grade").First(&stu, sidStr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียน"})
		return
	}
	if stu.Grade == nil || stu.Grade.Grade_Year == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ยังไม่ผูกชั้นปีให้กับนักเรียน"})
		return
	}
	gradeYear := normalizeGradeYear(stu.Grade.Grade_Year)

	// 2) ปีการศึกษา (default = ปีไทยปัจจุบัน)
	yearParam := c.Query("year")
	academicYear := 0
	if yearParam == "" {
		academicYear = time.Now().Year() + 543
	} else {
		if y, err := strconv.Atoi(yearParam); err == nil {
			academicYear = y
		} else {
			academicYear = time.Now().Year() + 543
		}
	}

	// 3) เทอมของปีนั้น
	var terms []entity.Term
	if err := db.Where("academic_year = ?", academicYear).
		Order("semester ASC").
		Find(&terms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงเทอมไม่สำเร็จ"})
		return
	}
	if len(terms) == 0 {
		c.JSON(http.StatusOK, TuitionOptionsResp{
			StudentID: stu.ID,
			GradeYear: gradeYear,
			Options:   []TuitionOption{},
		})
		return
	}

	// 4) ประกบ tuition + สถานะบิล
	options := make([]TuitionOption, 0, len(terms))
	for _, t := range terms {
		var tuition entity.Tuition
		if err := db.Where("grade_year = ? AND term_id = ?", gradeYear, t.ID).
			First(&tuition).Error; err != nil {
			continue // ไม่มีเรตราคา → ข้าม
		}

		// เช็คบิลเดิม
		var bill entity.Bill
		uiStatus := "ยังไม่สร้างบิล"
		var billID *uint = nil

		if err := db.Where("student_id = ? AND term_id = ?", stu.ID, t.ID).
			First(&bill).Error; err == nil {
			billID = &bill.ID
			switch bill.StatusBill {
			case entity.Paid:
				uiStatus = "ชำระแล้ว"
			default:
				if w, _ := countWaiting(db, bill.ID); w > 0 {
					uiStatus = "รอตรวจสอบ"
				} else {
					uiStatus = "ยังไม่ชำระ"
				}
			}
		}

		options = append(options, TuitionOption{
			TermID:       t.ID,
			AcademicYear: t.Academic_year,
			Semester:     t.Semester,
			TuitionID:    tuition.ID,
			Title:        tuition.Title,
			Amount:       tuition.AmountTuition,
			BillID:       billID,
			UIStatus:     uiStatus,
		})
	}

	c.JSON(http.StatusOK, TuitionOptionsResp{
		StudentID: stu.ID,
		GradeYear: gradeYear,
		Options:   options,
	})
}

// 5) อนุมัติ/ตีกลับสลิป
func VerifyPayment(c *gin.Context) {
	db := config.DB()

	id := c.Param("id")
	var body verifyReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		var p entity.Payment
		if err := tx.First(&p, id).Error; err != nil {
			return err
		}

		if body.Approve {
			p.Status = entity.Complete
		} else {
			p.Status = entity.Waitting
		}
		if err := tx.Save(&p).Error; err != nil {
			return err
		}

		var rels []entity.Payment_Bill
		if err := tx.Where("payment_id = ?", p.ID).Find(&rels).Error; err != nil {
			return err
		}

		for _, r := range rels {
			var b entity.Bill
			if err := tx.Preload("Tuition").First(&b, r.BillID).Error; err != nil {
				return err
			}
			approved, err := sumApproved(tx, b.ID)
			if err != nil {
				return err
			}
			target := 0
			if b.Tuition != nil {
				target = b.Tuition.AmountTuition
			}
			if approved >= target && b.StatusBill != entity.Paid {
				b.StatusBill = entity.Paid
				if err := tx.Save(&b).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "verify ล้มเหลว: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตสถานะแล้ว"})
}
