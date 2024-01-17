module cloud-dbclient

go 1.18

require (
	github.com/gofiber/fiber/v2 v2.52.0
	golang.org/x/crypto v0.18.0
	service v0.0.0
	utils v0.0.0
)

replace utils v0.0.0 => ./utils

replace service v0.0.0 => ./service

require (
	github.com/andybalholm/brotli v1.0.5 // indirect
	github.com/axgle/mahonia v0.0.0-20180208002826-3358181d7394 // indirect
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/google/uuid v1.5.0 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.4 // indirect
	github.com/klauspost/compress v1.17.0 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.15 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/rogpeppe/go-internal v1.8.0 // indirect
	github.com/satori/go.uuid v1.2.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.51.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	golang.org/x/sys v0.16.0 // indirect
	gorm.io/driver/mysql v1.3.4 // indirect
	gorm.io/gorm v1.23.6 // indirect
)
