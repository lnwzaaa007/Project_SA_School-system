package controllers

import (
	// "net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)
type result struct {
		Prefix string `json:"prefix"`
	}
func GetUserTypeByID(c *gin.Context) {
	id := c.Param("id")
	var data result

	err := config.DB().
		Model(&entity.Users{}).
		Select("user_types.user_type_prefix AS prefix").
		Joins("JOIN user_types ON user_types.id = users.user_type_id").
		Where("users.id = ?", id).
		Scan(&data).Error

	if err != nil {
		c.JSON(500, gin.H{"error": "query failed"})
		return
	}

	c.JSON(200, data)
}
