package config
import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"golang.org/x/crypto/bcrypt"
) 
// SeedUserType adds initial user types to the database

func seedUserType() {
	db.Model(&entity.UserType{}).Create([]entity.UserType{
		{UserType_Name: "Student", UserType_Prefix: "S"},
		{UserType_Name: "Teacher", UserType_Prefix: "T"},
		{UserType_Name: "Admin", UserType_Prefix: "A"},
	})
}


func seedUsers() {
	password, _ := bcrypt.GenerateFromPassword([]byte("123456"), 14)
	db.Model(&entity.Users{}).Create([]entity.Users{
		{
			Username: "S660001",
			Password: string(password),
			UserTypeID: 1,
		},
		{
			Username: "S660002",
			Password: string(password),
			UserTypeID: 1,
		},
		{
			Username: "T20001",
			Password: string(password),
			UserTypeID: 2,
		},
		{
			Username: "A0001",
			Password: string(password),
			UserTypeID: 3,
		},
		
	})
}
