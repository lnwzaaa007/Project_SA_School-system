package controllers

import (
    "net/http"
    // "strings"
    // "gorm.io/gorm"
    // "strconv"
    "time"
    // "errors"
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

type CourseScheduleResponse struct {
	ID            int     `json:"id"`
    CourseCode    string  `json:"course_code"`
    CourseName    string  `json:"course_name"`
    CreditNum     float32 `json:"credit_num"`
    ClassInWeek   int     `json:"class_in_week"`
    HoursOfTerm   int     `json:"hours_of_term"`
    Subject_Group string  `json:"subject_group"`
    TeacherName   string  `json:"teacher_name"`
	TercherID     int     `json:"teacher_id"`
}

func GetCourseInSchedule (c *gin.Context){
	var schedules []entity.Schedules
	var responses []CourseScheduleResponse

	// รับค่า query parameters
	gradeID := c.Query("grade")
	classID := c.Query("class")

	//ตรวจสอบว่ามีพารามิเตอร์ครบหรือไม่
	if(gradeID == "" || classID == "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": " กรุณาระบุ grade และ class"})
	}

	//ดึงข้มูลวิชาจาก ตารางเรียน
	if err := config.DB().
		Joins("JOIN grades ON grades.id = schedules.grade_id").
		Preload("Course").
		Preload("Course.Subject_Group").
		Preload("Teacher").
		Where("grades.grade_year = ? AND grades.grade_class = ? ", gradeID, classID).
		Find(&schedules).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	seenCourseIDs := make(map[uint]bool)
	for _, s := range schedules {

		if(s.Course == nil || seenCourseIDs[s.Course.ID]){
			continue //ข้ามถ้ามีรายวิชาแล้ว
		}

		subjectGroupName := ""
		if s.Course != nil && s.Course.Subject_Group != nil {
			subjectGroupName = s.Course.Subject_Group.SubjectGroup_Name
		}
		
		// fmt.Print(s.Course)
		res := CourseScheduleResponse{
			ID: 		   int(s.Course.ID),		
			CourseName:    s.Course.Course_Name,
			CourseCode:    s.Course.Course_Code,
			CreditNum:     s.Course.Credit_Num,
			ClassInWeek:   s.Course.Class_in_week,
			HoursOfTerm:   s.Course.Hours_of_term,
			Subject_Group: subjectGroupName,
			TeacherName:   s.Teacher.TFirst_Name + " " + s.Teacher.TLast_Name,
			TercherID: 	   int(s.Teacher.ID),
		}
		responses = append(responses, res)
		seenCourseIDs[s.Course.ID] = true
	}
	c.JSON(http.StatusOK, gin.H{"data": responses})


}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func GetStudentAllByGradeId(c *gin.Context) {
    // อ่าน query
    gradeYear := c.Query("grade")
    classID := c.Query("class")
    if gradeYear == "" || classID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade และ class"})
        return
    }

    // หา Grade record
    var grade entity.Grade
    if err := config.DB().
        Where("grade_year = ? AND grade_class = ?", gradeYear, classID).
        First(&grade).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบระดับชั้นนี้ในระบบ"})
        return
    }

    // ดึงรายชื่อนักเรียนทั้งหมดในห้อง (ใช้ grade.ID ไม่ใช่ทั้ง struct)
    var students []entity.Student
    if err := config.DB().
        Where("grade_id = ?", grade.ID).
        Find(&students).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    if len(students) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียนในห้องนี้"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": students})
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// POST /attendances
// รับรายการเช็กชื่อเป็นชุดสำหรับคาบ/ห้องหนึ่งคาบ
type CreateAttendanceRequest struct {
    SchedulesID uint `json:"schedules_id" binding:"required"`
    TeacherID   uint `json:"teacher_id" binding:"required"`
    GradeID     uint `json:"grade_id" binding:"required"`
    Date        string `json:"date"` // รูปแบบ YYYY-MM-DD ถ้าไม่ส่งจะใช่เวลาปัจจุบัน
    Items       []struct {
        StudentID           uint   `json:"student_id" binding:"required"`
        AttendanceStatusID  uint   `json:"attendance_status_id" binding:"required"`
        Note                string `json:"note"`
    } `json:"items" binding:"required"`
}

func CreateAttendance(c *gin.Context) {
    var req CreateAttendanceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if len(req.Items) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "items ว่าง"})
        return
    }

    // parse date: รองรับหลายรูปแบบ เช่น YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, RFC3339
    var attendDate time.Time
    if req.Date == "" {
        attendDate = time.Now()
    } else {
        var (
            parsed time.Time
            err    error
        )
        layouts := []string{
            "2006-01-02",
            "2006-01-02 15:04:05",
            time.RFC3339,
        }
        for _, layout := range layouts {
            parsed, err = time.Parse(layout, req.Date)
            if err == nil {
                attendDate = parsed
                break
            }
        }
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบวันที่ไม่ถูกต้อง (รองรับ YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, RFC3339)"})
            return
        }
    }

    // สร้าง slice สำหรับ bulk insert
    records := make([]entity.Attendances, 0, len(req.Items))
    for _, it := range req.Items {
        // ตรวจค่าเบื้องต้น
        if it.StudentID == 0 || it.AttendanceStatusID == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "student_id และ attendance_status_id ต้องมากกว่า 0"})
            return
        }
        rec := entity.Attendances{
            Attendances_Date:   attendDate,
            Note:               it.Note,
            AttendanceStatusID: it.AttendanceStatusID,
            SchedulesID:        req.SchedulesID,
            StudentID:          it.StudentID,
            TeacherID:          req.TeacherID,
            GradeID:            req.GradeID,
        }
        records = append(records, rec)
    }

    if err := config.DB().Create(&records).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "บันทึกการเช็กชื่อสำเร็จ", "count": len(records)})
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ดึงประวัติการเช็คชื่อ
func GetAttendanceStudent(c *gin.Context){

    scheduleID := c.Query("schedule_id")
	studentID := c.Query("student_id")
    if scheduleID == "" || studentID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ schedule_id และ student_id"})
        return
    }

    var attendance []entity.Attendances
    if err := config.DB().
        // Preload("AttendanceStatus").
        Where("schedules_id = ? AND student_id = ?", scheduleID, studentID).
        Order("attendances_date ASC").
        Find(&attendance).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบการเช็คชื่อ"})
        return
    }
    if len(attendance) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการเช็คชื่อ"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": attendance})
}