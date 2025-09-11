package main

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/controllers"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8088"

func main() {
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())
	// r.Use(middlewares.Authorizes())

	router := r.Group("/")
	router.Use(middlewares.Authorizes())
	
	{
		// student
		router.GET("/students/:user_id", controllers.GetStudentAllById) //ดึงข้อมูลนักเรียน
		

		// router.GET("/student/:id", controllers.GetNameStudentById)
		router.GET("/students/schedule",controllers.GetStudentSchedule) 


		router.POST("/studentAdd", controllers.AddStudent)                // สร้างนักเรียน (JSON + base64/dataURL สำหรับรูป)
		router.PUT("/student/:id", controllers.UpdateStudent)          // แก้ไขนักเรียนตาม PK id
		// List + ค้นหา + แบ่งหน้า + กรอง
		router.GET("/student", controllers.ListStudents)	// อ่านทีละคน (เลี่ยงชนกับ /students/:user_id เดิม)
		router.GET("/student/:id", controllers.GetStudentByID)		// รูป (มีแล้ว / หรือใส่ตามนี้ให้ชัวร์)
		router.GET("/student/:id/image", controllers.GetStudentImage)		
		router.DELETE("/students/:id", controllers.DeleteStudent)       // (ถ้ามีฟังก์ชัน) ลบนักเรียนตาม PK id

		//Guardian routes ผู้ปกครอง
		router.POST("/guardian-student", controllers.CreateGuardianProfile)
		router.GET("/guardian-student", controllers.ListGuardiansByStudent)    // ?student_id=123
		router.GET("/guardian-student/:id", controllers.GetGuardianLinkByID)
		router.PUT("/guardian-student/:id", controllers.UpdateGuardianLink)
		router.DELETE("/guardian-student/:id", controllers.DeleteGuardianLink)

		// Address routes (CRUD)
		router.POST("/addresses", controllers.CreateAddress)
		router.GET("/addresses", controllers.ListAddresses)
		router.GET("/addresses/:id", controllers.GetAddressByID)
		router.PUT("/addresses/:id", controllers.UpdateAddress)
		router.DELETE("/addresses/:id", controllers.DeleteAddress)

		// Teacher routes
		// router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teachers/:user_id",controllers.GetTeacherAllById)
		router.GET("/teachers/schedule",controllers.GetTeacherschedule)
		// router.GET("/teacher/:id", controllers.GetNameTeacherById)
		router.GET("/teachers", controllers.GetNameTeacherAll) //ดึงชื่อครูทั้งหมด

		// Admin routes
		router.GET("/admin/:id", controllers.GetNameAdminById)

		// Grade routes
		router.GET("/gradeyears", controllers.GetGradeYearAll)
		router.GET("/gradeclasses", controllers.GetGradeClassAll)
		router.GET("/gradeclassID", controllers.GetGradesByYearAndClass)

		router.GET("/grades", controllers.ListGrades)

		// New routes for terms and schedule
		router.GET("/terms", controllers.GetTermAll)

		// Schedule routes
		router.GET("/schedule-days", controllers.GetDaysAll)
		router.GET("/schedule-times-start", controllers.GetTimeSrartAll)
		router.GET("/schedule-times-end", controllers.GetTimeEndAll)
		router.GET("/schedule-get-id", controllers.GetSchedulesByID) //schedule-get-all?grade=2&term=1
		router.GET("/schedule-course/:id",controllers.GetCourse)
		router.POST("/schedules", controllers.CreateSchedule)
		router.DELETE("/schedules/:id",controllers.DeleteScheduleByID)

		// User type route
		router.GET("users/:id", controllers.GetUserTypeByID)

		// Province routes
		router.GET("/province", controllers.GetProvince)
		router.GET("/province/:id", controllers.GetProvinceById)

		// Thai_Province routes
		router.GET("/thaiprovince", controllers.GetThaiProvince)
		router.GET("/thaiprovince/:id", controllers.GetThaiProvinceById)

		// District routes
		router.GET("/district", controllers.GetDistrict)
		router.GET("/district/:id", controllers.GetDistrictById)

		// Thai_District routes
		router.GET("/thaidistrict", controllers.GetThaiDistrict)
		router.GET("/thaidistrict/:id", controllers.GetThaiDistrictById)

		// Thai_Subdistrict routes
		router.GET("/thaisubdistrict", controllers.GetThaiSubdistrict)
		router.GET("/thaisubdistrict/:id", controllers.GetThaiSubdistrictById)
		router.GET("/thaizipcode/:id", controllers.GetThaiZipcodeById)

		//Announcement routes
		router.POST("/new-announcement", controllers.CreateAnnouncement)
		// router.GET("/announcements", controllers.ListAnnouncements)
		// router.GET("/announcements/:id", controllers.GetAnnouncementByID)

		//Target Group routes
		router.GET("/targetgroup", controllers.GetTargetGroupAll)

		
		
		// Course routes
		router.GET("/subjectgroup", controllers.GetSubjectGroupAll)
		router.POST("/new-course", controllers.CreateCourse)
		// router.GET("/courses", controllers.ListCourses)
		// router.GET("/courses/:id", controllers.GetCourseByID)	
		// CreateAssignments routes
		router.POST("/assignments", controllers.CreateHomeWork)
		router.GET("/assignments/:id", controllers.GetAllAssignment)
		router.GET("/assignment/:id", controllers.GetAllAssignment)

		// ส่งงาน
		router.POST("/submit-assignment", controllers.AssignmentSubmit)
		
		// Teacher: Education Records (คะแนนนักเรียน)
		router.POST("/teacher/education-records", controllers.CreateEducationRecord)
		router.PUT("/teacher/education-records/:id", controllers.UpdateEducationRecord)
		router.DELETE("/teacher/education-records/:id", controllers.DeleteEducationRecord)
		router.GET("/teacher/education-records/:id", controllers.GetEducationRecordByID)
		router.GET("/teacher/education-records", controllers.ListEducationRecords)

		// Student self-view: นักเรียนดูคะแนนตัวเอง
		router.GET("/student/education-records", controllers.ListMyEducationRecords)
		router.GET("/student/education-records/:id", controllers.GetMyEducationRecordByID)
		router.GET("/student/education-record", controllers.GetMyEducationRecordByTermCourse)

		// Course routes
		router.GET("/courses", controllers.GetCourses)
		router.GET("/coursesall", controllers.GetCourseAll) //ดึงข้อมูลวิชาทั้งหมด
		
		// ✅ ดาวน์โหลดตาม id
		router.GET("/submissions/:id/download", controllers.DownloadSubmission)
	

	}


	// Login routes
	r.POST("/auth", controllers.LoginUser)
	// r.POST("/creator/auth", controllers.LoginUser)

	// Run the server go run main.go
	r.Run("localhost:" + PORT)

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}