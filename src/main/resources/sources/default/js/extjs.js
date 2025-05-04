/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.Wallpaper
 * @extends Ext.Component
 * <p>This component renders an image that stretches to fill the component.</p>
 */
Ext.define('Ext.ux.desktop.Wallpaper', {
    extend: 'Ext.Component',

    alias: 'widget.wallpaper',

    cls: 'ux-wallpaper',
    html: '<img src="'+Ext.BLANK_IMAGE_URL+'">',

    stretch: false,
    wallpaper: null,
    stateful  : true,
    stateId  : 'desk-wallpaper',

    afterRender: function () {
        var me = this;
        me.callParent();
        me.setWallpaper(me.wallpaper, me.stretch);
    },

    applyState: function () {
        var me = this, old = me.wallpaper;
        me.callParent(arguments);
        if (old != me.wallpaper) {
            me.setWallpaper(me.wallpaper);
        }
    },

    getState: function () {
        return this.wallpaper && { wallpaper: this.wallpaper };
    },

    setWallpaper: function (wallpaper, stretch) {
        var me = this, imgEl, bkgnd;

        me.stretch = (stretch !== false);
        me.wallpaper = wallpaper;

        if (me.rendered) {
            imgEl = me.el.dom.firstChild;

            if (!wallpaper || wallpaper == Ext.BLANK_IMAGE_URL) {
                Ext.fly(imgEl).hide();
            } else if (me.stretch) {
                imgEl.src = wallpaper;

                me.el.removeCls('ux-wallpaper-tiled');
                Ext.fly(imgEl).setStyle({
                    width: '100%',
                    height: '100%'
                }).show();
            } else {
                Ext.fly(imgEl).hide();

                bkgnd = 'url('+wallpaper+')';
                me.el.addCls('ux-wallpaper-tiled');
            }

            me.el.setStyle({
                backgroundImage: bkgnd || ''
            });
            if(me.stateful) {
                me.saveState();
            }
        }
        return me;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Ext.ux.desktop.StartMenu', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.menu.Menu',
        'Ext.toolbar.Toolbar'
    ],

    ariaRole: 'menu',
    cls: 'x-menu ux-start-menu',

    defaultAlign: 'bl-tl',

    iconCls: 'user',

    floating: true,

    shadow: true,

    // We have to hardcode a width because the internal Menu cannot drive our width.
    // This is combined with changing the align property of the menu's layout from the
    // typical 'stretchmax' to 'stretch' which allows the the items to fill the menu
    // area.
    width: 300,

    initComponent: function() {
        var me = this, menu = me.menu;
        me.menu = new Ext.menu.Menu({
            cls: 'ux-start-menu-body',
            border: false,
            floating: false,
            items: menu
        });
        me.menu.layout.align = 'stretch';

        me.items = [me.menu];
        me.layout = 'fit';

        Ext.menu.Manager.register(me);
        me.callParent();
        //  - relay menu events

        me.toolbar = new Ext.toolbar.Toolbar(Ext.apply({
            dock: 'right',
            cls: 'ux-start-menu-toolbar',
            vertical: true,
            width: 100
        }, me.toolConfig));

        me.toolbar.layout.align = 'stretch';
        me.addDocked(me.toolbar);

        delete me.toolItems;

        me.on('deactivate', function () {
            me.hide();
        });
    },

    addMenuItem: function() {
        var cmp = this.menu;
        cmp.add.apply(cmp, arguments);
    },

	clearMenus: function() {
		var cmp = this.menu;
		cmp.removeAll();
	},

    addToolItem: function() {
        var cmp = this.toolbar;
        cmp.add.apply(cmp, arguments);
    },

    showBy: function(cmp, pos, off) {
        var me = this;

        if (me.floating && cmp) {
            me.layout.autoSize = true;
            me.show();

            // Component or Element
            cmp = cmp.el || cmp;

            // Convert absolute to floatParent-relative coordinates if necessary.
            var xy = me.el.getAlignToXY(cmp, pos || me.defaultAlign, off);
            if (me.floatParent) {
                var r = me.floatParent.getTargetEl().getViewRegion();
                xy[0] -= r.x;
                xy[1] -= r.y;
            }
            me.showAt(xy);
            me.doConstrain();
        }
        return me;
    }
}); // StartMenu



/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.TaskBar
 * @extends Ext.toolbar.Toolbar
 */
Ext.define('Ext.ux.desktop.TaskBar', {
    extend: 'Ext.toolbar.Toolbar', //  - make this a basic hbox panel...

    requires: [
        'Ext.button.Button',
        'Ext.resizer.Splitter',
        'Ext.menu.Menu',

        'Ext.ux.desktop.StartMenu'
    ],

    alias: 'widget.taskbar',

    cls: 'ux-taskbar',

    /**
     * @cfg {String} startBtnText
     * The text for the Start Button.
     */
    startBtnText: 'Menü',

    initComponent: function () {
        var me = this;

        me.startMenu = new Ext.ux.desktop.StartMenu(me.startConfig);

        me.quickStart = new Ext.toolbar.Toolbar(me.getQuickStart());

        me.windowBar = new Ext.toolbar.Toolbar(me.getWindowBarConfig());

        me.tray = new Ext.toolbar.Toolbar(me.getTrayConfig());

        me.items = [
            {
				id: 'desktop-taskbar-btn-startmenu',
                xtype: 'button',
                cls: 'ux-start-button',
                iconCls: 'ux-start-button-icon',
                menu: me.startMenu,
                menuAlign: 'bl-tl',
                text: me.startBtnText
            },
            me.quickStart,
            {
                xtype: 'splitter', html: '&#160;',
                height: 14, width: 2, //  - there should be a CSS way here
                cls: 'x-toolbar-separator x-toolbar-separator-horizontal'
            },
            //'-',
            me.windowBar,
            '-',
            me.tray
        ];

        me.callParent();
    },

    afterLayout: function () {
        var me = this;
        me.callParent();
        me.windowBar.el.on('contextmenu', me.onButtonContextMenu, me);
    },

    /**
     * This method returns the configuration object for the Quick Start toolbar. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getQuickStart: function () {
        var me = this, ret = {
            minWidth: 20,
            width: 60,
            items: [],
            enableOverflow: true
        };

        Ext.each(this.quickStart, function (item) {
            ret.items.push({
                tooltip: { text: item.name, align: 'bl-tl' },
                //tooltip: item.name,
                overflowText: item.name,
                iconCls: item.iconCls,
                module: item.applicationModuleClass,
				fn: item.fn,
				fnScope: item.scope,
                handler: me.onQuickStartClick,
                scope: me
            });
        });

        return ret;
    },

    /**
     * This method returns the configuration object for the Tray toolbar. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getTrayConfig: function () {
        var ret = {
            width: 300,
            items: this.trayItems
        };
        delete this.trayItems;
        return ret;
    },

    getWindowBarConfig: function () {
        return {
            flex: 1,
            cls: 'ux-desktop-windowbar',
            items: [ '&#160;' ],
            layout: { overflowHandler: 'Scroller' }
        };
    },

    getWindowBtnFromEl: function (el) {
        var c = this.windowBar.getChildByElement(el);
        return c || null;
    },

    onQuickStartClick: function (btn) {
        if ( btn.fn != null ){
			Ext.callback(btn.fn, btn.scope, btn);
		} else if ( btn.module != null ){
			UGRJS.Desktop.initiateModule({
				cls: btn.module,
				form: 'default'
				// args: [ { key: string, value: string } ]
			});
		}
		/*
		var module = this.app.getModule(btn.module),
            window;

        if (module) {
            window = module.createWindow();
            window.show();
        }*/
    },

    onButtonContextMenu: function (e) {
        var me = this, t = e.getTarget(), btn = me.getWindowBtnFromEl(t);
        if (btn) {
            e.stopEvent();
            me.windowMenu.theWin = btn.win;
            me.windowMenu.showBy(t);
        }
    },

    onWindowBtnClick: function (btn) {
        var win = btn.win;

        if (win.minimized || win.hidden) {
            win.show();
        } else if (win.active) {
            win.minimize();
        } else {
            win.toFront();
        }
    },

    addTaskButton: function(win) {
        var config = {
			id: 'taskbar-windowbar-' + win.id,
            // iconCls: win.iconCls,
			icon: win.icon,
            enableToggle: true,
            toggleGroup: 'all',
            width: 140,
            margins: '0 2 0 3',
            text: Ext.util.Format.ellipsis(win.title, 20),
            listeners: {
                click: this.onWindowBtnClick,
                scope: this
            },
            win: win
        };

        var cmp = this.windowBar.add(config);
        cmp.toggle(true);
        return cmp;
    },

    removeTaskButton: function (btn) {
        var found, me = this;
        me.windowBar.items.each(function (item) {
            if (item === btn) {
                found = item;
            }
            return !found;
        });
        if (found) {
            me.windowBar.remove(found);
        }
        return found;
    },

    setActiveButton: function(btn) {
        if (btn) {
            btn.toggle(true);
        } else {
            this.windowBar.items.each(function (item) {
                if (item.isButton) {
                    item.toggle(false);
                }
            });
        }
    }
});

