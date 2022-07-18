const controllers = {
    'connection': ['OnionSpace.view.connection.connection'],
    'table': ['OnionSpace.view.table.table'],
};

function initMainView() {
    checkAuth();
    Ext.application({
        requires: ['Ext.container.Viewport', 'OnionSpace.view.properties.properties'],
        name: 'OnionSpace',
        appFolder: 'app',
        launch: function () {
            const viewport = Ext.create('Ext.panel.Panel', {
                layout: 'border',
                items: [
                    {
                        title: '数据库管理',
                        region: 'west',
                        xtype: 'panel',
                        width: 200,
                        split: true,
                        collapsible: true,
                        id: 'west-region-container',
                        layout: 'fit',
                        tbar: [
                            {
                                xtype: 'button',
                                iconCls: 'x-fa fa-plus',
                                tooltip: '新建连接',
                                style: {color: 'var(--bs-primary)', margin: '0px 3px'},
                                handler: function () {
                                    showWindow('connection', this, {
                                        title: '编辑连接',
                                        width: 320,
                                        height: 330,
                                        items: {
                                            xtype: 'connection',
                                            layout: 'anchor'
                                        }
                                    });
                                }
                            },
                            {
                                xtype: 'button',
                                iconCls: 'x-fa fa-copy',
                                tooltip: '复制连接',
                                style: {color: 'var(--bs-info)', margin: '0px 3px'}
                            },
                            {xtype: "tbseparator"},
                            {
                                xtype: 'button',
                                iconCls: 'x-fa fa-list-alt',
                                tooltip: '连接属性',
                                style: {color: 'var(--bs-teal)', margin: '0px 3px'}
                            },
                            {
                                xtype: 'button',
                                iconCls: 'x-fa fa-terminal',
                                tooltip: '打开SQL编辑器',
                                style: {color: 'var(--bs-blue)', margin: '0px 3px'}
                            }
                        ],
                        items: {
                            xtype: 'properties',
                            layout: 'fit',
                            id: 'con-list'
                        }
                    }, {
                        region: 'center',
                        plugins: new Ext.ux.TabCloseMenu(),
                        xtype: 'tabpanel',
                        tabPosition: 'bottom',
                        layout: 'fit',
                        id: 'main'
                    }, {
                        title: '输出结果',
                        region: 'south',     // position for region
                        xtype: 'panel',
                        height: 100,
                        split: true,
                        collapsible: true,
                    }
                ],
            });
            Ext.create('Ext.Viewport', {
                layout: 'fit',
                items: viewport
            });
        }
    });
}

function login() {
    Ext.create('Ext.window.Window', {
        title: '登录',
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
            url: '/login',
            items: [{
                allowBlank: false,
                fieldLabel: '用户名',
                name: 'UserName',
                flex: 1,
                emptyText: '用户名',
            }, {
                allowBlank: false,
                fieldLabel: '密码',
                name: 'Password',
                emptyText: '密码',
                flex: 1,
                inputType: 'password'
            }],
        }],
        buttons: [
            {
                text: '登录',
                handler: function (btn) {
                    const form = btn.up('window').down('form');
                    if (form.isValid()) {
                        form.submit({
                            success: function (form, action) {
                                localStorage.setItem('jwtToken', action.result.data);
                                Ext.Ajax.setDefaultHeaders({'Authorization': 'basic ' + action.result.data});
                                btn.up('window').hide();
                                Ext.toast('登录成功!');
                            },
                            failure: function (form, action) {
                                Ext.Msg.alert('登录失败', '用户名或密码错误');
                            }
                        });
                    }
                }
            }
        ]
    }).show().focus();
}


function showWindow(mode, btn, options) {
    loadView(mode, function () {
        options.border = false;
        options.layout = 'fit';
        options.minimizable = true;
        options.maximizable = true;
        options.animateTarget = btn;
        options.constrain = true;
        options.modal = true;
        Ext.create('Ext.window.Window', options).show().focus();
    })
}

function loadView(mode, call) {
    Ext.getBody().mask('加载中...');
    Ext.require(controllers[mode], function () {
        Ext.getBody().unmask();
        call();
    });
}

function checkAuth() {
    Ext.Ajax.setDefaultHeaders({'Authorization': 'basic ' + localStorage.getItem('jwtToken')});
    Ext.Ajax.request({
        url: '/checkAuth',
        success: function (response, opts) {
        },
        failure: function (response, opts) {
            login();
        }
    });
}

function openTab(conId, conName, tabId, mode, title, data, icon) {
    const panel = "main";
    const tabPanel = Ext.getCmp(panel);

    const main = Ext.getCmp(conId);
    if (main) {
        tabPanel.setActiveTab(main);
    } else {
        const tab = tabPanel.add({
            id: conId,
            title: conName,
            plugins: new Ext.ux.TabCloseMenu(),
            icon: '/images/database.svg',
            closable: true,
            xtype: 'tabpanel',
            layout: 'fit'
        });
        tabPanel.setActiveTab(tab);
    }
    const tabCon = Ext.getCmp(conId);
    const taa = Ext.getCmp(tabId);
    if (taa) {
        tabCon.setActiveTab(taa);
    } else {
        tabPanel.mask('加载中...');
        Ext.require(controllers[mode], function () {
            tabPanel.unmask();
            const tab = tabCon.add({
                id: tabId,
                title: title,
                icon: icon,
                closable: true,
                params: data,
                xtype: mode
            });
            tabCon.setActiveTab(tab);
        });
    }
}

function post(url, data, call) {
    Ext.Ajax.request({
        url: url,
        method: 'POST',
        jsonData: data,
        success: function (response) {
            const res = Ext.util.JSON.decode(response.responseText);
            call({success: true, response: res});
        },
        failure: function (response) {
            call({success: false, response: response});
        }
    });
}

function get(url, call) {
    Ext.Ajax.request({
        url: url,
        method: 'GET',
        success: function (response) {
            const res = Ext.util.JSON.decode(response.responseText);
            call({success: true, response: res});
        },
        failure: function (response) {
            call({success: false, response: response});
        }
    });
}
