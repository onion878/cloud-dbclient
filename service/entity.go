package service

import (
	"database/sql/driver"
	"fmt"
	"time"
)

type LocalTime time.Time

func (t *LocalTime) MarshalJSON() ([]byte, error) {
	tTime := time.Time(*t)
	return []byte(fmt.Sprintf("\"%v\"", tTime.Format("2006-01-02 15:04:05"))), nil
}

func (t LocalTime) Value() (driver.Value, error) {
	var zeroTime time.Time
	tlt := time.Time(t)
	//判断给定时间是否和默认零时间的时间戳相同
	if tlt.UnixNano() == zeroTime.UnixNano() {
		return nil, nil
	}
	return tlt, nil
}

func (t *LocalTime) Scan(v interface{}) error {
	if value, ok := v.(time.Time); ok {
		*t = LocalTime(value)
		return nil
	}
	return fmt.Errorf("can not convert %v to timestamp", v)
}

type Account struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Username  string    `json:'username'`
	Password  string    `json:'password'`
	Email     string    `json:"email"`
	AdminFlag bool      `json:"admin_flag"`
	Created   LocalTime `json:"created"`
}

type Client struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	Host      string    `json:"host"`
	Port      string    `json:"port"`
	User      string    `json:'user'`
	Pwd       string    `json:'pwd'`
	Db        string    `json:"db"`
	Remark    string    `json:"remark"`
	AccountId string    `json:"account_id"`
	Sorted    int64     `json:"sorted"`
	Created   LocalTime `json:"created"`
}

type CrudBaseApiConfig struct {
	Id       string    `json:'id'`
	Name     string    `json:'name'`
	OldId    string    `json:'old_id'`
	Describe string    `json:'describe'`
	Api      string    `json:'api'`
	Type     string    `json:'type'`
	Sorted   int64     `json:'sorted'`
	Version  string    `json:'version'`
	SystemId string    `json:'system_id'`
	Status   int       `json:'status'`
	Modify   LocalTime `json:'modify'`
}

type CrudBaseSqlConfig struct {
	Id       string    `json:'id'`
	ApiId    string    `json:'api_id'`
	OldId    string    `json:'old_id'`
	OldApiId string    `json:'old_api_id'`
	Type     string    `json:'type'`
	Step     int       `json:'step'`
	Sql      string    `json:'sql'`
	Key      string    `json:'key'`
	Params   string    `json:'params'`
	Config   string    `json:'config'`
	Headers  string    `json:'headers'`
	SystemId string    `json:'system_id'`
	Status   int       `json:'status'`
	Modify   LocalTime `json:'modify'`
}
