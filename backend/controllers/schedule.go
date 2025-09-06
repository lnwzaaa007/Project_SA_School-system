package controllers

import (

	"net/http"
	"strings"
	"gorm.io/gorm"
	"strconv"
	"time"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// post /บันทึกข้อมูลลงฐานข้อมูล
type gradeInput struct {
	entity.Schedules
	GradeYear  string `json:"grade_year"`
	GradeClass int    `json:"grade_class"`
}

// จัดรูปแบบข้อมูลตอบกลับให้เหมือนกับ ScheduleResponse ที่ใช้ในหน้าตารางเรียน
type ScheduleResponse struct {
	ID            int     `json:"id_schedule"`
	Day           string  `json:"day"`
	StartTime     string  `json:"start_time"`
	EndTime       string  `json:"end_time"`
	CourseName    string  `json:"course_name"`
	CourseCode    string  `json:"course_code"`
	CreditNum     float32 `json:"credit_num"`
	ClassInWeek   int     `json:"class_in_week"`
	HoursOfTerm   int     `json:"hours_of_term"`
	Subject_Group string  `json:"subject_group"`
	TeacherName   string  `json:"teacher_name"`
	GradeYeaer    string  `json:"grade_year"`
	Grade_Class   int     `json:"grade_class"`
}
//get /course
type CourseResponse struct {
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



//บันทึกตารางเรียน
func CreateSchedule(c *gin.Context) {
	var input gradeInput

	// 1) bind
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2) validate พื้นฐาน
	if input.GradeYear == "" || input.GradeClass == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุชั้นปีและห้อง"})
		return
	}

	// หา GradeID
	var grade entity.Grade
	if err := config.DB().
		Where("grade_year = ? AND grade_class = ?", input.GradeYear, input.GradeClass).
		First(&grade).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบระดับชั้นนี้ในระบบ"})
		return
	}

	// 3) เตรียม schedule
	s := input.Schedules
	s.GradeID = grade.ID

	// เช็คความครบถ้วน
	if s.CourseID == 0 || s.DayID == 0 || s.TeacherID == 0 ||
		s.TimeStartID == 0 || s.TimeEndID == 0 || s.TermID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
		return
	}
	// เช็คช่วงเวลาเริ่ม-สิ้นสุด
	if s.TimeStartID >= s.TimeEndID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด"})
		return
	}

	db := config.DB()

	// 4) ตรวจ “ครูชนคาบ” (ครูเดียวกัน, วันเดียวกัน, เทอมเดียวกัน, ทับช่วงเวลา กับห้องใดๆ ก็ห้าม)
	// เงื่อนไขซ้อนทับ: new_start < exist_end AND new_end > exist_start
	var cnt int64
	if err := db.Model(&entity.Schedules{}).
		Where("term_id = ? AND day_id = ? AND teacher_id = ?", s.TermID, s.DayID, s.TeacherID).
		Where("time_start_id < ? AND time_end_id > ?", s.TimeEndID, s.TimeStartID).
		Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบตารางครูล้มเหลว"})
		return
	}
	if cnt > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "เวลานี้ครูสอนวิชาอื่นอยู่แล้ว"})
		return
	}

	// 5) ตรวจ “ห้อง/ชั้นชนคาบ” (grade เดียวกัน, วันเดียวกัน, เทอมเดียวกัน, ทับช่วงเวลา)
	cnt = 0
	if err := db.Model(&entity.Schedules{}).
		Where("term_id = ? AND day_id = ? AND grade_id = ?", s.TermID, s.DayID, s.GradeID).
		Where("time_start_id < ? AND time_end_id > ?", s.TimeEndID, s.TimeStartID).
		Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบตารางห้องล้มเหลว"})
		return
	}
	if cnt > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "เวลานี้มีคาบอื่นในห้องนี้อยู่แล้ว"})
		return
	}

	// 6) บันทึก
	if err := db.Create(&s).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกตารางเรียนได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": s})
}/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




