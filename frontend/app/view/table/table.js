Ext.define('OnionSpace.view.table.table', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.table',
    requires: [
        'OnionSpace.store.Table',
        'OnionSpace.controller.Table'
    ],
    controller: 'Table',
    viewModel: {
        data: {
            where: null,
            order: null
        }
    },
    initComponent: function () {
        const that = this;
        Ext.apply(that, {
            autoWidth: true,
            stripeRows: true,
            viewConfig: {
                enableTextSelection: false
            },
            selType: 'checkboxmodel',
            store: {
                type: 'Table'
            },
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
                    flex: 1
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
                    flex: 1
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus',
                    tooltip: '添加数据',
                    style: {color: 'var(--bs-primary)', margin: '0px 3px'}
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-minus',
                    tooltip: '删除数据',
                    style: {color: 'var(--bs-danger)', margin: '0px 3px'}
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-save',
                    tooltip: '保存数据',
                    style: {color: 'var(--bs-cyan)', margin: '0px 3px'},
                    handler: 'save'
                },
            ],
            plugins: {
                ptype: 'cellediting',
                clicksToMoveEditor: 1,
                autoUpdate: true,
                autoCancel: false,
                listeners: {
                    edit: function (editor, e, eOpts) {
                        console.log(editor);
                        console.log(e);
                        console.log(eOpts);
                        // e.record.commit();
                        // editor.grid.getStore().getData().items.forEach(({data}) => {
                        //     console.log(data);
                        // });
                    }
                }
            },
            columns: [new Ext.grid.RowNumberer()],
            bbar: {
                xtype: 'pagingtoolbar',
                displayInfo: true,
                plugins: {
                    'ux-progressbarpager': true
                }
            }
        })
        this.callParent(arguments);
        post('/getColumn', this.params, function (r) {
            if (r.success) {
                r.response.data.forEach(c => {
                    const icon = c['IS_NULLABLE'] == 'YES' ? '/images/col_active.svg' : '/images/col.svg';
                    const type = c['DATA_TYPE'];
                    const column = {
                        text: `<div class="column-icon"><div style="padding-top: 1px;"><img class="icon-img" src="${icon}" /></div><div>${c['COLUMN_NAME']}</div></div>`,
                        align: 'left',
                        dataIndex: c['COLUMN_NAME'],
                        tooltip: c['COLUMN_NAME'] + ':' + c['COLUMN_TYPE'] + '<br>' + c['COLUMN_COMMENT'],
                        editor: {
                            xtype: 'textareafield'
                        },
                        renderer: function (d) {
                            if (d != null) {
                                return `<script type='text/html' style='display:block'>${d}</script>`;
                            } else {
                                return `<span style="color: gray;">NULL</span>`;
                            }
                        }
                    };
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
                        column.renderer = Ext.util.Format.dateRenderer('Y-m-d H:i:s');
                    }
                    that.headerCt.add(column);
                });
                that.getView().refresh();
                that.reload();
            }
        })
    },
    reload: function () {
        const store = this.getStore();
        store.getProxy().extraParams = {...this.params, ...this.getViewModel().data};
        store.load();
    }
});