/**
 * @class Ext.ux.desktop.TrayClock
 * @extends Ext.toolbar.TextItem
 * This class displays a clock on the toolbar.
 */
Ext.define('Ext.ux.desktop.TrayClock', {
    extend: 'Ext.toolbar.TextItem',

    alias: 'widget.trayclock',

    cls: 'ux-desktop-trayclock',

    html: '&#160;',

    timeFormat: 'g:i A',

    tpl: '{time}',

    initComponent: function () {
        var me = this;

        me.callParent();

        if (typeof(me.tpl) == 'string') {
            me.tpl = new Ext.XTemplate(me.tpl);
        }
    },

    afterRender: function () {
        var me = this;
        Ext.Function.defer(me.updateTime, 100, me);
        me.callParent();
    },

    onDestroy: function () {
        var me = this;

        if (me.timer) {
            window.clearTimeout(me.timer);
            me.timer = null;
        }

        me.callParent();
    },

    updateTime: function () {
        var me = this, time = Ext.Date.format(new Date(), me.timeFormat),
            text = me.tpl.apply({ time: time });
        if (me.lastText != text) {
            me.setText(text);
            me.lastText = text;
        }
        me.timer = Ext.Function.defer(me.updateTime, 10000, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.Desktop
 * @extends Ext.panel.Panel
 * <p>This class manages the wallpaper, shortcuts and taskbar.</p>
 */
Ext.define('Ext.ux.desktop.Desktop', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.desktop',

	requires: [
		'UGRFrontend.desktop.view.GTDesktopView'
	],

    uses: [
        'Ext.util.MixedCollection',
        'Ext.menu.Menu',
        'Ext.view.View', // dataview
        'Ext.window.Window',

        'Ext.ux.desktop.TaskBar',
        'Ext.ux.desktop.Wallpaper'
    ],

    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    lastActiveWindow: null,

    border: false,
    html: '&#160;',
    layout: 'fit',

    xTickSize: 1,
    yTickSize: 1,

    app: null,

    /**
     * @cfg {Array|Store} shortcuts
     * The items to add to the DataView. This can be a {@link Ext.data.Store Store} or a
     * simple array. Items should minimally provide the fields in the
     * {@link Ext.ux.desktop.ShorcutModel ShortcutModel}.
     */
    shortcuts: null,

    /**
     * @cfg {String} shortcutItemSelector
     * This property is passed to the DataView for the desktop to select shortcut items.
     * If the {@link #shortcutTpl} is modified, this will probably need to be modified as
     * well.
     */
    shortcutItemSelector: 'div.ux-desktop-shortcut',

    /**
     * @cfg {String} shortcutTpl
     * This XTemplate is used to render items in the DataView. If this is changed, the
     * {@link shortcutItemSelect} will probably also need to changed.
     */
    shortcutTpl: [
        '<tpl for=".">',
            '<div class="ux-desktop-shortcut x-abs-layout-ct" id="{applicationModuleName}-shortcut" style="left:{userShortcutPosX}px; top:{userShortcutPosY}px; position:absolute">',
                '<div class="ux-desktop-shortcut-icon" id="{applicationModuleName}-shortcut-img" style="background-image: url(sources/assets/icons/', '48/{applicationModuleIcon})">',
                    '<img src="',Ext.BLANK_IMAGE_URL,'" title="{userShortcutTitle}">',
                '</div>',
                '<span class="ux-desktop-shortcut-text">{userShortcutTitle}</span>',
            '</div>',
        '</tpl>',
        '<div class="x-clear"></div>'
    ],

    /**
     * @cfg {Object} taskbarConfig
     * The config object for the TaskBar.
     */
    taskbarConfig: null,

    windowMenu: null,

    initComponent: function () {
        var me = this;

        me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());

        me.bbar = me.taskbar = new Ext.ux.desktop.TaskBar(me.taskbarConfig);
        me.taskbar.windowMenu = me.windowMenu;

        me.windows = new Ext.util.MixedCollection();

        me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());
		me.shortcutMenu = new Ext.menu.Menu(me.createShortcutMenu());

        me.items = [
            { xtype: 'wallpaper', id: me.id+'_wallpaper' },
            me.createDataView()
        ];

        me.callParent();

        me.shortcutsView = me.items.getAt(1);
        me.shortcutsView.on('itemclick', me.onShortcutItemClick, me);
		me.shortcutsView.on('itemcontextmenu', me.onShortcutItemRightClick, me);

        var wallpaper = me.wallpaper;
        me.wallpaper = me.items.getAt(0);
        if (wallpaper) {
            me.setWallpaper(wallpaper, me.wallpaperStretch);
        }
    },

	onShortcutItemRightClick: function(view, record, item, index, e, eOpts){
		var me = this;
		e.stopEvent();
		var editor = Ext.getCmp('shortcutmenu-rename-editor');
		editor.setValue(record.get('userShortcutTitle'));
		editor.dataRecord = record;
		me.shortcutMenu.showAt(e.xy);
	},

	closeAllWindows: function(){
		var me = this;
		me.windows.each(function(item){
			item.close();
		});
	},

    afterRender: function () {
        var me = this;
        me.callParent();
        me.el.on('contextmenu', me.onDesktopMenu, me);
    },

    //------------------------------------------------------
    // Overrideable configuration creation methods

    createDataView: function () {
        var me = this;
        return {
			id: 'desktop-shortcut-dataview',
            xtype: 'desktopview',
            overItemCls: 'x-view-over',
            trackOver: true,
            itemSelector: me.shortcutItemSelector,
            store: me.shortcuts,
            style: {
                position: 'absolute'
            },
            x: 0, y: 0,
            tpl: new Ext.XTemplate(me.shortcutTpl)
        };
    },

    createDesktopMenu: function () {
        var me = this, ret = {
            items: me.contextMenuItems || []
        };

        if (ret.items.length) {
            ret.items.push('-');
        }

        /*ret.items.push(
                { text: 'Tile', handler: me.tileWindows, scope: me, minWindows: 1 },
                { text: 'Cascade', handler: me.cascadeWindows, scope: me, minWindows: 1 })*/

        return ret;
    },

	createShortcutMenu: function () {
		var me = this;
        var ret = {};
		ret.items = [];

        ret.items.push({
			id: 'shortcutmenu-rename',
			icon: '../icons/stk/16/Systemconfig.png',
			text: 'Yeniden adlandır',
			handler: me.tileWindows,
			scope: me,
			menu: [
				{
					id: 'shortcutmenu-rename-editor',
					xtype: 'textfield',
                    placeholder: 'This is the first name',
                    tooltip: {
                        html: 'This is a tooltip',
                        autoCreate: true,
                        align: 'bl'
                    },
					width: 150,
					listeners: {
						specialkey: function(field, e){
							// e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
							// e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
							if (e.getKey() == e.ENTER) {
								field.dataRecord.set('userShortcutTitle', field.getValue());

								UGRJS.Desktop.runMethod({
									cls: 'org.erialab.libraries.server.services.desktop.ServiceUsershortcut',
									method: 'rename',
									args: [
										{key: 'userShortcutPK', value: field.dataRecord.get('userShortcutPK')},
										{key: 'userShortcutTitle', value: field.getValue()}
									],
									onSuccess : Ext.emptyFn,
									onFail: Ext.emptyFn,
									scope: this,
									processResponse: false
								});
							}
						}
					}
				}
			]
		});

        return ret;
    },

    createWindowMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                { text: 'Göster', handler: me.onWindowMenuRestore, scope: me },
                { text: 'Küçült', handler: me.onWindowMenuMinimize, scope: me },
                { text: 'Büyüt', handler: me.onWindowMenuMaximize, scope: me },
                '-',
                { text: 'Kapat', handler: me.onWindowMenuClose, scope: me }
            ],
            listeners: {
                beforeshow: me.onWindowMenuBeforeShow,
                hide: me.onWindowMenuHide,
                scope: me
            }
        };
    },

    //------------------------------------------------------
    // Event handler methods

    onDesktopMenu: function (e) {
        var me = this, menu = me.contextMenu;
        e.stopEvent();
        if (!menu.rendered) {
            menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
        }
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onDesktopMenuBeforeShow: function (menu) {
        var me = this, count = me.windows.getCount();

        menu.items.each(function (item) {
            var min = item.minWindows || 0;
            item.setDisabled(count < min);
        });
    },

    onShortcutItemClick: function (dataView, record) {
		// alert(record.raw.applicationModuleTypeFK.actualValue);
		if ( record.data.applicationModuleTypeFK.value == '00000000000000000000000000000003' ){
			window.open(record.data.applicationModuleClass, '_blank');
		} else {
			UGRJS.Desktop.initiateModule({
				cls: record.data.applicationModuleClass,
				form: record.data.applicationModuleForm
			});
		}
		/*
		var me = this, module = me.app.getModule(record.data.module),
            win = module && module.createWindow();

        if (win) {
            me.restoreWindow(win);
        } */
    },

    onWindowClose: function(win) {
        var me = this;
        me.windows.remove(win);
        me.taskbar.removeTaskButton(win.taskButton);
        me.updateActiveWindow();
    },

    //------------------------------------------------------
    // Window context menu handlers

    onWindowMenuBeforeShow: function (menu) {
        var items = menu.items.items, win = menu.theWin;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[1].setDisabled(win.minimized === true); // Minimize
        items[2].setDisabled(win.maximized === true || win.hidden === true); // Maximize
    },

    onWindowMenuClose: function () {
        var me = this, win = me.windowMenu.theWin;

        win.close();
    },

    onWindowMenuHide: function (menu) {
        menu.theWin = null;
    },

    onWindowMenuMaximize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.maximize();
        win.toFront();
    },

    onWindowMenuMinimize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.minimize();
    },

    onWindowMenuRestore: function () {
        var me = this, win = me.windowMenu.theWin;

        me.restoreWindow(win);
    },

    //------------------------------------------------------
    // Dynamic (re)configuration methods

    getWallpaper: function () {
        return this.wallpaper.wallpaper;
    },

    setTickSize: function(xTickSize, yTickSize) {
        var me = this,
            xt = me.xTickSize = xTickSize,
            yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

        me.windows.each(function(win) {
            var dd = win.dd, resizer = win.resizer;
            dd.xTickSize = xt;
            dd.yTickSize = yt;
            resizer.widthIncrement = xt;
            resizer.heightIncrement = yt;
        });
    },

    setWallpaper: function (wallpaper, stretch) {
        this.wallpaper.setWallpaper(wallpaper, stretch);
        return this;
    },

    //------------------------------------------------------
    // Window management methods

    cascadeWindows: function() {
        var x = 0, y = 0,
            zmgr = this.getDesktopZIndexManager();

        zmgr.eachBottomUp(function(win) {
            if (win.isWindow && win.isVisible() && !win.maximized) {
                win.setPosition(x, y);
                x += 20;
                y += 20;
            }
        });
    },

    createWindow: function(config, cls) {
        var me = this, win, cfg = Ext.applyIf(config || {}, {
                stateful: false,
                isWindow: true,
                constrainHeader: true,
                minimizable: true,
                maximizable: true
            });

        cls = cls || Ext.window.Window;
        win = me.add(new cls(cfg));

        me.windows.add(win);

        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;

        win.on({
            activate: me.updateActiveWindow,
            beforeshow: me.updateActiveWindow,
            deactivate: me.updateActiveWindow,
            minimize: me.minimizeWindow,
            destroy: me.onWindowClose,
            scope: me
        });

        win.on({
            boxready: function () {
                win.dd.xTickSize = me.xTickSize;
                win.dd.yTickSize = me.yTickSize;

                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize;
                }
            },
            single: true
        });

        // replace normal window close w/fadeOut animation:
        win.doClose = function ()  {
            win.doClose = Ext.emptyFn; // dblclick can call again...
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
                        win.destroy();
                    }
                }
            });
        };

        return win;
    },

    getActiveWindow: function () {
        var win = null,
            zmgr = this.getDesktopZIndexManager();

        if (zmgr) {
            // We cannot rely on activate/deactive because that fires against non-Window
            // components in the stack.

            zmgr.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false;
                }
                return true;
            });
        }

        return win;
    },

    getDesktopZIndexManager: function () {
        var windows = this.windows;
        //  - there has to be a better way to get this...
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
    },

    getWindow: function(id) {
        return this.windows.get(id);
    },

    minimizeWindow: function(win) {
        win.minimized = true;
        win.hide();
    },

    restoreWindow: function (win) {
        if (win.isVisible()) {
            win.restore();
            win.toFront();
        } else {
            win.show();
        }
        return win;
    },

    tileWindows: function() {
        var me = this, availWidth = me.body.getWidth(true);
        var x = me.xTickSize, y = me.yTickSize, nextY = y;

        me.windows.each(function(win) {
            if (win.isVisible() && !win.maximized) {
                var w = win.el.getWidth();

                // Wrap to next row if we are not at the line start and this Window will
                // go off the end
                if (x > me.xTickSize && x + w > availWidth) {
                    x = me.xTickSize;
                    y = nextY;
                }

                win.setPosition(x, y);
                x += w + me.xTickSize;
                nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
            }
        });
    },

	minimizeWindows: function(){
		var me = this;
		me.windows.each(function(win){
			if ( ! win.minimized ){
				me.minimizeWindow(win);
			}
		});
	},

	redrawWindows: function(){
		var me = this;
		me.windows.each(function(win){
			if ( ! win.minimized ){
				win.doLayout();
			}
		});
	},

    updateActiveWindow: function () {
        var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;
        if (activeWindow === last) {
            return;
        }

        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }
            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }

        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.Settings', {
    extend: 'Ext.window.Window',

    uses: [
        'Ext.tree.Panel',
        'Ext.tree.View',
        'Ext.form.field.Checkbox',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.Border',

        'Ext.ux.desktop.Wallpaper',

        'MyDesktop.WallpaperModel'
    ],

    layout: 'anchor',
    title: 'Change Settings',
    modal: true,
    width: 640,
    height: 480,
    border: false,

    initComponent: function () {
        var me = this;

        me.selected = me.desktop.getWallpaper();
        me.stretch = me.desktop.wallpaper.stretch;

        me.preview = Ext.create('widget.wallpaper');
        me.preview.setWallpaper(me.selected);
        me.tree = me.createTree();

        me.buttons = [
            { text: 'OK', handler: me.onOK, scope: me },
            { text: 'Cancel', handler: me.close, scope: me }
        ];

        me.items = [
            {
                anchor: '0 -30',
                border: false,
                layout: 'border',
                items: [
                    me.tree,
                    {
                        xtype: 'panel',
                        title: 'Preview',
                        region: 'center',
                        layout: 'fit',
                        items: [ me.preview ]
                    }
                ]
            },
            {
                xtype: 'checkbox',
                boxLabel: 'Stretch to fit',
                checked: me.stretch,
                listeners: {
                    change: function (comp) {
                        me.stretch = comp.checked;
                    }
                }
            }
        ];

        me.callParent();
    },

    createTree : function() {
        var me = this;

        function child (img) {
            return { img: img, text: me.getTextOfWallpaper(img), iconCls: '', leaf: true };
        }

        var tree = new Ext.tree.Panel({
            title: 'Desktop Background',
            rootVisible: false,
            lines: false,
            autoScroll: true,
            width: 150,
            region: 'west',
            split: true,
            minWidth: 100,
            listeners: {
                afterrender: { fn: this.setInitialSelection, delay: 100 },
                select: this.onSelect,
                scope: this
            },
            store: new Ext.data.TreeStore({
                model: 'MyDesktop.WallpaperModel',
                root: {
                    text:'Wallpaper',
                    expanded: true,
                    children:[
                        { text: "None", iconCls: '', leaf: true },
                        child('Blue-Sencha.jpg'),
                        child('Dark-Sencha.jpg'),
                        child('Wood-Sencha.jpg'),
                        child('blue.jpg'),
                        child('desk.jpg'),
                        child('desktop.jpg'),
                        child('desktop2.jpg'),
                        child('sky.jpg')
                    ]
                }
            })
        });

        return tree;
    },

    getTextOfWallpaper: function (path) {
        var text = path, slash = path.lastIndexOf('/');
        if (slash >= 0) {
            text = text.substring(slash+1);
        }
        var dot = text.lastIndexOf('.');
        text = Ext.String.capitalize(text.substring(0, dot));
        text = text.replace(/[-]/g, ' ');
        return text;
    },

    onOK: function () {
        var me = this;
        if (me.selected) {
            me.desktop.setWallpaper(me.selected, me.stretch);
        }
        me.destroy();
    },

    onSelect: function (tree, record) {
        var me = this;

        if (record.data.img) {
            me.selected = 'wallpapers/' + record.data.img;
        } else {
            me.selected = Ext.BLANK_IMAGE_URL;
        }

        me.preview.setWallpaper(me.selected);
    },

    setInitialSelection: function () {
        var s = this.desktop.getWallpaper();
        if (s) {
            var path = '/Wallpaper/' + this.getTextOfWallpaper(s);
            this.tree.selectPath(path, 'text');
        }
    }
});


