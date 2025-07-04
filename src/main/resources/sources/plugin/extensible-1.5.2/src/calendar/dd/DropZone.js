/*!
 * Extensible 1.5.2
 * Copyright(c) 2010-2013 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
/* @private
 * Internal drop zone implementation for the calendar components. This provides base functionality
 * and is primarily for the month view -- DayViewDD adds day/week view-specific functionality.
 */
Ext.define('Extensible.calendar.dd.DropZone', {
    extend: 'Ext.dd.DropZone',

    requires: [
        Ext.getVersion().isLessThan('4.2') ? 'Ext.Layer' : 'Ext.dom.Layer',
        'Extensible.calendar.data.EventMappings'
    ],

    ddGroup: 'CalendarDD',
    eventSelector: '.ext-cal-evt',
    dateRangeFormat: '{0}-{1}',
    dateFormat: 'n/j',

    // private
    shims: [],

    getTargetFromEvent: function (e) {
        var dragOffset = this.dragOffset || 0,
            y = e.getPageY() - dragOffset,
            d = this.view.getDayAt(e.getPageX(), y);

        return d.el ? d : null;
    },

    onNodeOver: function (n, dd, e, data) {
        var D = Extensible.Date,
            start = data.type == 'eventdrag' ? n.date : D.min(data.start, n.date),
            end = data.type == 'eventdrag' ? D.add(n.date, {days: D.diffDays(data.eventStart, data.eventEnd)}) :
                D.max(data.start, n.date);

        if (!this.dragStartDate || !this.dragEndDate || (D.diffDays(start, this.dragStartDate) != 0) || (D.diffDays(end, this.dragEndDate) != 0)) {
            this.dragStartDate = start;
            this.dragEndDate = D.add(end, {days: 1, millis: -1, clearTime: true});
            this.shim(start, end);

            var range = Ext.Date.format(start, this.dateFormat);

            if (D.diffDays(start, end) > 0) {
                end = Ext.Date.format(end, this.dateFormat);
                range = Ext.String.format(this.dateRangeFormat, range, end);
            }
            var msg = Ext.String.format(data.type == 'eventdrag' ? this.moveText : this.createText, range);
            data.proxy.updateMsg(msg);
        }
        return this.dropAllowed;
    },

    shim: function (start, end) {
        this.currWeek = -1;
        var dt = Ext.Date.clone(start),
            i = 0, shim, box,
            D = Extensible.Date,
            cnt = D.diffDays(dt, end) + 1;

        this.DDMInstance.notifyOccluded = true;

        Ext.each(this.shims, function (shim) {
            if (shim) {
                shim.isActive = false;
            }
        });

        while (i++ < cnt) {
            var dayEl = this.view.getDayEl(dt);

            // if the date is not in the current view ignore it (this
            // can happen when an event is dragged to the end of the
            // month so that it ends outside the view)
            if (dayEl) {
                var wk = this.view.getWeekIndex(dt),
                    shim = this.shims[wk];

                if (!shim) {
                    shim = this.createShim();
                    this.shims[wk] = shim;
                }
                if (wk != this.currWeek) {
                    shim.boxInfo = dayEl.getBox();
                    this.currWeek = wk;
                } else {
                    box = dayEl.getBox();
                    shim.boxInfo.right = box.right;
                    shim.boxInfo.width = box.right - shim.boxInfo.x;
                }
                shim.isActive = true;
            }
            dt = D.add(dt, {days: 1});
        }

        Ext.each(this.shims, function (shim) {
            if (shim) {
                if (shim.isActive) {
                    shim.show();
                    shim.setBox(shim.boxInfo);
                } else if (shim.isVisible()) {
                    shim.hide();
                }
            }
        });
    },

    createShim: function () {
        var owner = this.view.ownerCalendarPanel ? this.view.ownerCalendarPanel : this.view;
        if (!this.shimCt) {
            this.shimCt = Ext.get('ext-dd-shim-ct-' + owner.id);
            if (!this.shimCt) {
                this.shimCt = document.createElement('div');
                this.shimCt.id = 'ext-dd-shim-ct-' + owner.id;
                owner.getEl().parent().appendChild(this.shimCt);
            }
        }
        var el = document.createElement('div');
        el.className = 'ext-dd-shim';
        this.shimCt.appendChild(el);

        return Ext.create(Ext.getVersion().isLessThan('4.2') ? 'Ext.Layer' : 'Ext.dom.Layer', {
            shadow: false,
            useDisplay: true,
            constrain: false
        }, el);
    },

    clearShims: function () {
        Ext.each(this.shims, function (shim) {
            if (shim) {
                shim.hide();
            }
        });
        this.DDMInstance.notifyOccluded = false;
    },

    onContainerOver: function (dd, e, data) {
        return this.dropAllowed;
    },

    onCalendarDragComplete: function () {
        delete this.dragStartDate;
        delete this.dragEndDate;
        this.clearShims();
    },

    onNodeDrop: function (n, dd, e, data) {
        if (n && data) {
            if (data.type == 'eventdrag') {
                var rec = this.view.getEventRecordFromEl(data.ddel),
                    dt = Extensible.Date.copyTime(rec.data[Extensible.calendar.data.EventMappings.StartDate.name], n.date);

                this.view.onEventDrop(rec, dt);
                this.onCalendarDragComplete();
                return true;
            }
            if (data.type == 'caldrag') {
                this.view.onCalendarEndDrag(this.dragStartDate, this.dragEndDate,
                    Ext.bind(this.onCalendarDragComplete, this));
                //shims are NOT cleared here -- they stay visible until the handling
                //code calls the onCalendarDragComplete callback which hides them.
                return true;
            }
        }
        this.onCalendarDragComplete();
        return false;
    },

    onContainerDrop: function (dd, e, data) {
        this.onCalendarDragComplete();
        return false;
    },

    destroy: function () {
        Ext.each(this.shims, function (shim) {
            if (shim) {
                Ext.destroy(shim);
            }
        });

        Ext.removeNode(this.shimCt);
        delete this.shimCt;
        this.shims.length = 0;
    }
});

