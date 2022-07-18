package utils

import (
	"strings"
)

func MapCamelCaseKey(m map[string]interface{}) map[string]string {
	result := map[string]string{}
	for s := range m {
		camelCase := ""
		isToUpper := false
		for _, runeValue := range s {
			if isToUpper {
				camelCase += strings.ToUpper(string(runeValue))
				isToUpper = false
			} else {
				if runeValue == '_' {
					isToUpper = true
				} else {
					camelCase += string(runeValue)
				}
			}
		}
		result[camelCase] = s
	}
	return result
}

func MapConvertKey(m map[string]interface{}, key map[string]string) map[string]interface{} {
	result := map[string]interface{}{}
	for k, v := range key {
		result[k] = m[v]
	}
	return result
}
