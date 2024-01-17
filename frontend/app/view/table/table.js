Ext.define('OnionSpace.view.table.table', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.table',
    requires: [
        'OnionSpace.store.Table',
        'OnionSpace.controller.Table'
    ],
    xtype: 'locking-grid',
    controller: 'Table',
    viewModel: {
        data: {
            where: null,
            order: null,
            primaryKey: 'id',
            info: null
        },
    },
    store: {
        type: 'Table',
        listeners: {}
    },
    listeners: {
        cellcontextmenu: 'rightMenu'
    },
    initComponent: function () {
        const that = this;
        that.store.listeners.load = function (e, records, successful, operation, eOpts) {
            that.controller.loadData();
        }
        Ext.apply(that, {
            autoWidth: true,
            stripeRows: true,
            viewConfig: {
                enableTextSelection: false,
                getRowClass: function (record) {
                    let clazz = "";
                    if (record.data['_add']) {
                        clazz = 'edit-color';
                    }
                    return clazz;
                }
            },
            multiSelect: true,
            columnLines: true,
            syncRowHeight: false,
            tbar: [
                {
                    xtype: 'textfield',
                    emptyText: '搜索',
                    labelWidth: 50,
                    fieldLabel: '&nbsp;&nbsp;where',
                    bind: '{where}',
                    listeners: {
                        specialkey: 'search',
                    },
                    flex: 1,
                    action: 'where'
                },
                {
                    xtype: 'textfield',
                    emptyText: '排序',
                    labelWidth: 60,
                    fieldLabel: '&nbsp;&nbsp;order by',
                    bind: '{order}',
                    listeners: {
                        specialkey: 'search',
                    },
                    flex: 1,
                    action: 'order'
                },
                {
                    xtype: 'button',
                    text: '导出',
                    menu: [{
                        text: 'Excel',
                        handler: function () {
                            const grid = this.up('grid');
                            exportExcel(grid.title, grid.getStore().getData().items.map(m => m.data));
                        }
                    }, {
                        text: 'JSON',
                        handler: function () {
                            const grid = this.up('grid');
                            exportJson(grid.title, grid.getStore().getData().items.map(m => m.data));
                        }
                    }]
                }
            ],
            plugins: {
                ptype: 'cellediting',
                clicksToMoveEditor: 1,
                autoUpdate: true,
                autoCancel: false,
                listeners: {
                    edit: 'updateData'
                }
            },
            columns: [{xtype: 'rownumberer', width: 45}],
            bbar: {
                xtype: 'pagingtoolbar',
                displayInfo: true,
                plugins: {
                    'ux-progressbarpager': true,
                    'ux-slidingpager': true
                },
                items: [
                    {
                        xtype: 'combobox',
                        valueField: 'value',
                        width: 55,
                        editable: false,
                        value: 200,
                        store: {
                            data: [
                                {value: 10, text: '10'},
                                {value: 100, text: '100'},
                                {value: 250, text: '250'},
                                {value: 500, text: '500'},
                                {value: 1000, text: '1000'},
                                {value: 9999, text: '9999'}
                            ]
                        },
                        listeners: {
                            change: 'changePageSize'
                        }
                    },
                    {xtype: "tbseparator"},
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-plus',
                        tooltip: '添加数据',
                        style: {color: 'var(--bs-primary)', margin: '0px 3px'},
                        handler: 'add'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-minus',
                        tooltip: '删除数据',
                        style: {color: 'var(--bs-danger)', margin: '0px 3px'},
                        handler: 'remove'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-save',
                        tooltip: '保存数据',
                        style: {color: 'var(--bs-cyan)', margin: '0px 3px'},
                        handler: 'commit'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-eye',
                        tooltip: '预览执行SQL',
                        style: {color: 'var(--bs-info)', margin: '0px 3px'},
                        handler: 'preview'
                    },
                    {xtype: 'tbfill'},
                    {
                        xtype: 'displayfield',
                        bind: '{info}'
                    }
                ]
            }
        })
        this.callParent(arguments);
        that.up().mask('加载中...');
        const colWidth = {};
        post('/getData', {...that.params, start: 0, limit: 10}, function ({response}) {
            response.rows?.forEach(row => {
                for (let column in row) {
                    if (colWidth[column] === undefined) {
                        colWidth[column] = column.replace(/[\u4e00-\u9fa5]/g, "aa").replace(/_/g, "aa").length;
                    }
                    if (row[column] == null) {
                        row[column] = column;
                    }
                    const len = row[column].toString().replace(/[\u4e00-\u9fa5]/g, "aa").length;
                    if (len > colWidth[column]) {
                        colWidth[column] = len;
                    }
                }
            });
        }, false)
        post('/getColumn', this.params, function (r) {
            if (r.success) {
                r.response.data.forEach((c, i) => {
                    if (colWidth[c['COLUMN_NAME']] === undefined) {
                        colWidth[c['COLUMN_NAME']] = c['COLUMN_NAME'].replace(/_/g, "aa").replace(/[\u4e00-\u9fa5]/g, "aa").length;
                    }
                    const icon = c['IS_NULLABLE'] == 'YES' ? '/images/col_active.svg' : '/images/col.svg';
                    const type = c['DATA_TYPE'];
                    const column = {
                        text: `<div class="column-icon"><div style="padding-top: 1px;"><img class="icon-img" src="${icon}" /></div><div>${c['COLUMN_NAME']}</div></div>`,
                        align: 'left',
                        width: colWidth[c['COLUMN_NAME']] * 6 + 25,
                        dataIndex: c['COLUMN_NAME'],
                        tooltip: c['COLUMN_NAME'] + ':' + c['COLUMN_TYPE'] + '<br>' + c['COLUMN_COMMENT'],
                        editor: {
                            xtype: 'textareafield'
                        },
                        lockable: true,
                        renderer: function (d) {
                            if (d != null) {
                                return `<script type='text/html' style='display:block'>${d}</script>`;
                            } else {
                                return `<span style="color: gray;">NULL</span>`;
                            }
                        }
                    };
                    if (column.width > 450) {
                        column.width = 450;
                    }
                    if (type.indexOf('blob') > -1) {
                        column.editor = null;
                    } else if (type.indexOf('bit') > -1) {
                        column.editor = {
                            xtype: 'combobox',
                            valueField: 'value',
                            store: {
                                data: [
                                    {value: false, text: 'false'},
                                    {value: true, text: 'true'},
                                    {value: null, text: 'null'},
                                ]
                            },
                        };
                    } else if (type.indexOf('int') > -1) {
                        column.editor = {
                            xtype: 'numberfield'
                        };
                    } else if (type == 'datetime' || type == 'timestamp') {
                        column.editor = {
                            xtype: 'datetimefield',
                            format: 'Y-m-d H:i:s',
                            submitFormat: 'Y-m-d H:i:s'
                        };
                        column.renderer = function (d) {
                            if (d != null) {
                                if (d instanceof Date) {
                                    return Ext.Date.format(d, 'Y-m-d H:i:s');
                                } else {
                                    return d;
                                }
                            } else {
                                return `<span style="color: gray;">NULL</span>`;
                            }
                        }
                    } else if (type == 'date') {
                        column.editor = {
                            xtype: 'datefield',
                            format: 'Y-m-d',
                            submitFormat: 'Y-m-d'
                        };
                        column.renderer = function (d) {
                            if (d != null) {
                                if (d instanceof Date) {
                                    return Ext.Date.format(d, 'Y-m-d');
                                } else {
                                    return d;
                                }
                            } else {
                                return `<span style="color: gray;">NULL</span>`;
                            }
                        }
                    }
                    that.headerCt.add(column);
                    if (c['COLUMN_KEY'] == 'PRI') {
                        that.getViewModel().set('primaryKey', c['COLUMN_NAME']);
                    }
                });
                that.up().unmask();
                that.getView().refresh();
                that.reload();
            }
        })
    },
    reload: function () {
        const store = this.getStore();
        const {where, order} = this.getViewModel().data
        store.getProxy().extraParams = {...this.params, where: where, order: order};
        store.load();
    }
});
