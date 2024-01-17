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

func SaveHistory(histories []TabHistory, accountId string) error {
	db := utils.GetDB()
	for i := range histories {
		histories[i].Id = utils.NewKeyId()
	}
	db.Where("account_id=?", accountId).Delete(&TabHistory{})
	if len(histories) > 0 {
		db.Create(histories)
	}
	return nil
}

func SaveExecHistory(histories ExecHistory) {
	db := utils.GetDB()
	histories.Id = utils.NewKeyId()
	histories.Created = LocalTime(time.Now())
	db.Create(histories)
}

func SaveSqlRecord(sqlRecord SqlRecord) error {
	db := utils.GetDB()
	sqlRecord.Id = utils.NewKeyId()
	sqlRecord.Created = LocalTime(time.Now())
	db.Create(sqlRecord)
	return nil
}
