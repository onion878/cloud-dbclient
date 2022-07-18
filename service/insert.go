package service

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"time"
	"utils"
)

func CreateAccount(accounts Account) bool {
	hash, err := bcrypt.GenerateFromPassword([]byte(accounts.Password), bcrypt.DefaultCost) //加密处理
	if err != nil {
		fmt.Println(err)
	}
	encodePWD := string(hash)
	accounts.Password = encodePWD
	accounts.Id = utils.NewKeyId()
	accounts.Created = LocalTime(time.Now())
	db := utils.GetDB()
	db.Table("accounts").Create(accounts)
	return true
}

func CreateConnection(client Client) Client {
	db := utils.GetDB()
	client.Id = utils.NewKeyId()
	client.Created = LocalTime(time.Now())
	client.Sorted = time.Now().UnixMilli()
	db.Table("clients").Create(client)
	return client
}
