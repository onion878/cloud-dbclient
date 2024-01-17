Ext.define('OnionSpace.view.properties.properties', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.properties',
    requires: [
        'OnionSpace.controller.Properties'
    ],
    controller: 'Properties',
    store: Ext.create('Ext.data.TreeStore', {}),
    viewModel: {
        data: {
            search: null,
            total: null,
            tables: {}
        }
    },
    useArrows: true,
    closable: false,
    rootVisible: false,
    hideCollapseTool: true,
    listeners: {
        itemclick: function (node, event) {
            if (event.data.type == 'table') {
                node.toggleOnDblClick = false;
            } else {
                node.toggleOnDblClick = true;
            }
        },
        itemdblclick: function (node, event) {
            const item = event.data.id;
            const icon = event.data.icon;
            const title = event.data.text;
            if (event.data.type == 'table') {
                const data = {
                    id: event.parentNode.parentNode.data.data.id,
                    scheme: event.parentNode.data.value,
                    table: event.data.value
                };
                openTab(data.id, event.parentNode.parentNode.data.text, data.id + '-' + data.scheme + '-' + data.table, 'table', event.parentNode.data.text + '.' + event.data.text, data, '/images/table.svg');
            }
        },
        afteritemexpand: function (node, index, item, eOpts) {
            if (node.childNodes.length > 0) {
                return;
            }
            const that = this;
            const view = that.getView().getEl();
            view.mask('加载中...')
            const child = [];
            if (node.data.type == 'db') {
                const color = node.data.data.color;
                post('/getDataBase', node.data.data, function (r) {
                    if (r.success) {
                        node.removeAll();
                        r.response.data?.forEach(c => {
                            child.push({
                                text: `<span style="color: #${color};">${c}</span>`,
                                value: c,
                                type: 'scheme',
                                icon: '/images/database.svg'
                            });
                        });
                        node.appendChild(child);
                        view.unmask();
                    }
                })
            } else if (node.data.type == 'scheme') {
                const color = node.parentNode.data.data.color;
                post('/getTable', {scheme: node.data.value, id: node.parentNode.data.data.id}, function (r) {
                    if (r.success) {
                        node.removeAll();
                        r.response.data?.forEach(c => {
                            child.push({
                                text: `<span style="color: #${color};">${c}</span>`,
                                value: c,
                                type: 'table',
                                icon: '/images/table.svg'
                            });
                        });
                        const v = that.getViewModel().get('tables');
                        v[node.parentNode.data.data.id + '-' + node.data.value] = child;
                        that.getViewModel().set('tables', v);
                        node.appendChild(child);
                        view.unmask();
                    }
                })
            } else if (node.data.type == 'table') {
                const color = node.parentNode.parentNode.data.data.color;
                post('/getColumn', {
                    table: node.data.value,
                    scheme: node.parentNode.data.value,
                    id: node.parentNode.parentNode.data.data.id
                }, function (r) {
                    if (r.success) {
                        node.removeAll();
                        r.response.data?.forEach(c => {
                            const icon = c['IS_NULLABLE'] == 'YES' ? '/images/col_active.svg' : '/images/col.svg';
                            child.push({
                                text: c['COLUMN_NAME'],
                                value: `<span style="color: #${color};">${c['COLUMN_NAME']}</span>`,
                                type: 'column',
                                qtitle: c['COLUMN_COMMENT'],
                                data: c,
                                icon: icon,
                                leaf: true,
                                qtip: c['COLUMN_NAME'] + ':' + c['COLUMN_TYPE']
                            });
                        });
                        node.appendChild(child);
                        view.unmask();
                    }
                })
            }
        },
        itemcontextmenu: function (node, record, item, index, event) {
            event.preventDefault();
            // new Ext.menu.Menu({
            //     minWidth: 60,
            //     items: [{
            //         text: '设置NULL',
            //         iconCls: 'x-fa fa-list',
            //         handler: function () {
            //
            //         }
            //     }]
            // }).showAt(event.getPoint());
        }
    },
    tbar: [
        {
            xtype: 'container',
            layout: 'hbox',
            flex: 1,
            items: [
                {
                    xtype: 'textfield', flex: 1, emptyText: '搜索表', bind: '{search}', listeners: {
                        specialkey: 'search'
                    },
                },
                {
                    xtype: 'displayfield', bind: '{total}'
                }
            ]
        }
    ],
    initComponent: function () {
        this.reload();
        this.callParent(arguments);
    },
    reload: function () {
        const that = this;
        get('/getAllConnection', function (r) {
            const {data} = r.response;
            const list = [];
            data.forEach(d => {
                if (d.color == 'ff0000') {
                    d.color = null;
                }
                list.push({
                    text: `<span style="color: #${d.color};">${d.name}</span>`,
                    type: 'db',
                    icon: '/images/mysql.svg',
                    qtitle: d.name,
                    qtip: `${d.host}:${d.port}`,
                    data: d
                })
            });
            that.store.setRoot({
                text: '',
                expanded: true,
                children: list
            });
        })
    }
});
