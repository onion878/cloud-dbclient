Ext.define('OnionSpace.store.Table', {
    extend: 'Ext.data.Store',
    alias: 'store.Table',
    pageSize: 200,
    proxy: {
        type: 'ajax',
        paramsAsJson: true,
        actionMethods: {
            read: 'POST',
        },
        api: {
            read: '/getData'
        },
        reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'total'
        },
        writer: {
            writeAllFields: true,
            writeRecordId: false
        },
        listeners: {
            exception: function (proxy, {responseJson}, operation) {
                Ext.Msg.alert('错误信息', responseJson.data);
            }
        }
    },
    autoLoad: false,
    autoSync: false
});
