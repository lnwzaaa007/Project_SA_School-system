package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type NameOnlyAdmin struct {
    Admin_ID string `json:"admin_id"`
	TFirst_Name string `json:"t_first_name"`
	TLast_Name  string `json:"t_last_name"`
}

// func GetNameAdmin(c *gin.Context) {
// 	var teacher []entity.Admin_User
// 	if err := config.DB().Raw("SELECT TFirst_Name,TLast_Name FROM Teacher").Find(&teacher).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, teacher)
// }

// GET /NameAdmin/:id
func GetNameAdminById(c *gin.Context) {
	var name NameOnlyAdmin
	id := c.Param("id")

	if err := config.DB().Table("admin_users").
		Select("admin_id,t_first_name,t_last_name").
		Where("users_id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}


