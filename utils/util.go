package utils

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"github.com/axgle/mahonia"
	uuid "github.com/satori/go.uuid"
	"log"
	"math/rand"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// RandomString RandomString(8, "A") 大写
// RandomString(8, "a0") 小写
// RandomString(20, "Aa0") 混合
func RandomString(randLength int, randType string) (result string) {
	var num = "0123456789"
	var lower = "abcdefghijklmnopqrstuvwxyz"
	var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	b := bytes.Buffer{}
	if strings.Contains(randType, "0") {
		b.WriteString(num)
	}
	if strings.Contains(randType, "a") {
		b.WriteString(lower)
	}
	if strings.Contains(randType, "A") {
		b.WriteString(upper)
	}
	var str = b.String()
	var strLen = len(str)
	if strLen == 0 {
		result = ""
		return
	}

	rand.Seed(time.Now().UnixNano())
	b = bytes.Buffer{}
	for i := 0; i < randLength; i++ {
		b.WriteByte(str[rand.Intn(strLen)])
	}
	result = b.String()
	return
}

// NewKeyId 获取uuid
func NewKeyId() string {
	return uuid.NewV4().String()
}

type AppConfigProperties map[string]string

func ReadPropertiesFile(filename string) (AppConfigProperties, error) {
	config := AppConfigProperties{}

	if len(filename) == 0 {
		return config, nil
	}
	file, err := os.Open(filename)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if equal := strings.Index(line, "="); equal >= 0 {
			if key := strings.TrimSpace(line[:equal]); len(key) > 0 {
				value := ""
				if len(line) > equal {
					value = strings.TrimSpace(line[equal+1:])
				}
				config[key] = value
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
		return nil, err
	}

	return config, nil
}

func GetIntFromString(p string) int {
	var valid = regexp.MustCompile("[0-9]")
	list := valid.FindAllStringSubmatch(p, -1)
	if len(list) > 0 {
		a := ""
		for i := 0; i < len(list); i++ {
			index := list[i][0]
			a = a + index
		}
		d, err := strconv.Atoi(a)
		if err != nil {
			return 0
		}
		return d
	}
	return 1
}

func Convert2GBK(str string) string {
	return mahonia.NewEncoder("gbk").ConvertString(str)
}

func ReData(data interface{}) []byte {
	byte, _ := json.Marshal(map[string]interface{}{
		"success": true,
		"data":    data,
		"time":    time.Now(),
	})

	return byte
}

func ReRows(data interface{}, total int64) []byte {
	byte, _ := json.Marshal(map[string]interface{}{
		"success": total >= 0,
		"rows":    data,
		"total":   total,
		"time":    time.Now(),
	})

	return byte
}

func Decrypt(s string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(s[1 : len(s)-1])
}

func Encrypt(s []byte) string {
	return "a" + base64.StdEncoding.EncodeToString(s) + "a"
}
