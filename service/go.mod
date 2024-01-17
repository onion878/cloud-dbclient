module service

go 1.18

require (
	golang.org/x/crypto v0.18.0
	gorm.io/driver/mysql v1.3.4
	gorm.io/gorm v1.23.6
	utils v0.0.0
)

require (
	github.com/axgle/mahonia v0.0.0-20180208002826-3358181d7394 // indirect
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.4 // indirect
	github.com/kr/pretty v0.3.0 // indirect
	github.com/satori/go.uuid v1.2.0 // indirect
)

replace utils v0.0.0 => ../utils
