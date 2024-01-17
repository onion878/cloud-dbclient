Ext.define('OnionSpace.controller.Table', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Table',
    sqlList: [],
    search: function (v, k, o) {
        if (k.keyCode == 13 && k.type == "keydown") {
            v.up('table').reload();
        }
    },
    updateData: function (editor, e) {
        if (e.record.data['_add']) {
            return;
        }
        if (e.value == e.originalValue) return;
        const idKey = this.getViewModel().get('primaryKey');
        const idValue = typeof e.record.data[idKey] == 'string' ? e.record.data[idKey].replace(/\'/g, "\\'") : e.record.data[idKey];
        let value = e.value;
        if (e.value != null && typeof e.value == 'string') {
            value = "'" + value.replace(/\'/g, "\\'") + "'";
        }
        if (e.value instanceof Date) {
            value = "'" + Ext.Date.format(e.value, 'Y-m-d H:i:s') + "'";
        }
        if (value == ("'" + e.originalValue + "'")) return;
        this.sqlList.push(`update \`${this.getView().params.scheme}\`.\`${this.getView().params.table}\`
                           set ${e.field} = ${value}
                           where ${idKey} = '${idValue}';`);
    },
    commit: function () {
        const that = this;
        const columns = that.view.getVisibleColumns().map(r => r.dataIndex).splice(1);
        const params = this.getView().params;
        const store = that.getView().getStore();
        store.getData().items.forEach(d => {
            if (d.data['_add']) {
                delete d.data['_add'];
                const keys = [];
                const values = [];
                columns.forEach(k => {
                    keys.push('`' + k + '`');
                    let value = d.data[k];
                    if (value != null && typeof value == 'string') {
                        value = "'" + value.replace(/\'/g, "\\'") + "'";
                    }
                    if (value instanceof Date) {
                        value = "'" + Ext.Date.format(value, 'Y-m-d H:i:s') + "'";
                    }
                    if (value == null) {
                        value = 'null';
                    }
                    values.push(value);
                });
                this.sqlList.push(`insert into \`${this.getView().params.scheme}\`.\`${this.getView().params.table}\`(${keys.join(',')})
                                   values (${values.join(',')}) `)
            }
        });
        if (that.sqlList.length == 0) return;
        that.getView().setLoading(true);
        post('/execSql', {id: params.id, sql: this.sqlList.map(s => encrypt(s))}, function (r) {
            if (r.response.success) {
                that.sqlList.length = 0;
                that.getView().getStore().getUpdatedRecords().forEach(r => {
                    r.commit();
                });
                that.getView().getStore().getRemovedRecords().forEach(r => {
                    r.commit();
                });
                that.getViewModel().set('info', '操作成功!');
                that.getView().reload();
            } else {
                that.getViewModel().set('info', '操作失败!');
                Ext.Msg.alert('错误信息', decrypt(r.response.data));
            }
            that.getView().setLoading(false);
        });
    },
    preview: function (btn) {
        showWindow('panel', btn, {
            title: '执行预览',
            bodyPadding: 10,
            html: this.sqlList.join('<br>'),
        });
    },
    loadData: function () {
        const that = this;
        that.sqlList.length = 0;
    },
    remove: function (btn) {
        const that = this, list = that.getView().getSelection();
        const idKey = this.getViewModel().get('primaryKey');
        const sql = [];
        list.forEach(({data}) => {
            const idValue = typeof data[idKey] == 'string' ? data[idKey].replace(/\'/g, "\\'") : data[idKey];
            sql.push(`delete
                      from \`${that.getView().params.scheme}\`.\`${that.getView().params.table}\`
                      where ${idKey} = '${idValue}';`)
        })
        showConfirm(`确认删除选择的 ${sql.length} 条数据吗?`, function () {
            that.getView().setLoading(true);
            post('/execSql', {
                id: that.getView().params.id,
                sql: sql.map(s => encrypt(s))
            }, function (r) {
                that.getView().setLoading(false);
                if (r.response.success) {
                    that.getView().reload();
                    that.getViewModel().set('info', '操作成功!');
                } else {
                    that.getViewModel().set('info', '操作失败!');
                    Ext.Msg.alert('错误信息', decrypt(r.response.data));
                }
            });
        });
    },
    add: function (r) {
        const that = this;
        const store = that.getView().getStore();
        const idKey = that.getViewModel().get('primaryKey');
        const initValue = r ?? {};
        initValue['_add'] = true;
        initValue[idKey] = that.guid();
        store.insert(0, initValue);
        that.getView().scrollTo(0, 0, true);
    },
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    rightMenu: function (gridView, td, cellIndex, record, tr, rowIndex, event, eOpts) {
        event.preventDefault();
        const cell = this.getView().getColumns()[cellIndex].dataIndex;
        const row = this.getView().getStore().getAt(rowIndex);
        const data = row.data;
        const that = this;
        new Ext.menu.Menu({
            minWidth: 60,
            items: [
                {
                    text: '设置NULL',
                    iconCls: 'x-fa fa-cog',
                    handler: function () {
                        const selections = gridView.getSelection();
                        const idKey = that.getViewModel().get('primaryKey');
                        selections.forEach(function (e) {
                            e.set(cell, null);
                            const data = e.getData();
                            const idValue = typeof data[idKey] == 'string' ? data[idKey].replace(/\'/g, "\\'") : data[idKey];
                            const sql = `update \`${that.getView().params.scheme}\`.\`${that.getView().params.table}\`
                                         set ${cell} = null
                                         where ${idKey} = '${idValue}';`
                            that.sqlList.push(sql);
                        })
                    }
                },
                {
                    text: '设置空字符串',
                    iconCls: 'x-fa fa-cog',
                    handler: function () {
                        const selections = gridView.getSelection();
                        const idKey = that.getViewModel().get('primaryKey');
                        selections.forEach(function (e) {
                            e.set(cell, '');
                            const data = e.getData();
                            const idValue = typeof data[idKey] == 'string' ? data[idKey].replace(/\'/g, "\\'") : data[idKey];
                            const sql = `update \`${that.getView().params.scheme}\`.\`${that.getView().params.table}\`
                                         set ${cell} = ''
                                         where ${idKey} = '${idValue}';`
                            that.sqlList.push(sql);
                        })
                    }
                },
                {
                    text: '批量设值',
                    iconCls: 'x-fa fa-list',
                    handler: function () {
                        const selections = gridView.getSelection();
                        Ext.create('Ext.window.Window', {
                            title: '批量修改选择值',
                            width: 250,
                            modal: true,
                            resizable: false,
                            items: [{
                                bodyPadding: 8,
                                defaultType: 'textfield',
                                xtype: 'form',
                                layout: {
                                    type: 'vbox',
                                    pack: 'start',
                                    align: 'stretch'
                                },
                                defaults: {
                                    labelWidth: 50
                                },
                                items: [{
                                    allowBlank: false,
                                    name: 'value',
                                    flex: 1,
                                    emptyText: '修改值',
                                }],
                            }],
                            buttons: [
                                {
                                    text: '关闭',
                                    handler: function (btn) {
                                        btn.up('window').hide();
                                    }
                                },
                                {
                                    text: '确认',
                                    handler: function (btn) {
                                        const form = btn.up('window').down('form');
                                        if (form.isValid()) {
                                            const {value} = form.getValues();
                                            const idKey = that.getViewModel().get('primaryKey');
                                            selections.forEach(function (e) {
                                                e.set(cell, value);
                                                const data = e.getData();
                                                const idValue = typeof data[idKey] == 'string' ? data[idKey].replace(/\'/g, "\\'") : data[idKey];
                                                const sql = `update \`${that.getView().params.scheme}\`.\`${that.getView().params.table}\`
                                                             set ${cell} = '${value.replace(/\'/g, "\\'")}'
                                                             where ${idKey} = '${idValue}';`
                                                that.sqlList.push(sql);
                                            })
                                            btn.up('window').hide();
                                        }
                                    }
                                }
                            ]
                        }).show().focus();
                    }
                },
                {
                    text: '复制',
                    iconCls: 'x-fa fa-copy',
                    handler: function () {
                        that.add({...row.data});
                    }
                },
                {
                    text: 'WHERE',
                    iconCls: 'x-fa fa-file',
                    menu: [
                        {
                            text: '=',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} = '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'like',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'in',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} = ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '!=',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} != '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not like',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} not like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not in',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} not in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '非空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${cell} != ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        }
                    ]
                },
                {
                    text: 'AND',
                    iconCls: 'x-fa fa-file',
                    menu: [
                        {
                            text: '=',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} = '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'like',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'in',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} = ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '!=',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} != '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not like',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} not like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not in',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} not in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '非空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getAndWhere()}${cell} != ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        }
                    ]
                },
                {
                    text: 'OR',
                    iconCls: 'x-fa fa-file',
                    menu: [
                        {
                            text: '=',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} = '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'like',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'in',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} = ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '!=',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} != '${data[cell]}'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not like',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} not like '%${data[cell]}%'`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: 'not in',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} not in ('${data[cell]}')`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        },
                        {
                            text: '非空字符串',
                            handler: function () {
                                that.getViewModel().set('where', `${that.getOrWhere()}${cell} != ''`);
                                that.getView().down('textfield[action=where]').focus();
                            }
                        }
                    ]
                },
                {
                    text: 'ORDER',
                    iconCls: 'x-fa fa-file',
                    menu: [
                        {
                            text: 'ASC',
                            handler: function () {
                                that.getViewModel().set('order', `${cell}`);
                                that.getView().down('textfield[action=order]').focus();
                            }
                        },
                        {
                            text: 'DESC',
                            handler: function () {
                                that.getViewModel().set('order', `${cell} desc`);
                                that.getView().down('textfield[action=order]').focus();
                            }
                        }
                    ]
                }
            ]
        }).showAt(event.getPoint());
    },
    getAndWhere: function () {
        const that = this;
        const where = that.getViewModel().get('where');
        if (where != null && where.trim().length > 0) {
            return `${where} and `;
        } else {
            return '';
        }
    },
    getOrWhere: function () {
        const that = this;
        const where = that.getViewModel().get('where');
        if (where != null && where.trim().length > 0) {
            return `${where} or `;
        } else {
            return '';
        }
    },
    changePageSize: function (e, size) {
        const store = e.up('table').getStore();
        store.setPageSize(size);
        store.load();
    }
});
