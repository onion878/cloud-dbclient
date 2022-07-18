Ext.define('OnionSpace.controller.Table', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Table',
    search: function (v, k, o) {
        if (k.keyCode == 13 && k.type == "keydown") {
            v.up('table').reload();
        }
    },
    save: function (btn) {
        this.getView().getStore();
    }
});
