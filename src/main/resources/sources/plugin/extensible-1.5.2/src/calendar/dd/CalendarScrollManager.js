/*!
 * Extensible 1.5.2
 * Copyright(c) 2010-2013 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
/*
 * @class Ext.dd.ScrollManager
 * <p>Provides automatic scrolling of overflow regions in the page during drag operations.</p>
 * <p>The ScrollManager configs will be used as the defaults for any scroll container registered with it,
 * but you can also override most of the configs per scroll container by adding a
 * <tt>ddScrollConfig</tt> object to the target element that contains these properties: {@link #hthresh},
 * {@link #vthresh}, {@link #increment} and {@link #frequency}.  Example usage:
 * <pre><code>
var el = Ext.get('scroll-ct');
el.ddScrollConfig = {
    vthresh: 50,
    hthresh: -1,
    frequency: 100,
    increment: 200
};
Ext.dd.ScrollManager.register(el);
</code></pre>
 * <b>Note: This class uses "Point Mode" and is untested in "Intersect Mode".</b>
 * @singleton
 */
Ext.define('Ext.dd.ScrollManager', {
    singleton: true,
    requires: [
        'Ext.dd.DragDropManager'
    ],

    constructor: function () {
        var ddm = Ext.dd.DragDropManager;
        ddm.fireEvents = Ext.Function.createSequence(ddm.fireEvents, this.onFire, this);
        ddm.stopDrag = Ext.Function.createSequence(ddm.stopDrag, this.onStop, this);
        this.doScroll = Ext.Function.bind(this.doScroll, this);
        this.ddmInstance = ddm;
        this.els = {};
        this.dragEl = null;
        this.proc = {};
    },

    onStop: function (e) {
//        var sm = Ext.dd.ScrollManager;
//        sm.dragEl = null;
//        sm.clearProc();
        this.dragEl = null;
        this.clearProc();
    },

    triggerRefresh: function () {
        if (this.ddmInstance.dragCurrent) {
            this.ddmInstance.refreshCache(this.ddmInstance.dragCurrent.groups);
        }
    },

    doScroll: function () {
        if (this.ddmInstance.dragCurrent) {
            var proc = this.proc,
                procEl = proc.el,
                ddScrollConfig = proc.el.ddScrollConfig,
                inc = ddScrollConfig ? ddScrollConfig.increment : this.increment;

            if (!this.animate) {
                if (procEl.scroll(proc.dir, inc)) {
                    this.triggerRefresh();
                }
            } else {
                procEl.scroll(proc.dir, inc, true, this.animDuration, this.triggerRefresh);
            }
        }
    },

    clearProc: function () {
        var proc = this.proc;
        if (proc.id) {
            clearInterval(proc.id);
        }
        proc.id = 0;
        proc.el = null;
        proc.dir = "";
    },

    startProc: function (el, dir) {
        this.clearProc();
        this.proc.el = el;
        this.proc.dir = dir;
        var group = el.ddScrollConfig ? el.ddScrollConfig.ddGroup : undefined,
            freq = (el.ddScrollConfig && el.ddScrollConfig.frequency)
                ? el.ddScrollConfig.frequency
                : this.frequency;

        if (group === undefined || this.ddmInstance.dragCurrent.ddGroup == group) {
            this.proc.id = setInterval(this.doScroll, freq);
        }
    },

    onFire: function (e, isDrop) {
        if (isDrop || !this.ddmInstance.dragCurrent) {
            return;
        }
        if (!this.dragEl || this.dragEl != this.ddmInstance.dragCurrent) {
            this.dragEl = this.ddmInstance.dragCurrent;
            // refresh regions on drag start
            this.refreshCache();
        }

        var xy = e.getXY(),
            pt = e.getPoint(),
            proc = this.proc,
            els = this.els;

        for (var id in els) {
            var el = els[id], r = el._region;
            var c = el.ddScrollConfig ? el.ddScrollConfig : this;
            if (r && r.contains(pt) && el.isScrollable()) {
                if (r.bottom - pt.y <= c.vthresh) {
                    if (proc.el != el) {
                        this.startProc(el, "down");
                    }
                    return;
                } else if (r.right - pt.x <= c.hthresh) {
                    if (proc.el != el) {
                        this.startProc(el, "left");
                    }
                    return;
                } else if (pt.y - r.top <= c.vthresh) {
                    if (proc.el != el) {
                        this.startProc(el, "up");
                    }
                    return;
                } else if (pt.x - r.left <= c.hthresh) {
                    if (proc.el != el) {
                        this.startProc(el, "right");
                    }
                    return;
                }
            }
        }
        this.clearProc();
    },

    /**
     * Registers new overflow element(s) to auto scroll
     * @param {Mixed/Array} el The id of or the element to be scrolled or an array of either
     */
    register: function (el) {
        if (Ext.isArray(el)) {
            for (var i = 0, len = el.length; i < len; i++) {
                this.register(el[i]);
            }
        } else {
            el = Ext.get(el);
            this.els[el.id] = el;
        }
    },

    /**
     * Unregisters overflow element(s) so they are no longer scrolled
     * @param {Mixed/Array} el The id of or the element to be removed or an array of either
     */
    unregister: function (el) {
        if (Ext.isArray(el)) {
            for (var i = 0, len = el.length; i < len; i++) {
                this.unregister(el[i]);
            }
        } else {
            el = Ext.get(el);
            delete this.els[el.id];
        }
    },

    /**
     * The number of pixels from the top or bottom edge of a container the pointer needs to be to
     * trigger scrolling (defaults to 25)
     * @type Number
     */
    vthresh: 25,
    /**
     * The number of pixels from the right or left edge of a container the pointer needs to be to
     * trigger scrolling (defaults to 25)
     * @type Number
     */
    hthresh: 25,

    /**
     * The number of pixels to scroll in each scroll increment (defaults to 100)
     * @type Number
     */
    increment: 100,

    /**
     * The frequency of scrolls in milliseconds (defaults to 500)
     * @type Number
     */
    frequency: 500,

    /**
     * True to animate the scroll (defaults to true)
     * @type Boolean
     */
    animate: true,

    /**
     * The animation duration in seconds -
     * MUST BE less than Ext.dd.ScrollManager.frequency! (defaults to .4)
     * @type Number
     */
    animDuration: 0.4,

    /**
     * The named drag drop {@link Ext.dd.DragSource#ddGroup group} to which this container belongs (defaults to undefined).
     * If a ddGroup is specified, then container scrolling will only occur when a dragged object is in the same ddGroup.
     * @type String
     */
    ddGroup: undefined,

    /**
     * Manually trigger a cache refresh.
     */
    refreshCache: function () {
        var els = this.els,
            id;
        for (id in els) {
            if (typeof els[id] == 'object') { // for people extending the object prototype
                els[id]._region = els[id].getRegion();
            }
        }
    }
});
