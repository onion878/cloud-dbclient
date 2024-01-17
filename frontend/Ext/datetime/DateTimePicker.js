Ext.define('Ext.ux.DateTimePicker', {
    extend: 'Ext.picker.Date',
    alias: 'widget.datetimepicker',

    requires: [
        'Ext.form.field.ComboBox'
    ],

    okText: '确定',
    todayText: '今天',
    focusable: true,
    editable: true,

    renderTpl: [
        '<div id="{id}-innerEl" data-ref="innerEl" role="presentation">',
        '<div class="{baseCls}-header">',
        '<div id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-prev {baseCls}-arrow" role="presentation" title="{prevText}"></div>',
        '<div id="{id}-middleBtnEl" data-ref="middleBtnEl" class="{baseCls}-month" role="heading">{%this.renderMonthBtn(values, out)%}</div>',
        '<div id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-next {baseCls}-arrow" role="presentation" title="{nextText}"></div>',
        '</div>',
        '<table role="grid" id="{id}-eventEl" data-ref="eventEl" class="{baseCls}-inner" cellspacing="0" tabindex="0" aria-readonly="true">',
        '<thead>',
        '<tr role="row">',
        '<tpl for="dayNames">',
        '<th role="columnheader" class="{parent.baseCls}-column-header" aria-label="{.}">',
        '<div role="presentation" class="{parent.baseCls}-column-header-inner">{.:this.firstInitial}</div>',
        '</th>',
        '</tpl>',
        '</tr>',
        '</thead>',
        '<tbody>',
        '<tr role="row">',
        '<tpl for="days">',
        '{#:this.isEndOfWeek}',
        '<td role="gridcell">',
        '<div hidefocus="on" class="{parent.baseCls}-date"></div>',
        '</td>',
        '</tpl>',
        '</tr>',
        '</tbody>',
        '</table>',

        '<table id="{id}-timeEl" data-ref="timeEl" style="width: auto; margin: 0 0 0 0;" class="x-datepicker-inner sys-timepicker-inner" cellspacing="0">',
        '<tbody>',
        '<tr>',
        '<td>{%this.renderHourBtn(values,out)%}</td>',
        '<td style="width: 16px; text-align: center; font-weight: bold;">:</td>',
        '<td>{%this.renderMinuteBtn(values,out)%}</td>',
        '<td style="width: 16px; text-align: center; font-weight: bold;">:</td>',
        '<td>{%this.renderSecondBtn(values,out)%}</td>',
        '</tr>',
        '</tbody>',
        '</table>',


        '<tpl if="showToday">',
        '<div id="{id}-footerEl" data-ref="footerEl" role="presentation" class="{baseCls}-footer">{%this.renderOkBtn(values, out)%}{%this.renderTodayBtn(values, out)%}</div>',
        '</tpl>',
        // These elements are used with Assistive Technologies such as screen readers
        '<div id="{id}-todayText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{todayText}.</div>',
        '<div id="{id}-ariaMinText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMinText}.</div>',
        '<div id="{id}-ariaMaxText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMaxText}.</div>',
        '<div id="{id}-ariaDisabledDaysText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDaysText}.</div>',
        '<div id="{id}-ariaDisabledDatesText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDatesText}.</div>',
        '</div>',
        {
            firstInitial: function (value) {
                return Ext.picker.Date.prototype.getDayInitial(value);
            },

            isEndOfWeek: function (value) {
                // convert from 1 based index to 0 based
                // by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },

            renderTodayBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.todayBtn.getRenderTree(), out);
            },

            renderMonthBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.monthBtn.getRenderTree(), out);
            },

            renderHourBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.hourBtn.getRenderTree(), out);
            },

            renderMinuteBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.minuteBtn.getRenderTree(), out);
            },

            renderSecondBtn: function (values, out) {
                ;
                Ext.DomHelper.generateMarkup(values.$comp.secondBtn.getRenderTree(), out);
            },

            renderOkBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.okBtn.getRenderTree(), out);
            }
        }
    ],

    beforeRender: function () {
        var me = this,
            _$combobox = Ext.form.field.ComboBox,
            // today = Ext.Date.format(new Date(), me.format),
            ownerLayout = me.getComponentLayout()
        ;

        me.hourBtn = new _$combobox({
            ownerCt: me,
            ownerLayout: ownerLayout,
            width: 50,
            valueField: 'text',
            store: {
                fields: ["text"],
                data: [
                    {text: "01"}, {text: "02"}, {text: "03"}, {text: "04"}, {text: "05"}, {text: "06"}, {text: "07"}, {text: "08"}, {text: "09"}, {text: "10"},
                    {text: "11"}, {text: "12"}, {text: "13"}, {text: "14"}, {text: "15"}, {text: "16"}, {text: "17"}, {text: "18"}, {text: "19"}, {text: "20"},
                    {text: "21"}, {text: "22"}, {text: "23"}, {text: "24"}
                ]
            }
        });

        me.minuteBtn = new _$combobox({
            ownerCt: me,
            ownerLayout: ownerLayout,
            width: 50,
            valueField: 'text',
            store: {
                fields: ["text"],
                data: [
                    {text: "00"}, {text: "01"}, {text: "02"}, {text: "03"}, {text: "04"}, {text: "05"}, {text: "06"}, {text: "07"}, {text: "08"}, {text: "09"},
                    {text: "10"}, {text: "11"}, {text: "12"}, {text: "13"}, {text: "14"}, {text: "15"}, {text: "16"}, {text: "17"}, {text: "18"}, {text: "19"},
                    {text: "20"}, {text: "21"}, {text: "22"}, {text: "23"}, {text: "24"}, {text: "25"}, {text: "26"}, {text: "27"}, {text: "28"}, {text: "29"},
                    {text: "30"}, {text: "31"}, {text: "32"}, {text: "33"}, {text: "34"}, {text: "35"}, {text: "36"}, {text: "37"}, {text: "38"}, {text: "39"},
                    {text: "40"}, {text: "41"}, {text: "42"}, {text: "43"}, {text: "44"}, {text: "45"}, {text: "46"}, {text: "47"}, {text: "48"}, {text: "49"},
                    {text: "50"}, {text: "51"}, {text: "52"}, {text: "53"}, {text: "54"}, {text: "55"}, {text: "56"}, {text: "57"}, {text: "58"}, {text: "59"}
                ]
            }
        });

        me.secondBtn = new _$combobox({
            ownerCt: me,
            ownerLayout: ownerLayout,
            width: 50,
            valueField: 'text',
            store: {
                fields: ["text"],
                data: [
                    {text: "00"}, {text: "01"}, {text: "02"}, {text: "03"}, {text: "04"}, {text: "05"}, {text: "06"}, {text: "07"}, {text: "08"}, {text: "09"},
                    {text: "10"}, {text: "11"}, {text: "12"}, {text: "13"}, {text: "14"}, {text: "15"}, {text: "16"}, {text: "17"}, {text: "18"}, {text: "19"},
                    {text: "20"}, {text: "21"}, {text: "22"}, {text: "23"}, {text: "24"}, {text: "25"}, {text: "26"}, {text: "27"}, {text: "28"}, {text: "29"},
                    {text: "30"}, {text: "31"}, {text: "32"}, {text: "33"}, {text: "34"}, {text: "35"}, {text: "36"}, {text: "37"}, {text: "38"}, {text: "39"},
                    {text: "40"}, {text: "41"}, {text: "42"}, {text: "43"}, {text: "44"}, {text: "45"}, {text: "46"}, {text: "47"}, {text: "48"}, {text: "49"},
                    {text: "50"}, {text: "51"}, {text: "52"}, {text: "53"}, {text: "54"}, {text: "55"}, {text: "56"}, {text: "57"}, {text: "58"}, {text: "59"}
                ]
            }
        });

        me.okBtn = new Ext.button.Button({
            ui: me.footerButtonUI,
            ownerCt: me,
            ownerLayout: ownerLayout,
            text: me.okText,
            tooltipType: 'title',
            tabIndex: -1,
            ariaRole: 'presentation',
            handler: me.okHandler,
            scope: me
        });

        me.callParent();
    },

    privates: {
        finishRenderChildren: function () {
            var me = this;
            me.callParent(arguments);

            me.hourBtn.finishRender();
            me.minuteBtn.finishRender();
            me.secondBtn.finishRender();
            me.okBtn.finishRender();
        }
    },

    okHandler: function () {
        var me = this, btn = me.okBtn;

        if (btn && !btn.disabled) {
            me.setValue(this.getValue());
            me.fireEvent('select', me, me.value);
            me.onSelect();
        }

        return me;
    },

    selectedUpdate: function (date) {
        this.callParent([Ext.Date.clearTime(date, true)]);
    },

    update: function (date, forceRefresh) {
        var me = this;
        var hours = date.getHours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        me.hourBtn.setValue(hours);
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        me.minuteBtn.setValue(minutes);
        var seconds = date.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        me.secondBtn.setValue(seconds);

        return this.callParent(arguments);
    },

    setValue: function (date, isFixed) {
        var me = this;

        if (isFixed !== true) {
            
            date.setHours(me.hourBtn.getValue());
            date.setMinutes(me.minuteBtn.getValue());
            date.setSeconds(me.secondBtn.getValue());
        }
        ;
        me.value = date;
        me.update(me.value);
        return me;
    },

    initComponent: function() {
        var me = this,
            value = me.value;

        me.callParent();

        me.value = value || new Date();
    },

    doDestroy: function () {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.hourBtn,
                me.minuteBtn,
                me.secondBtn,
                me.okBtn
            );
        }

        me.callParent(arguments);
    },
    // @private
    // @inheritdoc
    beforeDestroy: function () {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.hourBtn,
                me.minuteBtn,
                me.secondBtn,
                me.okBtn
            );
        }

        me.callParent();
    },

    handleDateClick: function (e, t) {
        var me = this, handler = me.handler;

        e.stopEvent();

        if (!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)) {
            me.doCancelFocus = me.focusOnSelect === false;
            me.setValue(new Date(t.dateValue));
            delete me.doCancelFocus;

            // by pass on select to keep the window open
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            // event handling is turned off on hide
            // when we are using the picker in a field
            // therefore onSelect comes AFTER the select
            // event.
            me.onSelect();

        }
    }

});
