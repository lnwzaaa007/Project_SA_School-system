package main

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/controllers"
	// "github.com/lnwzaaa007/Project_SA_School-system/backend/middlewares"
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
	{
		// User routes
		router.GET("/student", controllers.GetNameStudent)
		router.GET("/student/:id", controllers.GetNameStudentById)

		// Teacher routes
		router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teacher/:id", controllers.GetNameTeacherById)

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

		// User type route
		router.GET("users/:id", controllers.GetUserTypeByID)

		// Province routes
		router.GET("/province", controllers.GetProvince)
		router.GET("/province/:id", controllers.GetProvinceById)

		// District routes
		router.GET("/district", controllers.GetDistrict)
		router.GET("/district/:id", controllers.GetDistrictById)

		// CreateAssignments routes
		router.POST("/assignments", controllers.CreateHomeWork)
		router.GET("/assignments/:id", controllers.GetAllAssignment)
		router.GET("/assignment/:id", controllers.GetAllAssignment)
		r.GET("/courses", controllers.GetCourses)

		// ส่งงาน
		router.POST("/submit-assignment", controllers.AssignmentSubmit)

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