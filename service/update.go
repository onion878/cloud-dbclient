package service

import (
	"encoding/json"
	"time"
	"utils"
)

func UpdateConfig(param map[string]interface{}) bool {
	db := utils.GetDB()
	var idCache = make(map[string]string)
	var apiList []map[string]interface{}
	var sqlList []map[string]interface{}
	var systemId = param["systemId"].(string)
	resByre, _ := json.Marshal(param["api"])
	json.Unmarshal(resByre, &apiList)
	r, _ := json.Marshal(param["sql"])
	json.Unmarshal(r, &sqlList)
	for _, a := range apiList {
		var api CrudBaseApiConfig
		resByre, _ := json.Marshal(a)
		json.Unmarshal(resByre, &api)
		api.OldId = api.Id + ""
		api.Id = utils.NewKeyId()
		idCache[api.OldId] = api.Id
		api.Status = 1
		api.Name = a["name"].(string)
		api.Version = a["version"].(string)
		api.Type = a["type"].(string)
		api.SystemId = systemId
		api.Modify = LocalTime(time.Unix(int64(a["modify"].(float64)), 0))
		db.Exec("update crud_base_api_config set status = 0  where system_id = ? and old_id = ?", systemId, api.OldId)
		db.Table("crud_base_api_config").Create(&api)
	}
	for _, a := range sqlList {
		var sql CrudBaseSqlConfig
		r, _ := json.Marshal(a)
		json.Unmarshal(r, &sql)
		sql.OldId = sql.Id + ""
		sql.OldApiId = sql.ApiId + ""
		sql.ApiId = idCache[sql.OldApiId]
		sql.Id = utils.NewKeyId()
		sql.Status = 1
		sql.SystemId = systemId
		sql.Sql = a["sql"].(string)
		sql.Type = a["type"].(string)
		sql.Modify = LocalTime(time.Unix(int64(a["modify"].(float64)), 0))
		db.Exec("update crud_base_sql_config set status = 0  where system_id = ? and old_id = ?", systemId, sql.OldId)
		db.Table("crud_base_sql_config").Create(&sql)
	}
	return true
}
