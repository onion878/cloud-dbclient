Ext.define('OnionSpace.view.minicode.minicode', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.minicode',
    requires: [
        'OnionSpace.controller.Minicode'
    ],
    controller: 'Minicode',
    viewModel: true,
    html: `<div class="code-editor-content" style="width: 100%;height: 100%;"></div>`,
    layout: 'fit',
    value: null,
    codeEditor: null,
    listeners: {
        render: function (c) {
            const {
                dom
            } = this.getEl().down('.code-editor-content'), that = this;
            that.language = that.language != undefined ? that.language : 'javascript';
            that.fileContent = that.fileContent != undefined ? that.fileContent : '';
            let mini = false;
            if (this.minimap) {
                mini = true;
            }

            that.codeEditor = monaco.editor.create(dom, {
                language: that.language,
                value: that.value,
                minimap: {
                    enabled: mini
                }
            });

            that.codeEditor.onDidChangeModelContent(function (e) {
                that.changeValue();
            });
        },
        resize: {
            fn: function (el) {
                this.resizeCode();
            }
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    changeValue: function () {

    },
    updateLanguage(val, language) {
        const oldModel = this.codeEditor.getModel();
        const newModel = monaco.editor.createModel(val, language);
        this.codeEditor.setModel(newModel);
        if (oldModel) {
            oldModel.dispose();
        }
    },
    addValue: function (val) {
        this.updateLanguage(this.codeEditor.getValue() + '\n' + val, this.language);
        this.codeEditor.revealLine(this.codeEditor.getModel().getLineCount());
    },
    setValue: function (val) {
        this.updateLanguage(val, this.language);
    },
    resizeCode: function () {
        if (this.codeEditor) {
            this.codeEditor.layout();
        }
    }
});
