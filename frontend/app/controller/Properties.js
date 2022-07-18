Ext.define('OnionSpace.controller.Properties', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Properties',
    search: function (v, k, o) {
        if (k.keyCode == 13 && k.type == "keydown") {
            this.showSearch(v, v.value.trim());
        }
    },
    showSearch: function (d, v) {
        const that = this;
        const {items} = this.view.getStore().getData();
        const tables = that.getViewModel().get('tables');
        if (v.trim().length == 0) {
            items.forEach(db => {
                db.childNodes.forEach(scheme => {
                    const child = tables[db.data.data.id + '-' + scheme.data.value];
                    if (child && child.length > 0) {
                        scheme.removeAll();
                        scheme.appendChild(child);
                    }
                });
            });
            return;
        }
        items.forEach(db => {
            db.childNodes.forEach(scheme => {
                const child = [];
                const list = tables[db.data.data.id + '-' + scheme.data.value];
                if (list && list.length > 0) {
                    list.forEach(table => {
                        const c = that.similar(v, table.value);
                        if (c) {
                            child.push(table);
                        }
                    });
                }
                scheme.removeAll();
                if (child.length > 0) {
                    scheme.appendChild(child);
                }
            });
        });
    },
    similar: function (s, t) {
        return t.indexOf(s) > -1;
    }
});
