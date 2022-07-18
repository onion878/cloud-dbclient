Ext.define('OnionSpace.view.connection.connection', {
    extend: 'Ext.form.Panel',
    alias: 'widget.connection',
    viewModel: true,
    bodyPadding: 8,
    defaultType: 'textfield',
    defaults: {
        labelWidth: 50,
        width: '100%'
    },
    url: '/createConnection',
    items: [
        {
            allowBlank: false,
            fieldLabel: '名称',
            name: 'Name',
            flex: 1,
            value: 'localhost'
        }, {
            allowBlank: true,
            fieldLabel: '注释',
            name: 'Remark',
            xtype: 'textareafield',
            flex: 1
        }, {
            allowBlank: true,
            fieldLabel: '颜色',
            name: 'Color',
            xtype: 'colorfield',
            format: 'hex6',
            flex: 1
        }, {
            allowBlank: false,
            fieldLabel: '主机',
            name: 'Host',
            flex: 1,
            value: '127.0.0.1'
        }, {
            allowBlank: false,
            fieldLabel: '端口',
            name: 'Port',
            xtype: 'numberfield',
            flex: 1,
            value: 3306
        }, {
            allowBlank: false,
            fieldLabel: '用户',
            name: 'User',
            flex: 1,
            value: 'root'
        }, {
            allowBlank: false,
            fieldLabel: '密码',
            name: 'Pwd',
            flex: 1,
            inputType: 'password'
        }, {
            allowBlank: true,
            fieldLabel: '数据库',
            name: 'Db',
            flex: 1,
        }
    ],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        align: 'right',
        items: [
            '->',
            {
                xtype: 'button', text: '测试连接', handler: function () {
                    const form = this.up('window').down('form');
                    if (form.isValid()) {
                        Ext.Ajax.request({
                            url: '/testConnection',
                            method: 'POST',
                            jsonData: form.getValues(),
                            success: function (response) {
                                const jsonResp = Ext.util.JSON.decode(response.responseText);
                                if (jsonResp.Message != null) {
                                    Ext.Msg.alert('错误', jsonResp.Message);
                                    return;
                                }
                                Ext.Msg.alert('正确', '测试成功');
                            },
                            failure: function (response, opts) {
                            }
                        });
                    }
                }
            },
            {
                xtype: 'button', text: '保存', handler: function () {
                    const btn = this;
                    const form = btn.up('window').down('form');
                    if (form.isValid()) {
                        form.submit({
                            success: function (form, action) {
                                btn.up('window').hide();
                                Ext.toast('保存成功!');
                                Ext.getCmp('con-list').reload();
                            },
                            failure: function (form, action) {
                                console.log(action);
                                Ext.Msg.alert('保存失败', '检查数据');
                            }
                        });
                    }
                }
            },
            '-',
            {
                xtype: 'button', text: '关闭', handler: function () {
                    this.up('window').hide();
                }
            },
        ]
    }],
    initComponent: function () {
        this.callParent(arguments);
    }
});
