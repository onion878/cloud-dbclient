package utils

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"time"
)

// db连接
var db *gorm.DB

func StartPool(props AppConfigProperties) {
	conn, err := gorm.Open(mysql.Open(props["username"]+":"+props["password"]+"@tcp("+props["url"]+")/"+props["database"]+"?charset=utf8&parseTime=True&loc=Local"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	if err != nil {
		log.Print(err.Error())
	}
	sqlDB, err := conn.DB()
	if err != nil {
		log.Print("connect db server failed.")
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Second * 600)
	db = conn
}

func GetDB() *gorm.DB {
	sqlDB, err := db.DB()
	if err != nil {
		fmt.Errorf("connect db server failed")
	}
	if err := sqlDB.Ping(); err != nil {
		sqlDB.Close()
	}
	return db.Debug()
}
