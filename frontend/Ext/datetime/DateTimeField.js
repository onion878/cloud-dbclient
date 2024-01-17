
Ext.define('Ext.ux.DateTimeField', {
    extend:'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: ['Ext.ux.DateTimePicker'],

    format : "Y/m/d H:i:s",

    altFormats : "Y/m/d H:i:s",

    createPicker: function() {
        var me = this, format = Ext.String.format;

        return new Ext.ux.DateTimePicker({
            pickerField: me,
            floating: true,

            hidden: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            ariaDisabledDatesText: me.ariaDisabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            ariaDisabledDaysText: me.ariaDisabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            ariaMinText: format(me.ariaMinText, me.formatDate(me.minValue, me.ariaFormat)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            ariaMaxText: format(me.ariaMaxText, me.formatDate(me.maxValue, me.ariaFormat)),
            editable: true,
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.inputEl.focus();
                    me.collapse();
                }
            }
        });
    },
    onMouseDown: function(e) {
        //e.preventDefault();
    },
    valueToRaw : function(value) {
        if (value) {
            return Ext.util.Format.date(new Date(value),'Y-m-d H:i:s');
        } else {
            return "";
        }
    },
    onExpand: function() {
        var value = this.getValue();
        this.picker.setValue(Ext.isDate(value) ? value : new Date(), true);
    }
});
