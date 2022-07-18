-- auto-generated definition
create table accounts
(
    id         varchar(40)  not null comment '唯一标识' primary key,
    name       varchar(200) not null comment '姓名',
    username   varchar(200) not null comment '登录名',
    password   varchar(200) null comment '密码',
    email      varchar(200) not null comment '邮箱',
    admin_flag int(1)       not null default 0 comment '是否管理员',
    created    timestamp             default CURRENT_TIMESTAMP null
);

-- auto-generated definition
create table clients
(
    id         varchar(40)                                                     not null comment '唯一标识' primary key,
    name       varchar(200)                                                    not null comment '名称',
    color      varchar(200)                                                    null comment '颜色',
    host       varchar(200)                                                    not null comment '主机',
    port       int(10)                                                         not null comment '端口',
    user       varchar(200)                                                    not null comment '账号',
    pwd        varchar(200)                                                    not null comment '密码',
    db         varchar(500)                                                    not null comment '数据库',
    remark     text                                                            null comment '备注',
    created    timestamp default CURRENT_TIMESTAMP                             null,
    sorted     bigint                                                          not null,
    account_id varchar(40)                                                     not null comment '系统标识',
    modify     datetime  default CURRENT_TIMESTAMP on update current_timestamp not null comment '修改时间',
    constraint clients_account_id_fk foreign key (account_id) references accounts (id)
);
