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
	r.MaxMultipartMemory = 32 << 20

    // ให้เสิร์ฟไฟล์ในโฟลเดอร์ ./uploads เป็น static
    r.Static("/uploads", "./uploads")
	r.POST("/enrollments", controllers.CreateEnrollment)
	router := r.Group("/")
	router.Use(middlewares.Authorizes())
	
	{
		// student
		router.GET("/students/:user_id", controllers.GetStudentAllById) //ดึงข้อมูลนักเรียน
		

		// router.GET("/student/:id", controllers.GetNameStudentById)
		
		router.POST("/studentAdd", controllers.AddStudent)                // สร้างนักเรียน (JSON + base64/dataURL สำหรับรูป)
		router.PUT("/student/:id", controllers.UpdateStudent)          // แก้ไขนักเรียนตาม PK id
		router.GET("/student/:id/image", controllers.GetStudentImage)  // ดึงรูปนักเรียน (ไบต์จาก BLOB)
		// router.DELETE("/students/:id", control..lers.DeleteStudent)       // (ถ้ามีฟังก์ชัน) ลบนักเรียนตาม PK id
		
		// Teacher routes
		// router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teachers/:user_id",controllers.GetTeacherAllById)
		// router.GET("/teacher/:id", controllers.GetNameTeacherById)
		router.GET("/teachers", controllers.GetNameTeacherAll) //ดึงชื่อครูทั้งหมด
		
		// Admin routes
		router.GET("/admin/:id", controllers.GetNameAdminById)
		
		// Grade routes
		router.GET("/gradeyears", controllers.GetGradeYearAll)
		router.GET("/gradeclasses", controllers.GetGradeClassAll)
		router.GET("/gradeclassID", controllers.GetGradesByYearAndClass)
		
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
		router.GET("/students/schedule",controllers.GetStudentSchedule) 
		router.GET("/teachers/schedule",controllers.GetTeacherschedule)
		
		//Attendances routes
        router.GET("/attendances-course", controllers.GetCourseInSchedule)
        router.GET("/attendances-student", controllers.GetStudentAllByGradeId)
        router.POST("/attendances-record", controllers.CreateAttendance)
		router.GET("/attendances-history", controllers.GetAttendanceStudent)

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
		
		// Course routes
		router.GET("/courses", controllers.GetCourses)
		router.GET("/coursesall", controllers.GetCourseAll) //ดึงข้อมูลวิชาทั้งหมด
		
		// ✅ ดาวน์โหลดตาม id
		router.GET("/submissions/:id/download", controllers.DownloadSubmission)

		// // สมัครเรียน
		//  router.POST("/enrollments", controllers.CreateEnrollment)

		// gender
		router.GET("/gender", controllers.GetGender)
		router.GET("/gender/:id", controllers.GetGenderById)

		// title
		router.GET("/title", controllers.GetTitle)
		router.GET("/title/:id", controllers.GetTitleById)
	

	}


	// Login routes
	r.POST("/auth", controllers.LoginUser)
	// r.POST("/creator/auth", controllers.LoginUser)

	// Run the server go run main.go
	r.Run("localhost:" + PORT)
	// สมัครเรียน
	

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