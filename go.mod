module cloud-dbclient

go 1.18

require (
	github.com/gofiber/fiber/v2 v2.34.1
	service v0.0.0
	utils v0.0.0
)

replace utils v0.0.0 => ./utils

replace service v0.0.0 => ./service

require (
	github.com/andybalholm/brotli v1.0.4 // indirect
	github.com/axgle/mahonia v0.0.0-20180208002826-3358181d7394 // indirect
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.4 // indirect
	github.com/klauspost/compress v1.15.0 // indirect
	github.com/kr/pretty v0.3.0 // indirect
	github.com/satori/go.uuid v1.2.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.37.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	golang.org/x/crypto v0.0.0-20220622213112-05595931fe9d // indirect
	golang.org/x/sys v0.0.0-20220227234510-4e6760a101f9 // indirect
	gorm.io/driver/mysql v1.3.4 // indirect
	gorm.io/gorm v1.23.6 // indirect
)
