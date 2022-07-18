package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"strconv"
	"time"
	"utils"
)

var dbCache = make(map[string]*gorm.DB)

func GetAccount(username string) (Account, error) {
	db := utils.GetDB()
	var account Account
	db.Table("accounts").Where("username=?", username).Take(&account)
	if len(account.Id) > 0 {
		return account, nil
	}
	return account, errors.New("用户不存在")
}

func Test() {
	db := utils.GetDB()
	var result map[string]interface{}
	params := map[string]interface{}{
		"id": "00179e6e-acc4-4a4f-b292-a79601746879",
	}
	db.Raw("select * from kb_course where id=@id", params).Find(&result)
	fmt.Printf("%v", result)
}

func GetSystemInfo(code string) map[string]interface{} {
	db := utils.GetDB()
	var result map[string]interface{}
	db.Table("crud_system").Where("code = ?", code).Find(&result)
	return result
}

func CheckModify(param map[string]interface{}) []interface{} {
	db := utils.GetDB()
	var api []map[string]interface{}
	var sql []map[string]interface{}
	db.Raw("select unix_timestamp(modify) as time,old_id as id from crud_base_api_config where system_id=@systemId and status=1", param).Scan(&api)
	db.Raw("select unix_timestamp(modify) as time,old_id as id,old_api_id as apiId from crud_base_sql_config where system_id=@systemId and status=1", param).Scan(&sql)
	var apiCache = map[string]int64{}
	var sqlCache = map[string]int64{}
	var sqlApiCache = map[string]string{}
	for _, c := range api {
		var id = c["id"].(string)
		var time = c["time"].(int64)
		apiCache[id] = time
	}
	for _, c := range sql {
		var id = c["id"].(string)
		var apiId = c["apiId"].(string)
		var time = c["time"].(int64)
		sqlCache[id] = time
		sqlApiCache[id] = apiId
	}

	var apiList []map[string]interface{}
	var sqlList []map[string]interface{}
	var apiCacheParam []interface{}

	resByre, _ := json.Marshal(param["api"])
	json.Unmarshal(resByre, &apiList)
	r, _ := json.Marshal(param["sql"])
	json.Unmarshal(r, &sqlList)

	for _, c := range apiList {
		var id = c["id"].(string)
		var time = int64(c["time"].(float64))
		if len(strconv.FormatInt(apiCache[id], 16)) == 0 || apiCache[id] < time {
			apiCacheParam = append(apiCacheParam, id)
		}
	}
	for _, c := range sqlList {
		var id = c["id"].(string)
		var time = int64(c["time"].(float64))
		if len(strconv.FormatInt(sqlCache[id], 16)) == 0 || sqlCache[id] < time {
			apiCacheParam = append(apiCacheParam, sqlApiCache[id])
		}
	}
	return apiCacheParam
}

func SyncModify(param map[string]interface{}) map[string]interface{} {
	db := utils.GetDB()

	var apiList []map[string]interface{}
	var sqlList []map[string]interface{}
	//var apiCacheParam []interface{}

	resByre, _ := json.Marshal(param["api"])
	json.Unmarshal(resByre, &apiList)
	r, _ := json.Marshal(param["sql"])
	json.Unmarshal(r, &sqlList)

	var apiCache = map[string]int64{}
	var sqlCache = map[string]int64{}

	for _, c := range apiList {
		var id = c["id"].(string)
		var time = int64(c["time"].(float64))
		apiCache[id] = time
	}
	for _, c := range sqlList {
		var id = c["id"].(string)
		var time = int64(c["time"].(float64))
		sqlCache[id] = time
	}

	var api []map[string]interface{}
	var sql []map[string]interface{}
	db.Raw("select unix_timestamp(modify) as time,old_id as id from crud_base_api_config where system_id=@systemId and status=1", param).Scan(&api)
	db.Raw("select unix_timestamp(modify) as time,old_id as id,old_api_id as apiId from crud_base_sql_config where system_id=@systemId and status=1", param).Scan(&sql)

	var apiCacheParam []interface{}
	var cache = make(map[string]bool)

	for _, c := range api {
		var id = c["id"].(string)
		var time = c["time"].(int64)
		if len(strconv.FormatInt(apiCache[id], 16)) == 0 || apiCache[id] < time {
			cache[id] = true
		}
	}
	for _, c := range sql {
		var id = c["id"].(string)
		var apiId = c["apiId"].(string)
		var time = c["time"].(int64)
		if len(strconv.FormatInt(sqlCache[id], 16)) == 0 || sqlCache[id] < time {
			cache[apiId] = true
		}
	}
	for k := range cache {
		apiCacheParam = append(apiCacheParam, k)
	}
	var apiResults []CrudBaseApiConfig
	var sqlResults []CrudBaseSqlConfig
	db.Table("crud_base_api_config").Where("system_id = ? and status = ? and old_id in (?)", param["systemId"], 1, apiCacheParam).Find(&apiResults)
	db.Table("crud_base_sql_config").Where("system_id = ? and status = ? and old_api_id in (?)", param["systemId"], 1, apiCacheParam).Find(&sqlResults)
	return map[string]interface{}{
		"api": apiResults,
		"sql": sqlResults,
	}
}