/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

var windowIndex = 0;

Ext.define('MyDesktop.BogusModule', {
    extend: 'Ext.ux.desktop.Module',

    init : function(){
        this.launcher = {
            text: 'Window '+(++windowIndex),
            iconCls:'bogus',
            handler : this.createWindow,
            scope: this,
            windowId:windowIndex
        }
    },

    createWindow : function(src){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('bogus'+src.windowId);
        if(!win){
            win = desktop.createWindow({
                id: 'bogus'+src.windowId,
                title:src.text,
                width:640,
                height:480,
                html : '<p>Something useful would be in here.</p>',
                iconCls: 'bogus',
                animCollapse:false,
                constrainHeader:true
            });
        }
        win.show();
        return win;
    }
});

/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

Ext.define('MyDesktop.BogusMenuModule', {
    extend: 'MyDesktop.BogusModule',

    init : function() {

        this.launcher = {
            text: 'More items',
            iconCls: 'bogus',
            handler: function() {
                return false;
            },
            menu: {
                items: []
            }
        };

        for (var i = 0; i < 5; ++i) {
            this.launcher.menu.items.push({
                text: 'Window '+(++windowIndex),
                iconCls:'bogus',
                handler : this.createWindow,
                scope: this,
                windowId: windowIndex
            });
        }
    }
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.Terminal', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        //'Ext.form.field.HtmlEditor'
        'Ext.form.field.TextArea'
    ],

    id: 'terminal',

    init : function(){
		this.launcher = {
            text: 'Terminal',
            iconCls:'notepad'
        }
    },

    createWindow : function(){
		var me = this;
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('terminal');
        if(!win){
            win = desktop.createWindow({
                id: 'terminal',
                title:'Terminal',
                width:600,
                height:400,
                iconCls: 'notepad',
                animCollapse:false,
                border: false,
                //defaultFocus: 'notepad-editor', EXTJSIV-1300

                // IE has a bug where it will keep the iframe's background visible when the window
                // is set to visibility:hidden. Hiding the window via position offsets instead gets
                // around this bug.
                hideMode: 'offsets',

                layout: 'fit',
                items: [
                    {
                        //xtype: 'htmleditor',
                        xtype: 'textarea',
                        id: 'terminal-console',
                        // value: [
                        //    'Some <b>rich</b> <font color="red">text</font> goes <u>here</u><br>',
                        //    'Give it a try!'
                        //].join('')
						value: 'Beginning connection...'
                    }
                ]
            });
        }
        return win;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.AccordionWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.data.TreeStore',
        'Ext.layout.container.Accordion',
        'Ext.toolbar.Spacer',
        'Ext.tree.Panel'
    ],

    id:'acc-win',

    init : function(){
        this.launcher = {
            text: 'Accordion Window',
            iconCls:'accordion'
        };
    },

    createTree : function(){
        var tree = Ext.create('Ext.tree.Panel', {
            id:'im-tree',
            title: 'Online Users',
            rootVisible:false,
            lines:false,
            autoScroll:true,
            tools:[{
                type: 'refresh',
                handler: function(c, t) {
                    tree.setLoading(true, tree.body);
                    var root = tree.getRootNode();
                    root.collapseChildren(true, false);
                    Ext.Function.defer(function() { // mimic a server call
                        tree.setLoading(false);
                        root.expand(true, true);
                    }, 1000);
                }
            }],
            store: Ext.create('Ext.data.TreeStore', {
                root: {
                    text:'Online',
                    expanded: true,
                    children:[{
                        text:'Friends',
                        expanded:true,
                        children:[
                            { text:'Brian', iconCls:'user', leaf:true },
                            { text:'Kevin', iconCls:'user', leaf:true },
                            { text:'Mark', iconCls:'user', leaf:true },
                            { text:'Matt', iconCls:'user', leaf:true },
                            { text:'Michael', iconCls:'user', leaf:true },
                            { text:'Mike Jr', iconCls:'user', leaf:true },
                            { text:'Mike Sr', iconCls:'user', leaf:true },
                            { text:'JR', iconCls:'user', leaf:true },
                            { text:'Rich', iconCls:'user', leaf:true },
                            { text:'Nige', iconCls:'user', leaf:true },
                            { text:'Zac', iconCls:'user', leaf:true }
                        ]
                    },{
                        text:'Family',
                        expanded:true,
                        children:[
                            { text:'Kiana', iconCls:'user-girl', leaf:true },
                            { text:'Aubrey', iconCls:'user-girl', leaf:true },
                            { text:'Cale', iconCls:'user-kid', leaf:true }
                        ]
                    }]
                }
            })
        });

        return tree;
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('acc-win');

        if (!win) {
            win = desktop.createWindow({
                id: 'acc-win',
                title: 'Accordion Window',
                width: 250,
                height: 400,
                iconCls: 'accordion',
                animCollapse: false,
                constrainHeader: true,
                bodyBorder: true,
                tbar: {
                    xtype: 'toolbar',
                    ui: 'plain',
                    items: [{
                        tooltip:{title:'Rich Tooltips', text:'Let your users know what they can do!'},
                        iconCls:'connect'
                    },
                    '-',
                    {
                        tooltip:'Add a new user',
                        iconCls:'user-add'
                    },
                    ' ',
                    {
                        tooltip:'Remove the selected user',
                        iconCls:'user-delete'
                    }]
                },

                layout: 'accordion',
                border: false,

                items: [
                    this.createTree(),
                    {
                        title: 'Settings',
                        html:'<p>Something useful would be in here.</p>',
                        autoScroll:true
                    },
                    {
                        title: 'Even More Stuff',
                        html : '<p>Something useful would be in here.</p>'
                    },
                    {
                        title: 'My Stuff',
                        html : '<p>Something useful would be in here.</p>'
                    }
                ]
            });
        }

        return win;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.TabWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.tab.Panel'
    ],

    id:'tab-win',

    init : function(){
        this.launcher = {
            text: 'Tab Window',
            iconCls:'tabs'
        }
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('tab-win');
        if(!win){
            win = desktop.createWindow({
                id: 'tab-win',
                title:'Tab Window',
                width:740,
                height:480,
                iconCls: 'tabs',
                animCollapse:false,
                border:false,
                constrainHeader:true,

                layout: 'fit',
                items: [
                    {
                        xtype: 'tabpanel',
                        activeTab:0,
                        bodyStyle: 'padding: 5px;',

                        items: [{
                            title: 'Tab Text 1',
                            header:false,
                            html : '<p>Something useful would be in here.</p>',
                            border:false
                        },{
                            title: 'Tab Text 2',
                            header:false,
                            html : '<p>Something useful would be in here.</p>',
                            border:false
                        },{
                            title: 'Tab Text 3',
                            header:false,
                            html : '<p>Something useful would be in here.</p>',
                            border:false
                        },{
                            title: 'Tab Text 4',
                            header:false,
                            html : '<p>Something useful would be in here.</p>',
                            border:false
                        }]
                    }
                ]
            });
        }
        return win;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.GridWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.data.ArrayStore',
        'Ext.util.Format',
        'Ext.grid.Panel',
        'Ext.grid.RowNumberer'
    ],

    id:'grid-win',

    init : function(){
        this.launcher = {
            text: 'Grid Window',
            iconCls:'icon-grid'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('grid-win');
        if(!win){
            win = desktop.createWindow({
                id: 'grid-win',
                title:'Grid Window',
                width:740,
                height:480,
                iconCls: 'icon-grid',
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items: [
                    {
                        border: false,
                        xtype: 'grid',
                        store: new Ext.data.ArrayStore({
                            fields: [
                               { name: 'company' },
                               { name: 'price', type: 'float' },
                               { name: 'change', type: 'float' },
                               { name: 'pctChange', type: 'float' }
                            ],
                            data: MyDesktop.GridWindow.getDummyData()
                        }),
                        columns: [
                            new Ext.grid.RowNumberer(),
                            {
                                text: "Company",
                                flex: 1,
                                sortable: true,
                                dataIndex: 'company'
                            },
                            {
                                text: "Price",
                                width: 70,
                                sortable: true,
                                renderer: Ext.util.Format.usMoney,
                                dataIndex: 'price'
                            },
                            {
                                text: "Change",
                                width: 70,
                                sortable: true,
                                dataIndex: 'change'
                            },
                            {
                                text: "% Change",
                                width: 70,
                                sortable: true,
                                dataIndex: 'pctChange'
                            }
                        ]
                    }
                ],
                tbar:[{
                    text:'Add Something',
                    tooltip:'Add a new row',
                    iconCls:'add'
                }, '-', {
                    text:'Options',
                    tooltip:'Modify options',
                    iconCls:'option'
                },'-',{
                    text:'Remove Something',
                    tooltip:'Remove the selected item',
                    iconCls:'remove'
                }]
            });
        }
        return win;
    },

    statics: {
        getDummyData: function () {
            return [
                ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
                ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
                ['American Express Company',52.55,0.01,0.02,'9/1 12:00am'],
                ['American International Group, Inc.',64.13,0.31,0.49,'9/1 12:00am'],
                ['AT&T Inc.',31.61,-0.48,-1.54,'9/1 12:00am'],
                ['Caterpillar Inc.',67.27,0.92,1.39,'9/1 12:00am'],
                ['Citigroup, Inc.',49.37,0.02,0.04,'9/1 12:00am'],
                ['Exxon Mobil Corp',68.1,-0.43,-0.64,'9/1 12:00am'],
                ['General Electric Company',34.14,-0.08,-0.23,'9/1 12:00am'],
                ['General Motors Corporation',30.27,1.09,3.74,'9/1 12:00am'],
                ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
                ['Honeywell Intl Inc',38.77,0.05,0.13,'9/1 12:00am'],
                ['Intel Corporation',19.88,0.31,1.58,'9/1 12:00am'],
                ['Johnson & Johnson',64.72,0.06,0.09,'9/1 12:00am'],
                ['Merck & Co., Inc.',40.96,0.41,1.01,'9/1 12:00am'],
                ['Microsoft Corporation',25.84,0.14,0.54,'9/1 12:00am'],
                ['The Coca-Cola Company',45.07,0.26,0.58,'9/1 12:00am'],
                ['The Procter & Gamble Company',61.91,0.01,0.02,'9/1 12:00am'],
                ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am'],
                ['Walt Disney Company (The) (Holding Company)',29.89,0.24,0.81,'9/1 12:00am']
            ];
        }
    }
});



