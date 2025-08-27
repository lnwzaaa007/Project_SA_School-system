	
package config
import (
	"time"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

func mustDate(iso string) time.Time {
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		panic(err)
	}
	return t
}

func seedStudent(){
	db.Model(&entity.Student{}).Create([]entity.Student{
		{
			Student_ID:   "S660001",
			TitleTH:      entity.TitleNameTH("นาย"),
			TFirst_Name:  "นนทชัย",
			TLast_Name:   "ศิริพัฒน์",
			TitleENG:     entity.TitleNameENG("Mr."),
			EFirst_Name:  "Nonthachai",
			ELast_Name:   "Siriphat",
			Citizen_ID:   "1101700234567",
			Tel:          "0812345678",
			DateOfBirth:  mustDate("2007-03-14"),
			Gender:       entity.Gendertype("Male"),
			Nationality:  "Thai",
			Email:        "nonthachai.s650001@example.com",
			Religious:    "Buddhist",
			Student_image: nil,
			AddressID:    0,
			GradeID:      0,
			UsersID: 1,
		},
		{
			Student_ID:   "S660002",
			TitleTH:      entity.TitleNameTH("นาย"),
			TFirst_Name:  "ธนกร",
			TLast_Name:   "ชินวัตร",
			TitleENG:     entity.TitleNameENG("Mr."),
			EFirst_Name:  "Thanakorn",
			ELast_Name:   "Chinnawat",
			Citizen_ID:   "1101700234575",
			Tel:          "0890001122",
			DateOfBirth:  mustDate("2007-06-09"),
			Gender:       entity.Gendertype("Male"),
			Nationality:  "Thai",
			Email:        "thanakorn.s650009@example.com",
			Religious:    "Buddhist",
			Student_image: nil,
			AddressID:    0,
			GradeID:      0,
			UsersID: 2,
		},
	})
}

