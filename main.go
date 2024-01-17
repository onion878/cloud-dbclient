package main

import (
	"embed"
	b64 "encoding/base64"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/basicauth"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/timeout"
	"golang.org/x/crypto/bcrypt"
	"net/url"
	"reflect"
	"service"
	"time"
	"utils"
)

//go:embed frontend/*
var frontend embed.FS

var nowUser service.Account

func main() {
	props, _ := utils.ReadPropertiesFile("properties")
	utils.StartPool(props)
	app := fiber.New()

	app.Use(cors.New())
	app.Static("/", "./frontend")
	app.Post("/login", func(c *fiber.Ctx) error {
		var a service.Account
		c.BodyParser(&a)
		account, err := service.GetAccount(a.Username)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}
		err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(a.Password))
		if err == nil {
			return c.Send(utils.ReData(b64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", a.Username, a.Password)))))
		}
		return c.SendStatus(fiber.StatusBadRequest)
	})

	// Or extend your config for customization
	app.Use(basicauth.New(basicauth.Config{
		Users: map[string]string{
			"admin": props["superPassword"],
		},
		Realm: "Forbidden",
		Authorizer: func(user, pass string) bool {
			account, err := service.GetAccount(user)
			nowUser = account
			if err != nil {
				return false
			}
			err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(pass))
			if err == nil {
				return true
			}
			return false
		},
		Unauthorized: func(c *fiber.Ctx) error {
			return c.SendFile("./unauthorized.html")
		},
	}))

	app.Get("/checkAuth", func(c *fiber.Ctx) error {
		return c.JSON(true)
	})

	app.Post("/testConnection", func(c *fiber.Ctx) error {
		var a service.Client
		c.BodyParser(&a)
		r, e := service.TestConnect(a)
		if e != nil {
			return c.JSON(e)
		}
		return c.JSON(r)
	})

	app.Post("/createConnection", func(c *fiber.Ctx) error {
		var a service.Client
		c.BodyParser(&a)
		a.AccountId = nowUser.Id
		return c.Send(utils.ReData(service.CreateConnection(a)))
	})

	app.Get("/getAllConnection", func(c *fiber.Ctx) error {
		return c.Send(utils.ReData(service.GetAllConnection()))
	})

	app.Post("/openConnection", func(c *fiber.Ctx) error {
		var a service.Client
		c.BodyParser(&a)
		service.OpenDB(a.Id)
		return c.Send(utils.ReData("成功"))
	})

	app.Post("/getDataBase", func(c *fiber.Ctx) error {
		var a service.Client
		c.BodyParser(&a)
		return c.Send(utils.ReData(service.GetDataBase(a.Id)))
	})

	app.Post("/getTable", func(c *fiber.Ctx) error {
		var a map[string]string
		c.BodyParser(&a)
		return c.Send(utils.ReData(service.GetTable(a["id"], a["scheme"])))
	})

	app.Post("/getColumn", func(c *fiber.Ctx) error {
		var a map[string]string
		c.BodyParser(&a)
		return c.Send(utils.ReData(service.GetColumn(a["id"], a["scheme"], a["table"])))
	})

	app.Post("/getData", func(c *fiber.Ctx) error {
		var a map[string]any
		c.BodyParser(&a)
		r := service.GetData(a)
		if reflect.TypeOf(r).String() == "*errors.errorString" {
			return c.JSON(map[string]interface{}{
				"success": false,
				"data":    r.(error).Error(),
				"time":    time.Now(),
			})
		}
		return c.Send(r.([]byte))
	})

	app.Post("/execSql", timeout.New(func(c *fiber.Ctx) error {
		var a map[string]any
		c.BodyParser(&a)
		r := service.ExecSql(a["id"].(string), a["scheme"], a["sql"].([]interface{}), nowUser.Id)
		if reflect.TypeOf(r).String() == "*errors.errorString" {
			return c.JSON(map[string]interface{}{
				"success": false,
				"data":    r.(error).Error(),
				"time":    time.Now(),
			})
		}
		return c.Send(utils.ReData(r))
	}, time.Minute*20))

	app.Post("/saveHistory", func(c *fiber.Ctx) error {
		var a []service.TabHistory
		c.BodyParser(&a)
		for i := range a {
			a[i].AccountId = nowUser.Id
		}
		return c.Send(utils.ReData(service.SaveHistory(a, nowUser.Id)))
	})

	app.Get("/getHistory", func(c *fiber.Ctx) error {
		return c.Send(utils.ReData(service.GetHistory(nowUser.Id)))
	})

	app.Post("/saveExecHistory", func(c *fiber.Ctx) error {
		var a service.ExecHistory
		c.BodyParser(&a)
		a.AccountId = nowUser.Id
		a1, _ := utils.Decrypt(a.Sql)
		executed, _ := url.PathUnescape(string(a1))
		a.Sql = executed
		service.SaveExecHistory(a)
		return c.Send(utils.ReData(nil))
	})

	app.Post("/getExecHistory", func(c *fiber.Ctx) error {
		var a map[string]any
		c.BodyParser(&a)
		a["accountId"] = nowUser.Id
		return c.Send(utils.ReData(service.GetExecHistory(a)))
	})

	app.Post("/saveSqlRecord", func(c *fiber.Ctx) error {
		var a service.SqlRecord
		c.BodyParser(&a)
		a.AccountId = nowUser.Id
		a1, _ := utils.Decrypt(a.Sql)
		executed, _ := url.PathUnescape(string(a1))
		a.Sql = executed
		return c.Send(utils.ReData(service.SaveSqlRecord(a)))
	})

	app.Post("/getSqlRecord", func(c *fiber.Ctx) error {
		var a map[string]any
		c.BodyParser(&a)
		a["accountId"] = nowUser.Id
		return c.Send(utils.ReData(service.GetSqlRecord(a)))
	})

	app.Get("/getInfo/:code", func(c *fiber.Ctx) error {
		return c.JSON(service.GetSystemInfo(c.Params("code")))
	})

	app.Post("/checkModify", func(c *fiber.Ctx) error {
		var obj map[string]interface{}
		c.BodyParser(&obj)
		if len(obj["systemId"].(string)) == 0 {
			return c.SendString(utils.RandomString(20, "Aa0"))
		}
		return c.JSON(service.CheckModify(obj))
	})

	app.Post("/syncModify", func(c *fiber.Ctx) error {
		var obj map[string]interface{}
		c.BodyParser(&obj)
		if len(obj["systemId"].(string)) == 0 {
			return c.SendString(utils.RandomString(20, "Aa0"))
		}
		return c.JSON(service.SyncModify(obj))
	})

	app.Post("/uploadConfig", func(c *fiber.Ctx) error {
		var obj map[string]interface{}
		c.BodyParser(&obj)
		if len(obj["systemId"].(string)) == 0 {
			return c.SendString(utils.RandomString(20, "Aa0"))
		}
		return c.JSON(service.UpdateConfig(obj))
	})

	app.Post("/api/**", func(c *fiber.Ctx) error {
		println(c.Request().URI().Path())
		var obj map[string]interface{}
		var array []map[string]interface{}
		if err := c.BodyParser(&obj); err != nil {
			err := c.BodyParser(&array)
			if err != nil {
				return c.SendString("请传入正确的JSON或Array数据")
			}
			return c.JSON(array)
		}
		return c.JSON(obj)
	})
	app.Listen(":" + props["port"])
}

func test() {
	accounts := service.Account{Name: "洋葱", Username: "onion", Password: "a1314a", Email: "2419186601@qq.com", AdminFlag: true}
	service.CreateAccount(accounts)
}