/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

// From code originally written by David Davis (http://www.sencha.com/blog/html5-video-canvas-and-ext-js/)

Ext.define('MyDesktop.VideoWindow', {
    extend: 'Ext.ux.desktop.Module',

    uses: [
        'Ext.ux.desktop.Video'
    ],

    id:'video',
    windowId: 'video-window',

    tipWidth: 160,
    tipHeight: 96,

    init : function(){
        this.launcher = {
            text: 'About Ext JS',
            iconCls:'video'
        }
    },

    createWindow : function(){
        var me = this, desktop = me.app.getDesktop(),
            win = desktop.getWindow(me.windowId);

        if (!win) {
            win = desktop.createWindow({
                id: me.windowId,
                title: 'About Ext JS',
                width: 740,
                height: 480,
                iconCls: 'video',
                animCollapse: false,
                border: false,

                layout: 'fit',
                items: [
                    {
                        xtype: 'video',
                        id: 'video-player',
                        src: [
                            // browser will pick the format it likes most:
                            { src: 'http://dev.sencha.com/desktopvideo.mp4', type: 'video/mp4' },
                            { src: 'http://dev.sencha.com/desktopvideo.ogv', type: 'video/ogg' },
                            { src: 'http://dev.sencha.com/desktopvideo.mov', type: 'video/quicktime' }
                        ],
                        autobuffer: true,
                        autoplay : true,
                        controls : true,
                        /* default */
                        listeners: {
                            afterrender: function(video) {
                                me.videoEl = video.video.dom;

                                if (video.supported) {
                                    me.tip = new Ext.tip.ToolTip({
                                        anchor   : 'bottom',
                                        dismissDelay : 0,
                                        height   : me.tipHeight,
                                        width    : me.tipWidth,
                                        renderTpl: [
                                            '<canvas width="', me.tipWidth,
                                                  '" height="', me.tipHeight, '">'
                                        ],
                                        renderSelectors: {
                                            body: 'canvas'
                                        },
                                        listeners: {
                                            afterrender: me.onTooltipRender,
                                            show: me.renderPreview,
                                            scope: me
                                        }
                                    }); // tip
                                }
                            }
                        }
                    }
                ],
                listeners: {
                    beforedestroy: function() {
                        me.tip = me.ctx = me.videoEl = null;
                    }
                }
            });
        }

        if (me.tip) {
            me.tip.setTarget(win.taskButton.el);
        }

        return win;
    },

    onTooltipRender: function (tip) {
        // get the canvas 2d context
        var el = tip.body.dom, me = this;
        me.ctx = el.getContext && el.getContext('2d');
    },

    renderPreview: function() {
        var me = this;

        if ((me.tip && !me.tip.isVisible()) || !me.videoEl) {
            return;
        }

        if (me.ctx) {
            try {
                me.ctx.drawImage(me.videoEl, 0, 0, me.tipWidth, me.tipHeight);
            } catch(e) {};
        }

        // 20ms to keep the tooltip video smooth
        Ext.Function.defer(me.renderPreview, 20, me);
    }
});


