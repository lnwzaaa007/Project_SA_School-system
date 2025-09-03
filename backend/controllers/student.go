package controllers

import (
    "net/http"
    "strconv"
    "time"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type NameOnly struct {
    Student_ID string `json:"student_id"`
    TFirst_Name string `json:"t_first_name"`
    TLast_Name  string `json:"t_last_name"`
}

func GetStudentAllById(c *gin.Context) {
	id := c.Param("user_id") // รับ ID จาก URL param เช่น /students/:id
	var student entity.Student
	if err := config.DB().First(&student, "users_id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียนที่มี ID นี้"})
		return
	}
	c.JSON(http.StatusOK, student)
}

// // GET /NameStudent/:id
// func GetNameStudentById(c *gin.Context) {
// 	var name NameOnly
// 	id := c.Param("id")

// 	if err := config.DB().Table("students").
// 		Select("student_id,t_first_name, t_last_name").
// 		Where("users_id = ?", id).
// 		Scan(&name).Error; err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, name)
// }

func GetStudentSchedule (c *gin.Context){
    //อยากให้เอาเวลาปัจจุบันไปเช็คในตาราง term ว่าปัจจุบันอยู่เทอมไหน ให้ดึงปีการศึกษาเทอมที่อยู่ในช่วงเวลานั้นออกมา แล้วเอาไอดีไปค้นหาในตาราง schedule และ รับ grade_id มาค้นหาด้วย
    // รับ grade_id จาก query string เช่น /student/schedule?grade_id=1
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

    // จัดรูปแบบข้อมูลตอบกลับให้เหมือนกับ ScheduleResponse ที่ใช้ในหน้าตารางเรียน
    type ScheduleResponse struct {
        ID            int     `json:"id"`
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