func GetSchedulesByID(c *gin.Context) {
	var schedules []entity.Schedules
	var responses []ScheduleResponse

	// รับค่า query parameters
	gradeID := c.Query("grade")
	classID := c.Query("class")
	termID := c.Query("term")

	// ตรวจสอบว่าครบทุกพารามิเตอร์หรือไม่
	if gradeID == "" || termID == "" || classID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade, class และ term"})
		return
	}

	// ดึงข้อมูลจากฐานข้อมูล พร้อม Preload ตารางที่เกี่ยวข้อง
	if err := config.DB().
		Joins("JOIN grades ON grades.id = schedules.grade_id").
		Preload("Days").
		Preload("Course").
		Preload("Course.Subject_Group").
		Preload("Teacher").
		Preload("TimeStart").
		Preload("TimeEnd").
		Preload("Grade").
		Preload("Term").
		Where("grades.grade_year = ? AND grades.grade_class = ? AND schedules.term_id = ?", gradeID, classID, termID).
		Find(&schedules).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	// map -> response struct
	for _, s := range schedules {

		subjectGroupName := ""
		if s.Course != nil && s.Course.Subject_Group != nil {
			subjectGroupName = s.Course.Subject_Group.SubjectGroup_Name
		}
		
		// fmt.Print(s.Course)
		res := ScheduleResponse{
			ID: 		   int(s.ID),		
			Day:           s.Days.ThaiDay,
			StartTime:     s.TimeStart.Period,
			EndTime:       s.TimeEnd.Period,
			CourseName:    s.Course.Course_Name,
			CourseCode:    s.Course.Course_Code,
			CreditNum:     s.Course.Credit_Num,
			ClassInWeek:   s.Course.Class_in_week,
			HoursOfTerm:   s.Course.Hours_of_term,
			Subject_Group: subjectGroupName,
			GradeYeaer:    s.Grade.Grade_Year,
			Grade_Class:   s.Grade.Grade_Class,
			TeacherName:       s.Teacher.TFirst_Name + " " + s.Teacher.TLast_Name,
		}
		responses = append(responses, res)
	}
	c.JSON(http.StatusOK, gin.H{"data": responses})
}/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


func GetCourse(c *gin.Context) {
code := strings.ToUpper(strings.TrimSpace(c.Param("id")))
    if code == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุรหัสวิชา"})
        return
    }

    var course entity.Course
    if err := config.DB().
        Where("UPPER(course_code) = ?", code).
        Preload("Subject_Group").
        Preload("Teacher").
        First(&course).Error; err != nil {

        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบรายวิชานี้"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    resp := CourseResponse{
        ID:          int(course.ID),
        CourseCode:  course.Course_Code,
        CourseName:  course.Course_Name,
        CreditNum:   course.Credit_Num,
        ClassInWeek: course.Class_in_week,
        HoursOfTerm: course.Hours_of_term,
    }
    if course.Subject_Group != nil {
        resp.Subject_Group = course.Subject_Group.SubjectGroup_Name
    }
    if course.Teacher != nil {
        // title := fmt.Sprintf("%v", course.Teacher.TitleTH) // กันกรณี TitleTH เป็น enum/typed
        resp.TeacherName = strings.TrimSpace(strings.Join(
			[]string{course.Teacher.TFirst_Name, course.Teacher.TLast_Name}, " ",
		))
		resp.TercherID = int(course.Teacher.ID);
    }

    c.JSON(http.StatusOK, gin.H{"data": resp})
}/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//ลบวิชาในคาบด้วย id shdules
func DeleteScheduleByID(c *gin.Context) {
	schdule_id := c.Param("id")
	id, err := strconv.Atoi(schdule_id)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	tx := config.DB().Where("id = ?", id).Delete(&entity.Schedules{})
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}
	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบรายวิชาสำเร็จ",
		"deleted": tx.RowsAffected,
	})
}/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