/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

Ext.define('MyDesktop.SystemStatus', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.chart.*'
    ],

    id: 'systemstatus',

    refreshRate: 500,

    init : function() {
        // No launcher means we don't appear on the Start Menu...
//        this.launcher = {
//            text: 'SystemStatus',
//            iconCls:'cpustats'
//        };

        Ext.chart.theme.Memory = Ext.extend(Ext.chart.theme.Base, {
            constructor: function(config) {
                Ext.chart.theme.Memory.superclass.constructor.call(this, Ext.apply({
                    colors: [ 'rgb(244, 16, 0)',
                              'rgb(248, 130, 1)',
                              'rgb(0, 7, 255)',
                              'rgb(84, 254, 0)']
                }, config));
            }
        });
    },

    createNewWindow: function () {
        var me = this,
            desktop = me.app.getDesktop();

        me.cpuLoadData = [];
        me.cpuLoadStore = Ext.create('store.json', {
            fields: ['core1', 'core2', 'time']
        });

        me.memoryArray = ['Wired', 'Active', 'Inactive', 'Free'];
        me.memoryStore = Ext.create('store.json', {
                fields: ['name', 'memory'],
                data: me.generateData(me.memoryArray)
            });

        me.pass = 0;
        me.processArray = ['explorer', 'monitor', 'charts', 'desktop', 'Ext3', 'Ext4'];
        me.processesMemoryStore = Ext.create('store.json', {
            fields: ['name', 'memory'],
            data: me.generateData(me.processArray)
        });

        me.generateCpuLoad();

        return desktop.createWindow({
            id: 'systemstatus',
            title: 'System Status',
            width: 800,
            height: 600,
            animCollapse:false,
            constrainHeader:true,
            border: false,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            bodyStyle: {
                'background-color': '#FFF'
            },
            listeners: {
                afterrender: {
                    fn: me.updateCharts,
                    delay: 100
                },
                destroy: function () {
                    clearTimeout(me.updateTimer);
                    me.updateTimer = null;
                },
                scope: me
            },
            items: [{
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    me.createCpu1LoadChart(),
                    me.createCpu2LoadChart()
                ]
            }, {
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    me.createMemoryPieChart(),
                    me.createProcessChart()
                ]
            }]
        });
    },

    createWindow : function() {
        var win = this.app.getDesktop().getWindow(this.id);
        if (!win) {
            win = this.createNewWindow();
        }
        return win;
    },

    createCpu1LoadChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category1',
            animate: false,
            store: this.cpuLoadStore,
            legend: {
                position: 'bottom'
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 100,
                fields: ['core1'],
                title: 'CPU Load',
                grid: true,
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            }],
            series: [{
                title: 'Core 1 (3.4GHz)',
                type: 'line',
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: 'left',
                xField: 'time',
                yField: 'core1',
                style: {
                    'stroke-width': 1
                }
            }]
        };
    },

    createCpu2LoadChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category2',
            animate: false,
            store: this.cpuLoadStore,
            legend: {
                position: 'bottom'
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 100,
                grid: true,
                fields: ['core2'],
                title: 'CPU Load',
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            }],
            series: [{
                title: 'Core 2 (3.4GHz)',
                type: 'line',
                lineWidth: 4,
                showMarkers: false,
                fill: true,
                axis: 'left',
                xField: 'time',
                yField: 'core2',
                style: {
                    'stroke-width': 1
                }
            }]
        };
    },

    createMemoryPieChart: function () {
        var me = this;

        return {
            flex: 1,
            xtype: 'chart',
            animate: {
                duration: 250
            },
            store: this.memoryStore,
            shadow: true,

            legend: {
                position: 'right'
            },
            insetPadding: 40,
            theme: 'Memory:gradients',
            series: [{
                donut: 30,
                type: 'pie',
                field: 'memory',
                showInLegend: true,
                tips: {
                    trackMouse: true,
                    width: 140,
                    height: 28,
                    renderer: function(storeItem, item) {
                        //calculate percentage.
                        var total = 0;
                        me.memoryStore.each(function(rec) {
                            total += rec.get('memory');
                        });
                        this.setTitle(storeItem.get('name') + ': ' +
                            Math.round(storeItem.get('memory') / total * 100) + '%');
                    }
                },
                highlight: {
                    segment: {
                        margin: 20
                    }
                },
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    field: 'name',
                    display: 'rotate',
                    contrast: true,
                    font: '12px Arial'
                }
            }]
        };
    },

    createProcessChart: function () {
        return {
            flex: 1,
            xtype: 'chart',
            theme: 'Category1',
            store: this.processesMemoryStore,
            animate: {
                easing: 'ease-in-out',
                duration: 750
            },
            axes: [{
                type: 'Numeric',
                position: 'left',
                minimum: 0,
                maximum: 10,
                fields: ['memory'],
                title: 'Memory',
                labelTitle: {
                    font: '13px Arial'
                },
                label: {
                    font: '11px Arial'
                }
            },{
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: 'System Processes',
                labelTitle: {
                    font: 'bold 14px Arial'
                },
                label: {
                    rotation: {
                        degrees: 45
                    }
                }
            },{
                type: 'Numeric',
                position: 'top',
                fields: ['memory'],
                title: 'Memory Usage',
                labelTitle: {
                    font: 'bold 14px Arial'
                },
                label: {
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF'
                },
                axisStyle: {
                    fill: '#FFFFFF',
                    stroke: '#FFFFFF'
                }
            }],
            series: [{
                title: 'Processes',
                type: 'column',
                xField: 'name',
                yField: 'memory',
                renderer: function(sprite, record, attr, index, store) {
                    var lowColor = Ext.draw.Color.fromString('#b1da5a'),
                        value = record.get('memory'),
                        color;

                    if (value > 5) {
                        color = lowColor.getDarker((value - 5) / 15).toString();
                    } else {
                        color = lowColor.getLighter(((5 - value) / 20)).toString();
                    }

                    if (value >= 8) {
                        color = '#CD0000';
                    }

                    return Ext.apply(attr, {
                        fill: color
                    });
                }
            }]
        };
    },

    generateCpuLoad: function () {
        var me = this,
            data = me.cpuLoadData;

        function generate(factor) {
            var value = factor + ((Math.floor(Math.random() * 2) % 2) ? -1 : 1) * Math.floor(Math.random() * 9);

            if (value < 0 || value > 100) {
                value = 50;
            }

            return value;
        }

        if (data.length === 0) {
            data.push({
                core1: 0,
                core2: 0,
                time: 0
            });

            for (var i = 1; i < 100; i++) {
                data.push({
                    core1: generate(data[i - 1].core1),
                    core2: generate(data[i - 1].core2),
                    time: i
                });
            }

            me.cpuLoadStore.loadData(data);
        } else {
            me.cpuLoadStore.data.removeAt(0);
            me.cpuLoadStore.data.each(function(item, key) {
                item.data.time = key;
            });

            var lastData = me.cpuLoadStore.last().data;
            me.cpuLoadStore.loadData([{
                core1: generate(lastData.core1),
                core2: generate(lastData.core2),
                time: lastData.time + 1
            }], true);
        }

    },

    generateData: function (names) {
        var data = [],
            i,
            rest = names.length, consume;

        for (i = 0; i < names.length; i++) {
            consume = Math.floor(Math.random() * rest * 100) / 100 + 2;
            rest = rest - (consume - 5);
            data.push({
                name: names[i],
                memory: consume
            });
        }

        return data;
    },

    updateCharts: function () {
        var me = this;
        clearTimeout(me.updateTimer);
        me.updateTimer = setTimeout(function() {
            var start = new Date().getTime();
            if (me.pass % 3 === 0) {
                me.memoryStore.loadData(me.generateData(me.memoryArray));
            }

            if (me.pass % 5 === 0) {
                me.processesMemoryStore.loadData(me.generateData(me.processArray));
            }

            me.generateCpuLoad();

            var end = new Date().getTime();

            // no more than 25% average CPU load
            me.refreshRate = Math.max(me.refreshRate, (end - start) * 4);

            me.updateCharts();
            me.pass++;
        }, me.refreshRate);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.ShortcutModel
 * @extends Ext.data.Model
 * This model defines the minimal set of fields for desktop shortcuts.
 */
Ext.define('Ext.ux.desktop.ShortcutModel', {
    extend: 'Ext.data.Model',
    fields: [
       { name: 'applicationModuleName' },
	   { name: 'applicationModuleIconFolder' },
       { name: 'applicationModuleIcon' },
       { name: 'userShortcutTitle' },
	   { name: 'userShortcutPosX' },
	   { name: 'userShortcutPosY' },
	   { name: 'applicationModuleTypeFK' },
	   { name: 'applicationModuleClass' },
	   { name: 'userShortcutPK' }
    ]
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Ext.ux.desktop.App', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.container.Viewport',

        'Ext.ux.desktop.Desktop'
    ],

    isReady: false,
    modules: null,
    useQuickTips: true,

    constructor: function (config) {
        var me = this;
        me.addEvents(
            'ready',
            'beforeunload'
        );
		if(config != null){
			if(config.length > 0){
				me.wallpaper = config;
			}
		}
        me.mixins.observable.constructor.call(this, config);
        /*var map = new Ext.util.KeyMap(document,{
                key: [10,13], // this works,
                fn: function(){ alert('key was pressed.!'); }
            }
        );*/
        if (Ext.isReady) {
            Ext.Function.defer(me.init, 10, me);
        } else {
            Ext.onReady(me.init, me);
        }
    },

    init: function() {
        var me = this, desktopCfg;

		me.initOverrides();

        if (me.useQuickTips) {
            Ext.QuickTips.init();
        }

        me.modules = me.getModules();
        if (me.modules) {
            me.initModules(me.modules);
        }

        desktopCfg = me.getDesktopConfig();
        me.desktop = new Ext.ux.desktop.Desktop(desktopCfg);

        me.viewport = new Ext.container.Viewport({
            layout: 'fit',
            items: [ me.desktop ]
        });

        Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);

        me.isReady = true;
        me.fireEvent('ready', me);
    },

    /**
     * This method returns the configuration object for the Desktop object. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getDesktopConfig: function () {
        var me = this, cfg = {
            app: me,
            taskbarConfig: me.getTaskbarConfig()
        };

        Ext.apply(cfg, me.desktopConfig);
        return cfg;
    },

    getModules: Ext.emptyFn,

    /**
     * This method returns the configuration object for the Start Button. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getStartConfig: function () {
        var me = this,
            cfg = {
                app: me,
                menu: []
            },
            launcher;

        Ext.apply(cfg, me.startConfig);


        Ext.each(me.modules, function (module) {
            launcher = module.launcher;
            if (launcher) {
                launcher.handler = launcher.handler || Ext.bind(me.createWindow, me, [module]);
                cfg.menu.push(module.launcher);
            }
        });


        return cfg;
    },

    createWindow: function(module) {
        var window = module.createWindow();
        window.show();
    },

    /**
     * This method returns the configuration object for the TaskBar. A derived class
     * can override this method, call the base version to build the config and then
     * modify the returned object before returning it.
     */
    getTaskbarConfig: function () {
        var me = this, cfg = {
            app: me,
            startConfig: me.getStartConfig()
        };

        Ext.apply(cfg, me.taskbarConfig);
        return cfg;
    },

    initModules : function(modules) {
        var me = this;
        Ext.each(modules, function (module) {
            module.app = me;
        });
    },

    getModule : function(name) {
    	var ms = this.modules;
        for (var i = 0, len = ms.length; i < len; i++) {
            var m = ms[i];
            if (m.id == name || m.appType == name) {
                return m;
            }
        }
        return null;
    },

    onReady : function(fn, scope) {
        if (this.isReady) {
            fn.call(scope, this);
        } else {
            this.on({
                ready: fn,
                scope: scope,
                single: true
            });
        }
    },

    getDesktop : function() {
        return this.desktop;
    },

    onUnload : function(e) {
        if (this.fireEvent('beforeunload', this) === false) {
            e.stopEvent();
        }
    },

	initOverrides: function(){
		Ext.override('Ext.grid.header.Container', {
            layout: "fit",
			getMenuItems: function() {
				alert('menu');
				var me = this,
					menuItems = [],
					hideableColumns = me.enableColumnHide ? me.getColumnMenu(me) : null;

				if (me.sortable) {
					menuItems = [{
						itemId: 'ascItem',
						text: 'Artan sıralama',
						cls: Ext.baseCSSPrefix + 'hmenu-sort-asc',
						handler: me.onSortAscClick,
						scope: me
					},{
						itemId: 'descItem',
						text: me.sortDescText,
						cls: Ext.baseCSSPrefix + 'hmenu-sort-desc',
						handler: me.onSortDescClick,
						scope: me
					}];
				}
				if (hideableColumns && hideableColumns.length) {
					menuItems.push('-', {
						itemId: 'columnItem',
						text: me.columnsText,
						cls: Ext.baseCSSPrefix + 'cols-icon',
						menu: hideableColumns
					});
				}
				return menuItems;
			}
		});
	}
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('MyDesktop.App', {
    extend: 'Ext.ux.desktop.App',

    requires: [
        'Ext.window.MessageBox',

        'Ext.ux.desktop.ShortcutModel',

        'MyDesktop.SystemStatus',
        'MyDesktop.VideoWindow',
        'MyDesktop.GridWindow',
        'MyDesktop.TabWindow',
        'MyDesktop.AccordionWindow',
        'MyDesktop.Terminal',
        'MyDesktop.BogusMenuModule',
        'MyDesktop.BogusModule',

//        'MyDesktop.Blockalanche',
        'MyDesktop.Settings'
    ],

    init: function() {
        var me = this;
        // custom logic before getXYZ methods get called...

        this.callParent();
        /*var map = new Ext.util.KeyMap(document,{
                key: [10,13], // this works,
                fn: function(){
                    me.getReportForm();
                }
            }
        );*/
        // now ready...
    },

	modules: [],

	setModules : function(modules){
		var me = this;
		me.modules = modules;
	},

	loginShortcutData: {
		applicationModuleName: 'login',
		applicationModuleIcon: 'gnome-lockscreen.png',
		applicationModuleClass: 'defsu.system.projects.sys.services.auth.LoginService',
		userShortcutTitle: 'Giriş Yap',
		userShortcutPosX : '50',
		userShortcutPosY : '50'
	},

    getModules : function(){
		var me = this;

		return me.modules;
        /*
		return [
			new MyDesktop.VideoWindow(),
            //new MyDesktop.Blockalanche(),
            new MyDesktop.SystemStatus(),
            new MyDesktop.GridWindow(),
            new MyDesktop.TabWindow(),
            new MyDesktop.AccordionWindow(),
            new MyDesktop.Terminal(),
            new MyDesktop.BogusMenuModule(),
            new MyDesktop.BogusModule()
        ];
		*/
    },

	wallpaper : 'sources/assets/images/bg.jpg',
    getDesktopConfig: function () {
        var me = this, ret = me.callParent();

        return Ext.apply(ret, {
            //cls: 'ux-desktop-black',

            contextMenuItems: [
                { text: 'Kısayolları Diz', handler: me.onShortcutOrder, scope: me },
                {
                    xtype: 'button',
                    text: 'Çıkış Yap',
                    itemId: 'logoutButton',
                    action: 'showToolbar',
                    iconCls:'logout',
                    pack: 'center',
                    handler: me.onLogout,
                },
            ],

            shortcuts: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.desktop.ShortcutModel',
                data: [
                    me.loginShortcutData
                ]
            }),

            wallpaper: me.wallpaper,
            wallpaperStretch: false
        });
    },

    // config for the start menu
    getStartConfig : function() {
        var me = this, ret = me.callParent();
        var themeStore = Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                { name: 'Gemlik', value: 'ext-all.css' },
                { name: 'Kapadokya', value: 'ext-all-gray.css' },
                { name: 'Tema 3', value: 'ext-ie.css' },
                { name: 'Tema 4', value: 'ext-neptune.css' },
                { name: 'Tema 5', value: 'ext-standart.css' },
                { name: 'Neptün', value: 'theme-neptune.css' },
                { name: 'Custom', value: 'theme-custom.css' }
            ]
        });
        return Ext.apply(ret, {
            title: '',
            iconCls: 'user',
            minHeight: 300,
            toolConfig: {
                width: 100,
                items: [
					{
						id: 'desktop-taskbar-btn-help',
                        text:'Duyurular',
                        iconCls:'bogus',
                        handler: me.onPr,
                        scope: me
                    },
                    {
						id: 'desktop-taskbar-btn-settings',
                        text:'Ayarlar',
                        iconCls:'settings',
                        handler: me.onSettings,
                        scope: me
                    },
                    {
                        xtype: 'combobox',
                        store: themeStore,
                        displayField: 'name',
                        valueField: 'value',
                        queryMode: 'local',
                        emptyText: 'Temalar',
                        listeners: {
                            change: function (combo, newValue) {
                                // Tema değiştirme fonksiyonunu çağırın
                                me.switchTheme(newValue);
                            }
                        }
                    },
                    '-',
                    {
						id: 'desktop-taskbar-btn-logout',
                        text:'Çıkış',
                        iconCls:'logout',
                        handler: me.onLogout,
                        scope: me
                    },

                ]
            }
        });
    },

	showDesktop: function(){
		myDesktopApp.desktop.minimizeWindows();
	},

	switchStyle: function(){
		myDesktopApp.changeStyle();
	},


    getTaskbarConfig: function () {
        var ret = this.callParent();
		var me = this;

        return Ext.apply(ret, {
            quickStart: [
               /* { name: 'Stili Değiştir', iconCls: 'quickstart-shortcuts', fn: me.switchStyle, scope: me},*/
                { name: 'Masaüstünü Göster', iconCls: 'quickstart-home', fn: me.showDesktop, scope: me },
            ],

            /*trayItems: [
                {
                    xtype: 'text',
                    flex: 1,
                    text: "--",
                    id: 'tray-facilityCode-text',
                    cls: 'tray-facilityCode-text'
                },
            ]*/



            trayItems: [
                { xtype: 'trayclock', flex: 1 },
				/*{
					id : 'tray-language-menu',
					xtype: "cycle",
					showText: true,
					menu: {
						xtype: "menu",
						items: [
							{
								id: 'tray-language-menu-TR-TR',
								xtype: "menucheckitem",
								text: "Türkçe",
								langVal : "TR-TR",
								listeners: {
									checkchange: function(item, checked) {
										if ( checked ){
											me.changeLanguage("TR-TR");
										}
									}
								}
							},
                            {
                                id: 'tray-language-menu-TR-TR2',
                                xtype: "menucheckitem",
                                text: "Türkçe2",
                                langVal : "TR-TR",
                                listeners: {
                                    checkchange: function(item, checked) {
                                        if ( checked ){
                                            me.changeLanguage("TR-TR");
                                        }
                                    }
                                }
                            }
						]
					}
				}*/
            ]
        });
    },

    switchTheme: function (theme) {
        Ext.util.CSS.swapStyleSheet('theme', 'sources/extjs/resources/css/' + theme );
        console.log("Tema değiştirildi: " + theme);
        localStorage.setItem('selectedTheme', theme);
    },

    applySavedTheme: function () {
        var savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            Ext.util.CSS.swapStyleSheet('theme', 'sources/extjs/resources/css/' + savedTheme);
            console.log("Kaydedilmiş tema yüklendi: " + savedTheme);
        }
    },

	changeLanguage: function(lang){
		var me = this;
		// if ( me.secondchange ){
			// alert('changing lang to : ' + lang );
			if ( UGRJS.Desktop != null ){
				if (UGRJS.Desktop.isReady ){
					UGRJS.Desktop.changeLanguage(lang);
				}
			}
		//}

		//me.secondchange = true;
	},

    onLogout: function () {
        Ext.Msg.confirm(Ext.getCmp('generic-title-logout').getText(), Ext.getCmp('generic-msg-logout').getText(),
			function(btn){
				if ( btn == 'yes' ){
					UGRJS.Desktop.logout();
				}
			}
		);
    },
    onReportForm: function () {
        UGRJS.Desktop.initiateModule({
            cls: 'com.ark.projects.stk.probe.stk.ServiceFileOrganizer',
        });
    },
    onSettings: function () {
		UGRJS.Desktop.initiateModule({
			cls: 'defsu.system.projects.sys.services.auth.LoginService',
			form: 'cp'
		});
    },
    onPr: function () {
        UGRJS.Desktop.initiateModule({
            cls: 'defsu.system.projects.sys.services.auth.LoginService',
            form: 'pr'
        });
    },

	onShortcutOrder: function () {
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
		UGRJS.Desktop.runMethod({
           cls: 'com.ark.server.probe.desktop.ServiceUsershortcut',
            method: 'orderShortcut',
			args: [
				{
					key: 'userShortcutPosX',
					value: width
				},
				{
					key: 'userShortcutPosY',
					value: height
				}
			],
            processResponse: true,
            onSuccess: function(msg) {

            },
            onFail: function(msg) {
                Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
            }
        });
    },


    /* getStyle: function(){
        cname = "style";
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "old";
    }, */

	/*selectedStyle: "old",*/

	/*changeStyle: function(){
		var me = this;
		// *** TO BE CUSTOMISED ***

		// *** END OF CUSTOMISABLE SECTION ***
		// You do not need to customise anything below this line

        console.log("Selected Style : " + this.selectedStyle);
		if ( this.selectedStyle == 'old' ){
			this.switch_style('new');
			this.selectedStyle = 'new';
            setActiveStyleSheet('new')
		} else {
			this.switch_style('old');
			this.selectedStyle = 'old';
            setActiveStyleSheet('old')
		}

		me.desktop.redrawWindows();
	},*/

	/*switch_style: function( css_title ){
	// You may use this script on your site free of charge provided
	// you do not remove this notice or the URL below. Script from
	// http://www.thesitewizard.com/javascripts/change-style-sheets.shtml
	  var i, link_tag ;
	  for (i = 0, link_tag = document.getElementsByTagName("link") ; i < link_tag.length ; i++ ) {
		if ((link_tag[i].rel.indexOf( "stylesheet" ) != -1) &&
		  link_tag[i].title) {
		  link_tag[i].disabled = true ;
		  if (link_tag[i].title == css_title) {
			link_tag[i].disabled = false ;
		  }
		}
	  }
	}*/
});