func TestConnect(client Client) (sql.Result, error) {
	conn, err := gorm.Open(mysql.Open(client.User+":"+client.Pwd+"@tcp("+client.Host+":"+client.Port+")/"+client.Db+"?charset=utf8&parseTime=True&loc=Local"), &gorm.Config{})
	if err != nil {
		log.Print("failed to connect database")
	}
	if err != nil {
		log.Print(err.Error())
	}
	sqlDB, err := conn.DB()
	if err != nil {
		log.Print("connect db server failed.")
	}
	result, err := sqlDB.Exec("select 1")
	sqlDB.Close()
	return result, err
}

func GetAllConnection() []Client {
	db := utils.GetDB()
	var clients []Client
	db.Table("clients").Order("sorted desc").Find(&clients)
	return clients
}

func OpenDB(id string) *gorm.DB {
	if dbCache[id] != nil {
		return dbCache[id].Debug()
	}
	db := utils.GetDB()
	var client Client
	db.Table("clients").Where("id=?", id).Take(&client)
	conn, err := gorm.Open(mysql.Open(client.User+":"+client.Pwd+"@tcp("+client.Host+":"+client.Port+")/"+client.Db+"?charset=utf8mb4&parseTime=True&loc=Local"), &gorm.Config{})
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

	if err := sqlDB.Ping(); err != nil {
		sqlDB.Close()
	}
	if err == nil {
		dbCache[client.Id] = conn
	}
	return conn
}

func GetDataBase(id string) []string {
	db := OpenDB(id)
	var list []string
	db.Raw("show databases").Scan(&list)
	return list
}

func GetTable(id string, scheme string) []string {
	db := OpenDB(id)
	var list []string
	db.Raw("select TABLE_NAME from information_schema.tables where table_schema=?", scheme).Scan(&list)
	return list
}

func GetColumn(id string, scheme string, table string) []map[string]any {
	db := OpenDB(id)
	var list []map[string]any
	db.Raw("select * from information_schema.COLUMNS where TABLE_SCHEMA=? and TABLE_NAME=? order by ORDINAL_POSITION", scheme, table).Scan(&list)
	return list
}

func GetData(data map[string]any) interface{} {
	db := OpenDB(data["id"].(string))
	var list []map[string]interface{}
	var total int64
	start := data["start"].(float64)
	limit := data["limit"].(float64)
	where := ""
	if data["where"] != nil {
		where = data["where"].(string)
	}
	order := ""
	if data["order"] != nil {
		order = data["order"].(string)
	}
	columns := GetColumn(data["id"].(string), data["scheme"].(string), data["table"].(string))
	colType := make(map[string]string)
	for i := range columns {
		colType[columns[i]["COLUMN_NAME"].(string)] = columns[i]["DATA_TYPE"].(string)
	}
	//where TABLE_SCHEMA='csc' and DATA_TYPE='bit' order by ORDINAL_POSITION
	sql := "select * from `" + data["scheme"].(string) + "`.`" + data["table"].(string) + "`"
	sqlTotal := "select count(0) from `" + data["scheme"].(string) + "`.`" + data["table"].(string) + "`"
	if len(where) > 0 {
		sql += " where " + where
		sqlTotal += " where " + where
	}
	if len(order) > 0 {
		sql += " order by " + order
	}
	err := db.Raw(sql+" limit ?,?", start, limit).Scan(&list).Error
	err = db.Raw(sqlTotal).Take(&total).Error
	for _, row := range list {
		for k, v := range row {
			if v != nil && (colType[k] == "datetime" || colType[k] == "timestamp") {
				row[k] = v.(time.Time).Format("2006-01-02 15:04:05")
			} else if v != nil && colType[k] == "bit" {
				b := []byte(v.(string))
				c := fmt.Sprint(b)[1:2]
				if c == "1" {
					row[k] = true
				} else {
					row[k] = false
				}
			} else if v != nil && colType[k] == "longblob" {
				b := []byte(v.(string))
				row[k] = "blob:" + fmt.Sprintln(len(b)) + "x" + fmt.Sprintln(cap(b))
			}
		}
	}
	if err != nil {
		return errors.New("SQL: " + sql + " <br> " + err.Error())
	}
	return utils.ReRows(list, total)
}
