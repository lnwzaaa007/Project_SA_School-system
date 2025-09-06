package controllers

import (
	"net/http"
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type NameOnlyTeacher struct {
    ID          uint   `json:"id"`
    Teacher_ID string `json:"teacher_id"`
	TFirst_Name string `json:"tfirst_name"`
	TLast_Name  string `json:"tlast_name"`
    Qualification string `json:"qualification"`
}

func GetNameTeacher(c *gin.Context) {
	var teacher []entity.Teacher
	if err := config.DB().Raw("SELECT TFirst_Name,TLast_Name FROM Teacher").Find(&teacher).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, teacher)
}
// GET /teachers/:user_id    get all techer by user_id
func GetTeacherAllById(c *gin.Context) {
	id := c.Param("user_id") // รับ ID จาก URL param เช่น /students/:id
	var teacher entity.Teacher
	if err := config.DB().First(&teacher, "users_id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบครูที่มี ID นี้"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

// GET /NameTeacher/:id    get name techer by teacher id เรียกผ่าน id ครูไม่ใช่ user_id
func GetNameTeacherById(c *gin.Context) {
	var name NameOnlyTeacher
	id := c.Param("id")

	if err := config.DB().Table("teachers").
		Select("teacher_id,t_first_name,t_last_name,qualification").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}

// GET /teachers    get name techer all
func GetNameTeacherAll(c *gin.Context) {
    var names []NameOnlyTeacher
    if err := config.DB().Table("teachers").
        Select("id, teacher_id, t_first_name, t_last_name, qualification").
        Scan(&names).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "teachers not found"})
        return
    }
    c.JSON(http.StatusOK, names)
}



