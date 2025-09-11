package controllers

import (
    "fmt"
    "net/http"
    "sort"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// Admin-facing listing of payment slips waiting for review (or completed)
// GET /payments?status=waiting|complete (default: waiting)
// Optional: limit, offset
type paymentBillItem struct {
    BillID uint   `json:"billId"`
    Title  string `json:"title"`
    Amount int    `json:"amount"`
}

type paymentAdminItem struct {
    ID       uint                 `json:"id"`
    DateTime time.Time           `json:"dateTime"`
    Amount   int                  `json:"amount"`
    Status   entity.Statuspayment `json:"status"`
    SlipURL  string               `json:"slipUrl"`
    Student  *struct {
        ID        uint   `json:"id"`
        StudentID string `json:"student_id"`
        NameTH    string `json:"name_th"`
    } `json:"student,omitempty"`
    Bills []paymentBillItem `json:"bills"`
}

func ListPaymentSlipsForAdmin(c *gin.Context) {
    db := config.DB()

    // Parse query params
    statusParam := strings.ToLower(strings.TrimSpace(c.Query("status")))
    status := entity.Waitting
    if statusParam == "complete" || statusParam == "approved" || statusParam == "success" {
        status = entity.Complete
    }
    limit := 50
    offset := 0
    if v := c.Query("limit"); v != "" {
        if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 200 {
            limit = n
        }
    }
    if v := c.Query("offset"); v != "" {
        if n, err := strconv.Atoi(v); err == nil && n >= 0 {
            offset = n
        }
    }

    var payments []entity.Payment
    if err := db.Where("status = ?", status).
        Order("created_at DESC").
        Limit(limit).Offset(offset).
        Find(&payments).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "list payments failed: " + err.Error()})
        return
    }

    resp := make([]paymentAdminItem, 0, len(payments))
    for _, p := range payments {
        item := paymentAdminItem{
            ID:       p.ID,
            DateTime: p.DateTime,
            Amount:   p.Amount,
            Status:   p.Status,
            SlipURL:  "/" + strings.ReplaceAll(p.SlipPath, "\\", "/"),
            Bills:    []paymentBillItem{},
        }

        // Load related bills
        var rels []entity.Payment_Bill
        if err := db.Where("payment_id = ?", p.ID).Find(&rels).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "load relations failed: " + err.Error()})
            return
        }

        // To capture student, use the first bill's student
        var studentSet bool
        for _, r := range rels {
            var b entity.Bill
            if err := db.Preload("Tuition").Preload("Student").First(&b, r.BillID).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "load bill failed: " + err.Error()})
                return
            }
            // Append bill summary
            title := fmt.Sprintf("Invoice #%d", b.ID)
            amt := 0
            if b.Tuition != nil {
                title = b.Tuition.Title
                amt = b.Tuition.AmountTuition
            }
            item.Bills = append(item.Bills, paymentBillItem{BillID: b.ID, Title: title, Amount: amt})

            if !studentSet && b.Student != nil {
                s := b.Student
                full := strings.TrimSpace(strings.TrimSpace(s.TFirst_Name) + " " + strings.TrimSpace(s.TLast_Name))
                item.Student = &struct {
                    ID        uint   `json:"id"`
                    StudentID string `json:"student_id"`
                    NameTH    string `json:"name_th"`
                }{ID: s.ID, StudentID: s.Student_ID, NameTH: full}
                studentSet = true
            }
        }

        // Sort bills by id asc for stable display
        sort.Slice(item.Bills, func(i, j int) bool { return item.Bills[i].BillID < item.Bills[j].BillID })

        resp = append(resp, item)
    }

    c.JSON(http.StatusOK, resp)
}

// List payments of a student with status codes for student UI
// GET /payments/student/:id
type studentPaymentItem struct {
    ID         uint              `json:"id"`
    DateTime   time.Time         `json:"dateTime"`
    Amount     int               `json:"amount"`
    Status     entity.Statuspayment `json:"status"`
    StatusCode string            `json:"statusCode"` // WAITING | COMPLETE | REJECTED
    SlipURL    string            `json:"slipUrl"`
    Bills      []paymentBillItem `json:"bills"`
}

func ListStudentPayments(c *gin.Context) {
    db := config.DB()
    sid := c.Param("id")
    if sid == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "student id required"})
        return
    }

    // find payment IDs linked to student's bills
    type Row struct{ PaymentID uint }
    var rows []Row
    if err := db.Table("payment_bills pb").
        Select("DISTINCT pb.payment_id as payment_id").
        Joins("JOIN bills b ON b.id = pb.bill_id").
        Where("b.student_id = ?", sid).
        Order("pb.payment_id DESC").
        Scan(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed: " + err.Error()})
        return
    }
    ids := make([]uint, 0, len(rows))
    for _, r := range rows { ids = append(ids, r.PaymentID) }

    var payments []entity.Payment
    if len(ids) > 0 {
        if err := db.Where("id IN ?", ids).Order("created_at DESC").Find(&payments).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "load payments failed: " + err.Error()})
            return
        }
    }

    resp := make([]studentPaymentItem, 0, len(payments))
    for _, p := range payments {
        it := studentPaymentItem{
            ID:       p.ID,
            DateTime: p.DateTime,
            Amount:   p.Amount,
            Status:   p.Status,
            SlipURL:  "/" + strings.ReplaceAll(p.SlipPath, "\\", "/"),
            Bills:    []paymentBillItem{},
        }
        switch string(p.Status) {
        case string(entity.Waitting):
            it.StatusCode = "WAITING"
        case string(entity.Complete):
            it.StatusCode = "COMPLETE"
        case "Rejected":
            it.StatusCode = "REJECTED"
        default:
            it.StatusCode = "UNKNOWN"
        }

        var rels []entity.Payment_Bill
        if err := db.Where("payment_id = ?", p.ID).Find(&rels).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "load relations failed: " + err.Error()})
            return
        }
        for _, r := range rels {
            var b entity.Bill
            if err := db.Preload("Tuition").First(&b, r.BillID).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "load bill failed: " + err.Error()})
                return
            }
            title := fmt.Sprintf("Invoice #%d", b.ID)
            amt := 0
            if b.Tuition != nil { title = b.Tuition.Title; amt = b.Tuition.AmountTuition }
            it.Bills = append(it.Bills, paymentBillItem{BillID: b.ID, Title: title, Amount: amt})
        }
        sort.Slice(it.Bills, func(i, j int) bool { return it.Bills[i].BillID < it.Bills[j].BillID })
        resp = append(resp, it)
    }

    c.JSON(http.StatusOK, resp)
}