func GetStudentSchedule (c *gin.Context){
    gradeIDStr := c.Query("grade_id")
    if gradeIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade_id"})
        return
    }
    gradeID, err := strconv.Atoi(gradeIDStr)
    if err != nil || gradeID <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "grade_id ไม่ถูกต้อง"})
        return
    }

    // หาเทอมปัจจุบันจากเวลาขณะนี้
    now := time.Now()
    var term entity.Term
    if err := config.DB().
        Where("start_date <= ? AND end_date >= ?", now, now).
        First(&term).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเทอมปัจจุบัน"})
        return
    }

    // ดึงตารางเรียนของ grade_id ที่อยู่ในเทอมปัจจุบัน
    var schedules []entity.Schedules
    if err := config.DB().
        Preload("Days").
        Preload("Course").
        Preload("Course.Subject_Group").
        Preload("Teacher").
        Preload("TimeStart").
        Preload("TimeEnd").
        Preload("Grade").
        Where("term_id = ? AND grade_id = ?", term.ID, gradeID).
        Find(&schedules).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }


    responses := make([]ScheduleResponse, 0, len(schedules))
    for _, s := range schedules {
        subjectGroupName := ""
        if s.Course != nil && s.Course.Subject_Group != nil {
            subjectGroupName = s.Course.Subject_Group.SubjectGroup_Name
        }

        resp := ScheduleResponse{
            ID:            int(s.ID),
            Day:           s.Days.ThaiDay,
            StartTime:     s.TimeStart.Period,
            EndTime:       s.TimeEnd.Period,
            CourseName:    s.Course.Course_Name,
            CourseCode:    s.Course.Course_Code,
            CreditNum:     s.Course.Credit_Num,
            ClassInWeek:   s.Course.Class_in_week,
            HoursOfTerm:   s.Course.Hours_of_term,
            Subject_Group: subjectGroupName,
            TeacherName:   s.Teacher.TFirst_Name + " " + s.Teacher.TLast_Name,
        }
        if s.Grade != nil {
            resp.GradeYeaer = s.Grade.Grade_Year
            resp.Grade_Class = s.Grade.Grade_Class
        }
        responses = append(responses, resp)
    }

    c.JSON(http.StatusOK, gin.H{"data": responses, "term_id": term.ID, "semester": term.Semester, "academic_year": term.Academic_year})
}//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//get ตารางสอนครู
func GetTeacherschedule(c *gin.Context){
	teacher_id := c.Query("teacher_id")
    if teacher_id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade_id"})
        return
    }
    // gradeID, err := strconv.Atoi(teacher_id)
    // if err != nil || gradeID <= 0 {
    //     c.JSON(http.StatusBadRequest, gin.H{"error": "grade_id ไม่ถูกต้อง"})
    //     return
    // }

    // หาเทอมปัจจุบันจากเวลาขณะนี้
    now := time.Now()
    var term entity.Term
    if err := config.DB().
        Where("start_date <= ? AND end_date >= ?", now, now).
        First(&term).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเทอมปัจจุบัน"})
        return
    }

    // ดึงตารางเรียนของ grade_id ที่อยู่ในเทอมปัจจุบัน
    var schedules []entity.Schedules
    if err := config.DB().
        Preload("Days").
        Preload("Course").
        Preload("Course.Subject_Group").
        Preload("Teacher").
        Preload("TimeStart").
        Preload("TimeEnd").
        Preload("Grade").
        Where("term_id = ? AND teacher_id = ? ",term.ID,teacher_id).
        Find(&schedules).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    responses := make([]ScheduleResponse, 0, len(schedules))
    for _, s := range schedules {
        subjectGroupName := ""
        if s.Course != nil && s.Course.Subject_Group != nil {
            subjectGroupName = s.Course.Subject_Group.SubjectGroup_Name
        }

        resp := ScheduleResponse{
            ID:            int(s.ID),
            Day:           s.Days.ThaiDay,
            StartTime:     s.TimeStart.Period,
            EndTime:       s.TimeEnd.Period,
            CourseName:    s.Course.Course_Name,
            CourseCode:    s.Course.Course_Code,
            CreditNum:     s.Course.Credit_Num,
            ClassInWeek:   s.Course.Class_in_week,
            HoursOfTerm:   s.Course.Hours_of_term,
            Subject_Group: subjectGroupName,
            TeacherName:   s.Teacher.TFirst_Name + " " + s.Teacher.TLast_Name,
        }
        if s.Grade != nil {
            resp.GradeYeaer = s.Grade.Grade_Year
            resp.Grade_Class = s.Grade.Grade_Class
        }
        responses = append(responses, resp)
    }

    c.JSON(http.StatusOK, gin.H{"data": responses, "term_id": term.ID, "semester": term.Semester, "academic_year": term.Academic_year})
}