function setActiveStyleSheet(title) {
    var i,
        a,
        links = document.getElementsByTagName("link"),
        len = links.length;
    for (i = 0; i < len; i++) {
        a = links[i];
        if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
            a.disabled = true;
            if (a.getAttribute("title") == title) a.disabled = false;
        }
    }
}

function getActiveStyleSheet() {
    var i,
        a,
        links = document.getElementsByTagName("link"),
        len = links.length;
    for (i = 0; i < len; i++) {
        a = links[i];
        if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title") && !a.disabled) {
            return a.getAttribute("title");
        }
    }
    return null;
}

function getPreferredStyleSheet() {
    var i,
        a,
        links = document.getElementsByTagName("link"),
        len = links.length;
    for (i = 0; i < len; i++) {
        a = links[i];
        if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("rel").indexOf("alt") == -1 && a.getAttribute("title")) {
            return a.getAttribute("title");
        }
    }
    return null;
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        i,
        c,
        len = ca.length;
    for ( i = 0; i < len; i++) {
        c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

window.onload = function (e) {
    var cookie = readCookie("style");
    var title = cookie ? cookie : getPreferredStyleSheet();
    setActiveStyleSheet(title);
}

window.onunload = function (e) {
    var title = getActiveStyleSheet();
    createCookie("style", title, 365);
}

var cookie = readCookie("style");
var title = cookie ? cookie : getPreferredStyleSheet();
setActiveStyleSheet(title);

