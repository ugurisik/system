/**
 * This class provides an abstract grid editing plugin on selected {@link Ext.grid.column.Column columns}.
 * The editable columns are specified by providing an {@link Ext.grid.column.Column#editor editor}
 * in the {@link Ext.grid.column.Column column configuration}.
 *
 * **Note:** This class should not be used directly. See {@link Ext.grid.plugin.CellEditing} and
 * {@link Ext.grid.plugin.RowEditing}.
 */
Ext.define('Ext.grid.plugin.Editing', {
    alias: 'editing.editing',
    extend: 'Ext.AbstractPlugin',

    requires: [
        'Ext.grid.column.Column',
        'Ext.util.KeyNav'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {Number} clicksToEdit
     * The number of clicks on a grid required to display the editor.
     * The only accepted values are **1** and **2**.
     */
    clicksToEdit: 2,

    /**
     * @cfg {String} triggerEvent
     * The event which triggers editing. Supercedes the {@link #clicksToEdit} configuration. Maybe one of:
     *
     *  * cellclick
     *  * celldblclick
     *  * cellfocus
     *  * rowfocus
     */
    triggerEvent: undefined,

    // private
    defaultFieldXType: 'textfield',

    // cell, row, form
    editStyle: '',

    constructor: function (config) {
        var me = this;

        me.addEvents(
            /**
             * @event beforeedit
             * Fires before editing is triggered. Return false from event handler to stop the editing.
             *
             * @param {Ext.grid.plugin.Editing} editor
             * @param {Object} e An edit event with the following properties:
             *
             * - grid - The grid
             * - record - The record being edited
             * - field - The field name being edited
             * - value - The value for the field being edited.
             * - row - The grid table row
             * - column - The grid {@link Ext.grid.column.Column Column} defining the column that is being edited.
             * - rowIdx - The row index that is being edited
             * - colIdx - The column index that is being edited
             * - cancel - Set this to true to cancel the edit or return false from your handler.
             * - originalValue - Alias for value (only when using {@link Ext.grid.plugin.CellEditing CellEditing}).
             */
            'beforeedit',

            /**
             * @event edit
             * Fires after a editing. Usage example:
             *
             *     grid.on('edit', function(editor, e) {
             *         // commit the changes right after editing finished
             *         e.record.commit();
             *     });
             *
             * @param {Ext.grid.plugin.Editing} editor
             * @param {Object} e An edit event with the following properties:
             *
             * - grid - The grid
             * - record - The record that was edited
             * - field - The field name that was edited
             * - value - The value being set
             * - row - The grid table row
             * - column - The grid {@link Ext.grid.column.Column Column} defining the column that was edited.
             * - rowIdx - The row index that was edited
             * - colIdx - The column index that was edited
             * - originalValue - The original value for the field, before the edit (only when using {@link Ext.grid.plugin.CellEditing CellEditing})
             * - originalValues - The original values for the field, before the edit (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - newValues - The new values being set (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - view - The grid view (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - store - The grid store (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             */
            'edit',

            /**
             * @event validateedit
             * Fires after editing, but before the value is set in the record. Return false from event handler to
             * cancel the change.
             *
             * Usage example showing how to remove the red triangle (dirty record indicator) from some records (not all). By
             * observing the grid's validateedit event, it can be cancelled if the edit occurs on a targeted row (for example)
             * and then setting the field's new value in the Record directly:
             *
             *     grid.on('validateedit', function(editor, e) {
             *       var myTargetRow = 6;
             *
             *       if (e.rowIdx == myTargetRow) {
             *         e.cancel = true;
             *         e.record.data[e.field] = e.value;
             *       }
             *     });
             *
             * @param {Ext.grid.plugin.Editing} editor
             * @param {Object} e An edit event with the following properties:
             *
             * - grid - The grid
             * - record - The record being edited
             * - field - The field name being edited
             * - value - The value being set
             * - row - The grid table row
             * - column - The grid {@link Ext.grid.column.Column Column} defining the column that is being edited.
             * - rowIdx - The row index that is being edited
             * - colIdx - The column index that is being edited
             * - cancel - Set this to true to cancel the edit or return false from your handler.
             * - originalValue - The original value for the field, before the edit (only when using {@link Ext.grid.plugin.CellEditing CellEditing})
             * - originalValues - The original values for the field, before the edit (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - newValues - The new values being set (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - view - The grid view (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             * - store - The grid store (only when using {@link Ext.grid.plugin.RowEditing RowEditing})
             */
            'validateedit',
            /**
             * @event canceledit
             * Fires when the user started editing but then cancelled the edit.
             * @param {Ext.grid.plugin.Editing} editor
             * @param {Object} e An edit event with the following properties:
             *
             * - grid - The grid
             * - record - The record that was edited
             * - field - The field name that was edited
             * - value - The value being set
             * - row - The grid table row
             * - column - The grid {@link Ext.grid.column.Column Column} defining the column that was edited.
             * - rowIdx - The row index that was edited
             * - colIdx - The column index that was edited
             * - view - The grid view
             * - store - The grid store
             */
            'canceledit'
        );
        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);
        // : Deprecated, remove in 5.0
        me.on("edit", function (editor, e) {
            me.fireEvent("afteredit", editor, e);
        });
    },

    // private
    init: function (grid) {
        var me = this;

        me.grid = grid;
        me.view = grid.view;
        me.initEvents();
        me.mon(grid, 'reconfigure', me.onReconfigure, me);
        me.onReconfigure();

        grid.relayEvents(me, [
            /**
             * @event beforeedit
             * Forwarded event from Ext.grid.plugin.Editing.
             * @member Ext.panel.Table
             * @inheritdoc Ext.grid.plugin.Editing#beforeedit
             */
            'beforeedit',
            /**
             * @event edit
             * Forwarded event from Ext.grid.plugin.Editing.
             * @member Ext.panel.Table
             * @inheritdoc Ext.grid.plugin.Editing#edit
             */
            'edit',
            /**
             * @event validateedit
             * Forwarded event from Ext.grid.plugin.Editing.
             * @member Ext.panel.Table
             * @inheritdoc Ext.grid.plugin.Editing#validateedit
             */
            'validateedit',
            /**
             * @event canceledit
             * Forwarded event from Ext.grid.plugin.Editing.
             * @member Ext.panel.Table
             * @inheritdoc Ext.grid.plugin.Editing#canceledit
             */
            'canceledit'
        ]);
        // Marks the grid as editable, so that the SelectionModel
        // can make appropriate decisions during navigation
        grid.isEditable = true;
        grid.editingPlugin = grid.view.editingPlugin = me;
    },

    /**
     * Fires after the grid is reconfigured
     * @private
     */
    onReconfigure: function () {
        this.initFieldAccessors(this.view.getGridColumns());
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function () {
        var me = this,
            grid = me.grid;

        Ext.destroy(me.keyNav);
        me.removeFieldAccessors(grid.getView().getGridColumns());

        // Clear all listeners from all our events, clear all managed listeners we added to other Observables
        me.clearListeners();

        delete me.grid.editingPlugin;
        delete me.grid.view.editingPlugin;
        delete me.grid;
        delete me.view;
        delete me.editor;
        delete me.keyNav;
    },

    // private
    getEditStyle: function () {
        return this.editStyle;
    },

    // private
    initFieldAccessors: function (columns) {
        columns = [].concat(columns);

        var me = this,
            c,
            cLen = columns.length,
            column;

        for (c = 0; c < cLen; c++) {
            column = columns[c];

            Ext.applyIf(column, {
                getEditor: function (record, defaultField) {
                    return me.getColumnField(this, defaultField);
                },

                setEditor: function (field) {
                    me.setColumnField(this, field);
                }
            });
        }
    },

    // private
    removeFieldAccessors: function (columns) {
        columns = [].concat(columns);

        var c,
            cLen = columns.length,
            column;

        for (c = 0; c < cLen; c++) {
            column = columns[c];

            delete column.getEditor;
            delete column.setEditor;
        }
    },

    // private
    // remaps to the public API of Ext.grid.column.Column.getEditor
    getColumnField: function (columnHeader, defaultField) {
        var field = columnHeader.field;

        if (!field && columnHeader.editor) {
            field = columnHeader.editor;
            delete columnHeader.editor;
        }

        if (!field && defaultField) {
            field = defaultField;
        }

        if (field) {
            if (Ext.isString(field)) {
                field = {
                    xtype: field
                };
            }
            if (!field.isFormField) {
                field = Ext.ComponentManager.create(field, this.defaultFieldXType);
            }
            columnHeader.field = field;

            Ext.apply(field, {
                name: columnHeader.dataIndex
            });

            return field;
        }
    },

    // private
    // remaps to the public API of Ext.grid.column.Column.setEditor
    setColumnField: function (column, field) {
        if (Ext.isObject(field) && !field.isFormField) {
            field = Ext.ComponentManager.create(field, this.defaultFieldXType);
        }
        column.field = field;
    },

    // private
    initEvents: function () {
        var me = this;
        me.initEditTriggers();
        me.initCancelTriggers();
    },

    // @abstract
    initCancelTriggers: Ext.emptyFn,

    // private
    initEditTriggers: function () {
        var me = this,
            view = me.view;

        // Listen for the edit trigger event.
        if (me.triggerEvent == 'cellfocus') {
            me.mon(view, 'cellfocus', me.onCellFocus, me);
        } else if (me.triggerEvent == 'rowfocus') {
            me.mon(view, 'rowfocus', me.onRowFocus, me);
        } else {

            // Prevent the View from processing when the SelectionModel focuses.
            // This is because the SelectionModel processes the mousedown event, and
            // focusing causes a scroll which means that the subsequent mouseup might
            // take place at a different document XY position, and will therefore
            // not trigger a click.
            // This Editor must call the View's focusCell method directly when we recieve a request to edit
            if (view.selModel.isCellModel) {
                view.onCellFocus = Ext.Function.bind(me.beforeViewCellFocus, me);
            }

            // Listen for whichever click event we are configured to use
            me.mon(view, me.triggerEvent || ('cell' + (me.clicksToEdit === 1 ? 'click' : 'dblclick')), me.onCellClick, me);
        }

        // add/remove header event listeners need to be added immediately because
        // columns can be added/removed before render
        me.initAddRemoveHeaderEvents()
        // wait until render to initialize keynav events since they are attached to an element
        view.on('render', me.initKeyNavHeaderEvents, me, {
            single: true
        });
    },

    // Override of View's method so that we can pre-empt the View's processing if the view is being triggered by a mousedown
    beforeViewCellFocus: function (position) {
        // Pass call on to view if the navigation is from the keyboard, or we are not going to edit this cell.
        if (this.view.selModel.keyNavigation || !this.editing || !this.isCellEditable || !this.isCellEditable(position.row, position.columnHeader)) {
            this.view.focusCell.apply(this.view, arguments);
        }
    },

    // private. Used if we are triggered by the rowfocus event
    onRowFocus: function (record, row, rowIdx) {
        this.startEdit(row, 0);
    },

    // private. Used if we are triggered by the cellfocus event
    onCellFocus: function (record, cell, position) {
        this.startEdit(position.row, position.column);
    },

    // private. Used if we are triggered by a cellclick event
    onCellClick: function (view, cell, colIdx, record, row, rowIdx, e) {
        // cancel editing if the element that was clicked was a tree expander
        if (!view.expanderSelector || !e.getTarget(view.expanderSelector)) {
            this.startEdit(record, view.getHeaderAtIndex(colIdx));
        }
    },

    initAddRemoveHeaderEvents: function () {
        var me = this;
        me.mon(me.grid.headerCt, {
            scope: me,
            add: me.onColumnAdd,
            remove: me.onColumnRemove
        });
    },

    initKeyNavHeaderEvents: function () {
        var me = this;

        me.keyNav = Ext.create('Ext.util.KeyNav', me.view.el, {
            enter: me.onEnterKey,
            esc: me.onEscKey,
            scope: me
        });
    },

    // private
    onColumnAdd: function (ct, column) {
        if (column.isHeader) {
            this.initFieldAccessors(column);
        }
    },

    // private
    onColumnRemove: function (ct, column) {
        if (column.isHeader) {
            this.removeFieldAccessors(column);
        }
    },

    // private
    onEnterKey: function (e) {
        var me = this,
            grid = me.grid,
            selModel = grid.getSelectionModel(),
            record,
            pos,
            columnHeader = grid.headerCt.getHeaderAtIndex(0);

        // Calculate editing start position from SelectionModel
        // CellSelectionModel
        if (selModel.getCurrentPosition) {
            pos = selModel.getCurrentPosition();
            if (pos) {
                record = grid.store.getAt(pos.row);
                columnHeader = grid.headerCt.getHeaderAtIndex(pos.column);
            }
        }
        // RowSelectionModel
        else {
            record = selModel.getLastSelected();
        }

        // If there was a selection to provide a starting context...
        if (record && columnHeader) {
            me.startEdit(record, columnHeader);
        }
    },

    // private
    onEscKey: function (e) {
        this.cancelEdit();
    },

    /**
     * @private
     * @template
     * Template method called before editing begins.
     * @param {Object} context The current editing context
     * @return {Boolean} Return false to cancel the editing process
     */
    beforeEdit: Ext.emptyFn,

    /**
     * Starts editing the specified record, using the specified Column definition to define which field is being edited.
     * @param {Ext.data.Model/Number} record The Store data record which backs the row to be edited, or index of the record in Store.
     * @param {Ext.grid.column.Column/Number} columnHeader The Column object defining the column to be edited, or index of the column.
     */
    startEdit: function (record, columnHeader) {
        var me = this,
            context = me.getEditingContext(record, columnHeader);

        if (context == null || me.beforeEdit(context) === false || me.fireEvent('beforeedit', me, context) === false || context.cancel || !me.grid.view.isVisible(true)) {
            return false;
        }

        me.context = context;

        /**
         * @property {Boolean} editing
         * Set to `true` while the editing plugin is active and an Editor is visible.
         */
        me.editing = true;
    },

    // : Have this use a new class Ext.grid.CellContext for use here, and in CellSelectionModel
    /**
     * @private
     * Collects all information necessary for any subclasses to perform their editing functions.
     * @param record
     * @param columnHeader
     * @returns {Object/undefined} The editing context based upon the passed record and column
     */
    getEditingContext: function (record, columnHeader) {
        var me = this,
            grid = me.grid,
            view = grid.getView(),
            node = view.getNode(record),
            rowIdx, colIdx;

        // An intervening listener may have deleted the Record
        if (!node) {
            return;
        }

        // Coerce the column index to the closest visible column
        columnHeader = grid.headerCt.getVisibleHeaderClosestToIndex(Ext.isNumber(columnHeader) ? columnHeader : columnHeader.getIndex());

        // No corresponding column. Possible if all columns have been moved to the other side of a lockable grid pair
        if (!columnHeader) {
            return;
        }

        colIdx = columnHeader.getIndex();

        if (Ext.isNumber(record)) {
            // look up record if numeric row index was passed
            rowIdx = record;
            record = view.getRecord(node);
        } else {
            rowIdx = view.indexOf(node);
        }

        return {
            grid: grid,
            record: record,
            field: columnHeader.dataIndex,
            value: record.get(columnHeader.dataIndex),
            row: view.getNode(rowIdx),
            column: columnHeader,
            rowIdx: rowIdx,
            colIdx: colIdx
        };
    },

    /**
     * Cancels any active edit that is in progress.
     */
    cancelEdit: function () {
        var me = this;

        me.editing = false;
        me.fireEvent('canceledit', me, me.context);
    },

    /**
     * Completes the edit if there is an active edit in progress.
     */
    completeEdit: function () {
        var me = this;

        if (me.editing && me.validateEdit()) {
            me.fireEvent('edit', me, me.context);
        }

        delete me.context;
        me.editing = false;
    },

    // @abstract
    validateEdit: function () {
        var me = this,
            context = me.context;

        return me.fireEvent('validateedit', me, context) !== false && !context.cancel;
    }
});


/**
 * The Ext.grid.plugin.CellEditing plugin injects editing at a cell level for a Grid. Only a single
 * cell will be editable at a time. The field that will be used for the editor is defined at the
 * {@link Ext.grid.column.Column#editor editor}. The editor can be a field instance or a field configuration.
 *
 * If an editor is not specified for a particular column then that cell will not be editable and it will
 * be skipped when activated via the mouse or the keyboard.
 *
 * The editor may be shared for each column in the grid, or a different one may be specified for each column.
 * An appropriate field type should be chosen to match the data structure that it will be editing. For example,
 * to edit a date, it would be useful to specify {@link Ext.form.field.Date} as the editor.
 *
 * ## Example
 *
 * A grid with editor for the name and the email columns:
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'simpsonsStore',
 *         fields:['name', 'email', 'phone'],
 *         data:{'items':[
 *             {"name":"Lisa", "email":"lisa@simpsons.com", "phone":"555-111-1224"},
 *             {"name":"Bart", "email":"bart@simpsons.com", "phone":"555-222-1234"},
 *             {"name":"Homer", "email":"home@simpsons.com", "phone":"555-222-1244"},
 *             {"name":"Marge", "email":"marge@simpsons.com", "phone":"555-222-1254"}
 *         ]},
 *         proxy: {
 *             type: 'memory',
 *             reader: {
 *                 type: 'json',
 *                 root: 'items'
 *             }
 *         }
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Simpsons',
 *         store: Ext.data.StoreManager.lookup('simpsonsStore'),
 *         columns: [
 *             {header: 'Name',  dataIndex: 'name', editor: 'textfield'},
 *             {header: 'Email', dataIndex: 'email', flex:1,
 *                 editor: {
 *                     xtype: 'textfield',
 *                     allowBlank: false
 *                 }
 *             },
 *             {header: 'Phone', dataIndex: 'phone'}
 *         ],
 *         selType: 'cellmodel',
 *         plugins: [
 *             Ext.create('Ext.grid.plugin.CellEditing', {
 *                 clicksToEdit: 1
 *             })
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 * This requires a little explanation. We're passing in `store` and `columns` as normal, but
 * we also specify a {@link Ext.grid.column.Column#field field} on two of our columns. For the
 * Name column we just want a default textfield to edit the value, so we specify 'textfield'.
 * For the Email column we customized the editor slightly by passing allowBlank: false, which
 * will provide inline validation.
 *
 * To support cell editing, we also specified that the grid should use the 'cellmodel'
 * {@link Ext.grid.Panel#selType selType}, and created an instance of the CellEditing plugin,
 * which we configured to activate each editor after a single click.
 *
 */
Ext.define('Ext.grid.plugin.CellEditing', {
    alias: 'plugin.cellediting',
    extend: 'Ext.grid.plugin.Editing',
    requires: ['Ext.grid.CellEditor', 'Ext.util.DelayedTask'],

    constructor: function () {
        /**
         * @event beforeedit
         * Fires before cell editing is triggered. Return false from event handler to stop the editing.
         *
         * @param {Ext.grid.plugin.CellEditing} editor
         * @param {Object} e An edit event with the following properties:
         *
         * - grid - The grid
         * - record - The record being edited
         * - field - The field name being edited
         * - value - The value for the field being edited.
         * - row - The grid table row
         * - column - The grid {@link Ext.grid.column.Column Column} defining the column that is being edited.
         * - rowIdx - The row index that is being edited
         * - colIdx - The column index that is being edited
         * - cancel - Set this to true to cancel the edit or return false from your handler.
         */
        /**
         * @event edit
         * Fires after a cell is edited. Usage example:
         *
         *     grid.on('edit', function(editor, e) {
         *         // commit the changes right after editing finished
         *         e.record.commit();
         *     });
         *
         * @param {Ext.grid.plugin.CellEditing} editor
         * @param {Object} e An edit event with the following properties:
         *
         * - grid - The grid
         * - record - The record that was edited
         * - field - The field name that was edited
         * - value - The value being set
         * - originalValue - The original value for the field, before the edit.
         * - row - The grid table row
         * - column - The grid {@link Ext.grid.column.Column Column} defining the column that was edited.
         * - rowIdx - The row index that was edited
         * - colIdx - The column index that was edited
         */
        /**
         * @event validateedit
         * Fires after a cell is edited, but before the value is set in the record. Return false from event handler to
         * cancel the change.
         *
         * Usage example showing how to remove the red triangle (dirty record indicator) from some records (not all). By
         * observing the grid's validateedit event, it can be cancelled if the edit occurs on a targeted row (for
         * example) and then setting the field's new value in the Record directly:
         *
         *     grid.on('validateedit', function(editor, e) {
         *       var myTargetRow = 6;
         *
         *       if (e.row == myTargetRow) {
         *         e.cancel = true;
         *         e.record.data[e.field] = e.value;
         *       }
         *     });
         *
         * @param {Ext.grid.plugin.CellEditing} editor
         * @param {Object} e An edit event with the following properties:
         *
         * - grid - The grid
         * - record - The record being edited
         * - field - The field name being edited
         * - value - The value being set
         * - originalValue - The original value for the field, before the edit.
         * - row - The grid table row
         * - column - The grid {@link Ext.grid.column.Column Column} defining the column that is being edited.
         * - rowIdx - The row index that is being edited
         * - colIdx - The column index that is being edited
         * - cancel - Set this to true to cancel the edit or return false from your handler.
         */
        /**
         * @event canceledit
         * Fires when the user started editing a cell but then cancelled the edit.
         * @param {Ext.grid.plugin.CellEditing} editor
         * @param {Object} e An edit event with the following properties:
         *
         * - grid - The grid
         * - record - The record that was edited
         * - field - The field name that was edited
         * - value - The value being set
         * - row - The grid table row
         * - column - The grid {@link Ext.grid.column.Column Column} defining the column that was edited.
         * - rowIdx - The row index that was edited
         * - colIdx - The column index that was edited
         */

        this.callParent(arguments);
        this.editors = new Ext.util.MixedCollection(false, function (editor) {
            return editor.editorId;
        });
        this.editTask = new Ext.util.DelayedTask();
    },

    onReconfigure: function () {
        this.editors.clear();
        this.callParent();
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function () {
        var me = this;
        me.editTask.cancel();
        me.editors.each(Ext.destroy, Ext);
        me.editors.clear();
        me.callParent(arguments);
    },

    onBodyScroll: function () {
        var me = this,
            ed = me.getActiveEditor(),
            scroll = me.view.el.getScroll();

        // Scroll happened during editing...
        if (ed && ed.editing) {
            // Terminate editing only on vertical scroll. Horiz scroll can be caused by tabbing between cells.
            if (scroll.top !== me.scroll.top) {
                if (ed.field) {
                    if (ed.field.triggerBlur) {
                        ed.field.triggerBlur();
                    } else {
                        ed.field.blur();
                    }
                }
            }
            // Horiz scroll just requires that the editor be realigned.
            else {
                ed.realign();
            }
        }
        me.scroll = scroll;
    },

    // private
    // Template method called from base class's initEvents
    initCancelTriggers: function () {
        var me = this,
            grid = me.grid,
            view = grid.view;

        view.addElListener('mousewheel', me.cancelEdit, me);
        me.mon(view, 'bodyscroll', me.onBodyScroll, me);
        me.mon(grid, {
            columnresize: me.cancelEdit,
            columnmove: me.cancelEdit,
            scope: me
        });
    },

    isCellEditable: function (record, columnHeader) {
        var me = this,
            context = me.getEditingContext(record, columnHeader);

        if (me.grid.view.isVisible(true) && context) {
            columnHeader = context.column;
            record = context.record;
            if (columnHeader && me.getEditor(record, columnHeader)) {
                return true;
            }
        }
    },

    /**
     * Starts editing the specified record, using the specified Column definition to define which field is being edited.
     * @param {Ext.data.Model} record The Store data record which backs the row to be edited.
     * @param {Ext.grid.column.Column} columnHeader The Column object defining the column to be edited.
     * @return `true` if editing was started, `false` otherwise.
     */
    startEdit: function (record, columnHeader) {
        var me = this,
            context = me.getEditingContext(record, columnHeader),
            value, ed;

        // Complete the edit now, before getting the editor's target
        // cell DOM element. Completing the edit causes a row refresh.
        // Also allows any post-edit events to take effect before continuing
        me.completeEdit();


        // Cancel editing if EditingContext could not be found (possibly because record has been deleted by an intervening listener), or if the grid view is not currently visible
        if (!context || !me.grid.view.isVisible(true)) {
            return false;
        }

        record = context.record;
        columnHeader = context.column;

        // See if the field is editable for the requested record
        if (columnHeader && !columnHeader.getEditor(record)) {
            return false;
        }

        value = record.get(columnHeader.dataIndex);
        context.originalValue = context.value = value;
        if (me.beforeEdit(context) === false || me.fireEvent('beforeedit', me, context) === false || context.cancel) {
            return false;
        }

        ed = me.getEditor(record, columnHeader);

        // Whether we are going to edit or not, ensure the edit cell is scrolled into view
        me.grid.view.cancelFocus();
        me.view.focusCell({
            row: context.rowIdx,
            column: context.colIdx
        });
        if (ed) {
            me.editTask.delay(15, me.showEditor, me, [ed, context, value]);
            return true;
        }
        return false;
    },

    showEditor: function (ed, context, value) {
        var me = this,
            record = context.record,
            columnHeader = context.column,
            sm = me.grid.getSelectionModel(),
            selection = sm.getCurrentPosition();

        me.context = context;
        me.setActiveEditor(ed);
        me.setActiveRecord(record);
        me.setActiveColumn(columnHeader);

        // Select cell on edit only if it's not the currently selected cell
        if (sm.selectByPosition && (!selection || selection.column !== context.colIdx || selection.row !== context.rowIdx)) {
            sm.selectByPosition({
                row: context.rowIdx,
                column: context.colIdx
            });
        }

        //remove html element
        value = $("<div>").html(value).text();
        ed.startEdit(me.getCell(record, columnHeader), value);
        me.editing = true;
        me.scroll = me.view.el.getScroll();
    },

    completeEdit: function () {
        var activeEd = this.getActiveEditor();
        if (activeEd) {
            activeEd.completeEdit();
            this.editing = false;
        }
    },

    // internal getters/setters
    setActiveEditor: function (ed) {
        this.activeEditor = ed;
    },

    getActiveEditor: function () {
        return this.activeEditor;
    },

    setActiveColumn: function (column) {
        this.activeColumn = column;
    },

    getActiveColumn: function () {
        return this.activeColumn;
    },

    setActiveRecord: function (record) {
        this.activeRecord = record;
    },

    getActiveRecord: function () {
        return this.activeRecord;
    },

    getEditor: function (record, column) {
        var me = this,
            editors = me.editors,
            editorId = column.getItemId(),
            editor = editors.getByKey(editorId);

        if (editor) {
            return editor;
        } else {
            editor = column.getEditor(record);
            if (!editor) {
                return false;
            }

            // Allow them to specify a CellEditor in the Column
            // Either way, the Editor is a floating Component, and must be attached to an ownerCt
            // which it uses to traverse upwards to find a ZIndexManager at render time.
            if (!(editor instanceof Ext.grid.CellEditor)) {
                editor = new Ext.grid.CellEditor({
                    editorId: editorId,
                    field: editor,
                    ownerCt: me.grid
                });
            } else {
                editor.ownerCt = me.grid;
            }
            editor.editingPlugin = me;
            editor.isForTree = me.grid.isTree;
            editor.on({
                scope: me,
                specialkey: me.onSpecialKey,
                complete: me.onEditComplete,
                canceledit: me.cancelEdit
            });
            editors.add(editor);
            return editor;
        }
    },

    // inherit docs
    setColumnField: function (column, field) {
        var ed = this.editors.getByKey(column.getItemId());
        Ext.destroy(ed, column.field);
        this.editors.removeAtKey(column.getItemId());
        this.callParent(arguments);
    },

    /**
     * Gets the cell (td) for a particular record and column.
     * @param {Ext.data.Model} record
     * @param {Ext.grid.column.Column} column
     * @private
     */
    getCell: function (record, column) {
        return this.grid.getView().getCell(record, column);
    },

    onSpecialKey: function (ed, field, e) {
        var me = this,
            grid = me.grid,
            sm;

        if (e.getKey() === e.TAB) {
            e.stopEvent();

            if (ed) {
                // Allow the field to act on tabs before onEditorTab, which ends
                // up calling completeEdit. This is useful for picker type fields.
                ed.onEditorTab(e);
            }

            sm = grid.getSelectionModel();
            if (sm.onEditorTab) {
                sm.onEditorTab(me, e);
            }
        }
    },

    onEditComplete: function (ed, value, startValue) {
        var me = this,
            grid = me.grid,
            activeColumn = me.getActiveColumn(),
            sm = grid.getSelectionModel(),
            record;

        if (activeColumn) {
            record = me.context.record;

            me.setActiveEditor(null);
            me.setActiveColumn(null);
            me.setActiveRecord(null);

            if (!me.validateEdit()) {
                return;
            }

            // Only update the record if the new value is different than the
            // startValue. When the view refreshes its el will gain focus
            if (!record.isEqual(value, startValue)) {
                if (typeof value === 'number') {
                    value = value.toString().replace(/\./g, ',');
                    record.set(activeColumn.dataIndex, value);
                } else {
                    record.set(activeColumn.dataIndex, value);
                }
            }

            // Restore focus back to the view's element.
            if (sm.setCurrentPosition) {
                sm.setCurrentPosition(sm.getCurrentPosition());
            }
            grid.getView().getEl(activeColumn).focus();

            me.context.value = value;
            me.fireEvent('edit', me, me.context);
        }
    },

    /**
     * Cancels any active editing.
     */
    cancelEdit: function () {
        var me = this,
            activeEd = me.getActiveEditor(),
            viewEl = me.grid.getView().getEl(me.getActiveColumn());

        me.setActiveEditor(null);
        me.setActiveColumn(null);
        me.setActiveRecord(null);
        if (activeEd) {
            activeEd.cancelEdit();
            viewEl.focus();
            me.callParent(arguments);
        }
    },

    /**
     * Starts editing by position (row/column)
     * @param {Object} position A position with keys of row and column.
     */
    startEditByPosition: function (position) {

        // Coerce the edit column to the closest visible column
        position.column = this.view.getHeaderCt().getVisibleHeaderClosestToIndex(position.column).getIndex();

        return this.startEdit(position.row, position.column);
    }
});

/**
 * @class Ext.ux.grid.menu.RangeMenu
 * @extends Ext.menu.Menu
 * Custom implementation of {@link Ext.menu.Menu} that has preconfigured items for entering numeric
 * range comparison values: less-than, greater-than, and equal-to. This is used internally
 * by {@link Ext.ux.grid.filter.NumericFilter} to create its menu.
 */
Ext.define('Ext.ux.grid.menu.RangeMenu', {
    extend: 'Ext.menu.Menu',

    /**
     * @cfg {String} fieldCls
     * The Class to use to construct each field item within this menu
     * Defaults to:<pre>
     * fieldCls : Ext.form.field.Number
     * </pre>
     */
    fieldCls: 'Ext.form.field.Number',

    /**
     * @cfg {Object} fieldCfg
     * The default configuration options for any field item unless superseded
     * by the <code>{@link #fields}</code> configuration.
     * Defaults to:<pre>
     * fieldCfg : {}
     * </pre>
     * Example usage:
     * <pre><code>
     fieldCfg : {
     width: 150,
     },
     * </code></pre>
     */

    /**
     * @cfg {Object} fields
     * The field items may be configured individually
     * Defaults to <tt>undefined</tt>.
     * Example usage:
     * <pre><code>
     fields : {
     gt: { // override fieldCfg options
     width: 200,
     fieldCls: Ext.ux.form.CustomNumberField // to override default {@link #fieldCls}
     }
     },
     * </code></pre>
     */

    /**
     * @cfg {Object} itemIconCls
     * The itemIconCls to be applied to each comparator field item.
     * Defaults to:<pre>
     itemIconCls : {
     gt : 'ux-rangemenu-gt',
     lt : 'ux-rangemenu-lt',
     eq : 'ux-rangemenu-eq'
     }
     * </pre>
     */
    itemIconCls: {
        gt: 'ux-rangemenu-gt',
        lt: 'ux-rangemenu-lt',
        eq: 'ux-rangemenu-eq'
    },

    /**
     * @cfg {Object} fieldLabels
     * Accessible label text for each comparator field item. Can be overridden by localization
     * files. Defaults to:<pre>
     fieldLabels : {
     gt: 'Greater Than',
     lt: 'Less Than',
     eq: 'Equal To'
     }</pre>
     */
    fieldLabels: {
        gt: 'Greater Than',
        lt: 'Less Than',
        eq: 'Equal To'
    },

    /**
     * @cfg {Object} menuItemCfgs
     * Default configuration options for each menu item
     * Defaults to:<pre>
     menuItemCfgs : {
     emptyText: 'Enter Filter Text...',
     selectOnFocus: true,
     width: 125
     }
     * </pre>
     */
    menuItemCfgs: {
        emptyText: 'Enter Number...',
        selectOnFocus: false,
        width: 155
    },

    /**
     * @cfg {Array} menuItems
     * The items to be shown in this menu.  Items are added to the menu
     * according to their position within this array. Defaults to:<pre>
     * menuItems : ['lt','gt','-','eq']
     * </pre>
     */
    menuItems: ['lt', 'gt', '-', 'eq'],


    constructor: function (config) {
        var me = this,
            fields, fieldCfg, i, len, item, cfg, Cls;

        me.callParent(arguments);

        fields = me.fields = me.fields || {};
        fieldCfg = me.fieldCfg = me.fieldCfg || {};

        me.addEvents(
            /**
             * @event update
             * Fires when a filter configuration has changed
             * @param {Ext.ux.grid.filter.Filter} this The filter object.
             */
            'update'
        );

        me.updateTask = Ext.create('Ext.util.DelayedTask', me.fireUpdate, me);

        for (i = 0, len = me.menuItems.length; i < len; i++) {
            item = me.menuItems[i];
            if (item !== '-') {
                // defaults
                cfg = {
                    itemId: 'range-' + item,
                    enableKeyEvents: true,
                    hideLabel: false,
                    fieldLabel: me.iconTpl.apply({
                        cls: me.itemIconCls[item] || 'no-icon',
                        text: me.fieldLabels[item] || '',
                        src: Ext.BLANK_IMAGE_URL
                    }),
                    labelSeparator: '',
                    labelWidth: 29,
                    labelStyle: 'position: relative;',
                    listeners: {
                        scope: me,
                        change: me.onInputChange,
                        keyup: me.onInputKeyUp,
                        el: {
                            click: function (e) {
                                e.stopPropagation();
                            }
                        }
                    },
                    activate: Ext.emptyFn,
                    deactivate: Ext.emptyFn
                };
                Ext.apply(
                    cfg,
                    // custom configs
                    Ext.applyIf(fields[item] || {}, fieldCfg[item]),
                    // configurable defaults
                    me.menuItemCfgs
                );
                Cls = cfg.fieldCls || me.fieldCls;
                item = fields[item] = Ext.create(Cls, cfg);
            }
            me.add(item);
        }
    },

    /**
     * @private
     * called by this.updateTask
     */
    fireUpdate: function () {
        this.fireEvent('update', this);
    },

    /**
     * Get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        var result = {},
            key, field;
        for (key in this.fields) {
            field = this.fields[key];
            if (field.isValid() && field.getValue() !== null) {
                result[key] = field.getValue();
            }
        }
        return result;
    },

    /**
     * Set the value of this menu and fires the 'update' event.
     * @param {Object} data The data to assign to this menu
     */
    setValue: function (data) {
        var me = this,
            key,
            field;

        for (key in me.fields) {

            // Prevent field's change event from tiggering a Store filter. The final upate event will do that
            field = me.fields[key];
            field.suspendEvents();
            field.setValue(key in data ? data[key] : '');
            field.resumeEvents();
        }

        // Trigger the filering of the Store
        me.fireEvent('update', me);
    },

    /**
     * @private
     * Handler method called when there is a keyup event on an input
     * item of this menu.
     */
    onInputKeyUp: function (field, e) {
        if (e.getKey() === e.RETURN && field.isValid()) {
            e.stopEvent();
            this.hide();
        }
    },

    /**
     * @private
     * Handler method called when the user changes the value of one of the input
     * items in this menu.
     */
    onInputChange: function (field) {
        var me = this,
            fields = me.fields,
            eq = fields.eq,
            gt = fields.gt,
            lt = fields.lt;

        if (field == eq) {
            if (gt) {
                gt.setValue(null);
            }
            if (lt) {
                lt.setValue(null);
            }
        } else {
            eq.setValue(null);
        }

        // restart the timer
        this.updateTask.delay(this.updateBuffer);
    }
}, function () {

    /**
     * @cfg {Ext.XTemplate} iconTpl
     * A template for generating the label for each field in the menu
     */
    this.prototype.iconTpl = Ext.create('Ext.XTemplate',
        '<img src="{src}" alt="{text}" class="' + Ext.baseCSSPrefix + 'menu-item-icon ux-rangemenu-icon {cls}" />'
    );

});


/**
 * @class Ext.ux.grid.menu.ListMenu
 * @extends Ext.menu.Menu
 * This is a supporting class for {@link Ext.ux.grid.filter.ListFilter}.
 * Although not listed as configuration options for this class, this class
 * also accepts all configuration options from {@link Ext.ux.grid.filter.ListFilter}.
 */
Ext.define('Ext.ux.grid.menu.ListMenu', {
    extend: 'Ext.menu.Menu',

    /**
     * @cfg {String} labelField
     * Defaults to 'text'.
     */
    labelField: 'text',
    /**
     * @cfg {String} paramPrefix
     * Defaults to 'Loading...'.
     */
    loadingText: 'Yükleniyor...',
    /**
     * @cfg {Boolean} loadOnShow
     * Defaults to true.
     */
    loadOnShow: true,
    /**
     * @cfg {Boolean} single
     * Specify true to group all items in this list into a single-select
     * radio button group. Defaults to false.
     */
    single: false,

    constructor: function (cfg) {
        var me = this,
            options,
            i,
            len,
            value;

        me.selected = [];
        me.addEvents(
            /**
             * @event checkchange
             * Fires when there is a change in checked items from this list
             * @param {Object} item Ext.menu.CheckItem
             * @param {Object} checked The checked value that was set
             */
            'checkchange'
        );

        me.callParent([cfg = cfg || {}]);

        if (!cfg.store && cfg.options) {
            options = [];
            for (i = 0, len = cfg.options.length; i < len; i++) {
                value = cfg.options[i];
                switch (Ext.type(value)) {
                    case 'array':
                        options.push(value);
                        break;
                    case 'object':
                        options.push([value.id, value[me.labelField]]);
                        break;
                    case 'string':
                        options.push([value, value]);
                        break;
                }
            }

            me.store = Ext.create('Ext.data.ArrayStore', {
                fields: ['id', me.labelField],
                data: options,
                listeners: {
                    load: me.onLoad,
                    scope: me
                }
            });
            me.loaded = true;
            me.autoStore = true;
        } else {
            me.add({
                text: me.loadingText,
                iconCls: 'loading-indicator'
            });
            me.store.on('load', me.onLoad, me);
        }
    },

    destroy: function () {
        var me = this,
            store = me.store;

        if (store) {
            if (me.autoStore) {
                store.destroyStore();
            } else {
                store.un('unload', me.onLoad, me);
            }
        }
        me.callParent();
    },

    /**
     * Lists will initially show a 'loading' item while the data is retrieved from the store.
     * In some cases the loaded data will result in a list that goes off the screen to the
     * right (as placement calculations were done with the loading item). This adapter will
     * allow show to be called with no arguments to show with the previous arguments and
     * thus recalculate the width and potentially hang the menu from the left.
     */
    show: function () {
        if (this.loadOnShow && !this.loaded && !this.store.loading) {
            this.store.load();
        }
        this.callParent();
    },

    /** @private */
    onLoad: function (store, records) {
        var me = this,
            gid, itemValue, i, len,
            listeners = {
                checkchange: me.checkChange,
                scope: me
            };

        Ext.suspendLayouts();
        me.removeAll(true);

        gid = me.single ? Ext.id() : null;
        for (i = 0, len = records.length; i < len; i++) {
            itemValue = records[i].get('id');
            me.add(Ext.create('Ext.menu.CheckItem', {
                text: records[i].get(me.labelField),
                group: gid,
                checked: Ext.Array.contains(me.selected, itemValue),
                hideOnClick: false,
                value: itemValue,
                listeners: listeners
            }));
        }

        me.loaded = true;
        Ext.resumeLayouts(true);
        me.fireEvent('load', me, records);
    },

    /**
     * Get the selected items.
     * @return {Array} selected
     */
    getSelected: function () {
        return this.selected;
    },

    /** @private */
    setSelected: function (value) {
        value = this.selected = [].concat(value);

        if (this.loaded) {
            this.items.each(function (item) {
                item.setChecked(false, true);
                for (var i = 0, len = value.length; i < len; i++) {
                    if (item.value == value[i]) {
                        item.setChecked(true, true);
                    }
                }
            }, this);
        }
    },

    /**
     * Handler for the 'checkchange' event from an check item in this menu
     * @param {Object} item Ext.menu.CheckItem
     * @param {Object} checked The checked value that was set
     */
    checkChange: function (item, checked) {
        var value = [];
        this.items.each(function (item) {
            if (item.checked) {
                value.push(item.value);
            }
        }, this);
        this.selected = value;

        this.fireEvent('checkchange', item, checked);
    }
});


/**
 * @class Ext.ux.grid.filter.Filter
 * @extends Ext.util.Observable
 * Abstract base class for filter implementations.
 */
Ext.define('Ext.ux.grid.filter.Filter', {
    extend: 'Ext.util.Observable',

    /**
     * @cfg {Boolean} active
     * Indicates the initial status of the filter (defaults to false).
     */
    active: false,
    /**
     * True if this filter is active.  Use setActive() to alter after configuration.
     * @type Boolean
     * @property active
     */
    /**
     * @cfg {String} dataIndex
     * The {@link Ext.data.Store} dataIndex of the field this filter represents.
     * The dataIndex does not actually have to exist in the store.
     */
    dataIndex: null,
    /**
     * The filter configuration menu that will be installed into the filter submenu of a column menu.
     * @type Ext.menu.Menu
     * @property
     */
    menu: null,
    /**
     * @cfg {Number} updateBuffer
     * Number of milliseconds to wait after user interaction to fire an update. Only supported
     * by filters: 'list', 'numeric', and 'string'. Defaults to 500.
     */
    updateBuffer: 500,

    constructor: function (config) {
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event activate
             * Fires when an inactive filter becomes active
             * @param {Ext.ux.grid.filter.Filter} this
             */
            'activate',
            /**
             * @event deactivate
             * Fires when an active filter becomes inactive
             * @param {Ext.ux.grid.filter.Filter} this
             */
            'deactivate',
            /**
             * @event serialize
             * Fires after the serialization process. Use this to attach additional parameters to serialization
             * data before it is encoded and sent to the server.
             * @param {Array/Object} data A map or collection of maps representing the current filter configuration.
             * @param {Ext.ux.grid.filter.Filter} filter The filter being serialized.
             */
            'serialize',
            /**
             * @event update
             * Fires when a filter configuration has changed
             * @param {Ext.ux.grid.filter.Filter} this The filter object.
             */
            'update'
        );
        Ext.ux.grid.filter.Filter.superclass.constructor.call(this);

        this.menu = this.createMenu(config);
        this.init(config);
        if (config && config.value) {
            this.setValue(config.value);
            this.setActive(config.active !== false, true);
            delete config.value;
        }
    },

    /**
     * Destroys this filter by purging any event listeners, and removing any menus.
     */
    destroy: function () {
        if (this.menu) {
            this.menu.destroy();
        }
        this.clearListeners();
    },

    /**
     * Template method to be implemented by all subclasses that is to
     * initialize the filter and install required menu items.
     * Defaults to Ext.emptyFn.
     */
    init: Ext.emptyFn,

    /**
     * @private @override
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
    createMenu: function (config) {
        return Ext.create('Ext.menu.Menu', config);
    },

    /**
     * Template method to be implemented by all subclasses that is to
     * get and return the value of the filter.
     * Defaults to Ext.emptyFn.
     * @return {Object} The 'serialized' form of this filter
     * @methodOf Ext.ux.grid.filter.Filter
     */
    getValue: Ext.emptyFn,

    /**
     * Template method to be implemented by all subclasses that is to
     * set the value of the filter and fire the 'update' event.
     * Defaults to Ext.emptyFn.
     * @param {Object} data The value to set the filter
     * @methodOf Ext.ux.grid.filter.Filter
     */
    setValue: Ext.emptyFn,

    /**
     * Template method to be implemented by all subclasses that is to
     * return <tt>true</tt> if the filter has enough configuration information to be activated.
     * Defaults to <tt>return true</tt>.
     * @return {Boolean}
     */
    isActivatable: function () {
        return true;
    },

    /**
     * Template method to be implemented by all subclasses that is to
     * get and return serialized filter data for transmission to the server.
     * Defaults to Ext.emptyFn.
     */
    getSerialArgs: Ext.emptyFn,

    /**
     * Template method to be implemented by all subclasses that is to
     * validates the provided Ext.data.Record against the filters configuration.
     * Defaults to <tt>return true</tt>.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function () {
        return true;
    },

    /**
     * Returns the serialized filter data for transmission to the server
     * and fires the 'serialize' event.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     * @methodOf Ext.ux.grid.filter.Filter
     */
    serialize: function () {
        var args = this.getSerialArgs();
        this.fireEvent('serialize', args, this);
        return args;
    },

    /** @private */
    fireUpdate: function () {
        if (this.active) {
            this.fireEvent('update', this);
        }
        this.setActive(this.isActivatable());
    },

    /**
     * Sets the status of the filter and fires the appropriate events.
     * @param {Boolean} active        The new filter state.
     * @param {Boolean} suppressEvent True to prevent events from being fired.
     * @methodOf Ext.ux.grid.filter.Filter
     */
    setActive: function (active, suppressEvent) {
        if (this.active != active) {
            this.active = active;
            if (suppressEvent !== true) {
                this.fireEvent(active ? 'activate' : 'deactivate', this);
            }
        }
    }
});


/**
 * @class Ext.ux.grid.filter.StringFilter
 * @extends Ext.ux.grid.filter.Filter
 * Filter by a configurable Ext.form.field.Text
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
 var filters = Ext.create('Ext.ux.grid.GridFilters', {
 ...
 filters: [{
 // required configs
 type: 'string',
 dataIndex: 'name',

 // optional configs
 value: 'foo',
 active: true, // default is false
 iconCls: 'ux-gridfilter-text-icon' // default
 // any Ext.form.field.Text configs accepted
 }]
 });
 * </code></pre>
 */
Ext.define('Ext.ux.grid.filter.StringFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.string',

    /**
     * @cfg {String} iconCls
     * The iconCls to be applied to the menu item.
     * Defaults to <tt>'ux-gridfilter-text-icon'</tt>.
     */
    iconCls: 'ux-gridfilter-text-icon',

    emptyText: 'Enter Filter Text...',
    selectOnFocus: true,
    width: 125,

    /**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
    init: function (config) {
        Ext.applyIf(config, {
            enableKeyEvents: true,
            iconCls: this.iconCls,
            hideLabel: true,
            listeners: {
                scope: this,
                keyup: this.onInputKeyUp,
                el: {
                    click: function (e) {
                        e.stopPropagation();
                    }
                }
            }
        });

        this.inputItem = Ext.create('Ext.form.field.Text', config);
        this.menu.add(this.inputItem);
        this.updateTask = Ext.create('Ext.util.DelayedTask', this.fireUpdate, this);
    },

    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        return this.inputItem.getValue();
    },

    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
    setValue: function (value) {
        this.inputItem.setValue(value);
        this.fireEvent('update', this);
    },

    /**
     * @private
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
    isActivatable: function () {
        return this.inputItem.getValue().length > 0;
    },

    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function () {
        return {
            type: 'string',
            value: this.getValue()
        };
    },

    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function (record) {
        var val = record.get(this.dataIndex);

        if (typeof val != 'string') {
            return (this.getValue().length === 0);
        }

        return val.toLowerCase().indexOf(this.getValue().toLowerCase()) > -1;
    },

    /**
     * @private
     * Handler method called when there is a keyup event on this.inputItem
     */
    onInputKeyUp: function (field, e) {
        var k = e.getKey();
        if (k == e.RETURN && field.isValid()) {
            e.stopEvent();
            this.menu.hide();
            return;
        }
        // restart the timer
        this.updateTask.delay(this.updateBuffer);
    }
});


/**
 * @class Ext.ux.grid.filter.NumericFilter
 * @extends Ext.ux.grid.filter.Filter
 * Filters using an Ext.ux.grid.menu.RangeMenu.
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
 var filters = Ext.create('Ext.ux.grid.GridFilters', {
 ...
 filters: [{
 type: 'numeric',
 dataIndex: 'price'
 }]
 });
 * </code></pre>
 * <p>Any of the configuration options for {@link Ext.ux.grid.menu.RangeMenu} can also be specified as
 * configurations to NumericFilter, and will be copied over to the internal menu instance automatically.</p>
 */
Ext.define('Ext.ux.grid.filter.NumericFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.numeric',
    uses: ['Ext.form.field.Number'],

    /**
     * @private @override
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
    createMenu: function (config) {
        var me = this,
            menu;
        menu = Ext.create('Ext.ux.grid.menu.RangeMenu', config);
        menu.on('update', me.fireUpdate, me);
        return menu;
    },

    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        return this.menu.getValue();
    },

    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
    setValue: function (value) {
        this.menu.setValue(value);
    },

    /**
     * @private
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
    isActivatable: function () {
        var values = this.getValue(),
            key;
        for (key in values) {
            if (values[key] !== undefined) {
                return true;
            }
        }
        return false;
    },

    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function () {
        var key,
            args = [],
            values = this.menu.getValue();
        for (key in values) {
            args.push({
                type: 'numeric',
                comparison: key,
                value: values[key]
            });
        }
        return args;
    },

    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function (record) {
        var val = record.get(this.dataIndex),
            values = this.getValue(),
            isNumber = Ext.isNumber;
        if (isNumber(values.eq) && val != values.eq) {
            return false;
        }
        if (isNumber(values.lt) && val >= values.lt) {
            return false;
        }
        if (isNumber(values.gt) && val <= values.gt) {
            return false;
        }
        return true;
    }
});


/**
 * @class Ext.ux.grid.filter.ListFilter
 * @extends Ext.ux.grid.filter.Filter
 * <p>List filters are able to be preloaded/backed by an Ext.data.Store to load
 * their options the first time they are shown. ListFilter utilizes the
 * {@link Ext.ux.grid.menu.ListMenu} component.</p>
 * <p>Although not shown here, this class accepts all configuration options
 * for {@link Ext.ux.grid.menu.ListMenu}.</p>
 *
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
 var filters = Ext.create('Ext.ux.grid.GridFilters', {
 ...
 filters: [{
 type: 'list',
 dataIndex: 'size',
 phpMode: true,
 // options will be used as data to implicitly creates an ArrayStore
 options: ['extra small', 'small', 'medium', 'large', 'extra large']
 }]
 });
 * </code></pre>
 *
 */
Ext.define('Ext.ux.grid.filter.ListFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.list',

    /**
     * @cfg {Array} options
     * <p><code>data</code> to be used to implicitly create a data store
     * to back this list when the data source is <b>local</b>. If the
     * data for the list is remote, use the <code>{@link #store}</code>
     * config instead.</p>
     * <br><p>Each item within the provided array may be in one of the
     * following formats:</p>
     * <div class="mdetail-params"><ul>
     * <li><b>Array</b> :
     * <pre><code>
     options: [
     [11, 'extra small'],
     [18, 'small'],
     [22, 'medium'],
     [35, 'large'],
     [44, 'extra large']
     ]
     * </code></pre>
     * </li>
     * <li><b>Object</b> :
     * <pre><code>
     labelField: 'name', // override default of 'text'
     options: [
     {id: 11, name:'extra small'},
     {id: 18, name:'small'},
     {id: 22, name:'medium'},
     {id: 35, name:'large'},
     {id: 44, name:'extra large'}
     ]
     * </code></pre>
     * </li>
     * <li><b>String</b> :
     * <pre><code>
     * options: ['extra small', 'small', 'medium', 'large', 'extra large']
     * </code></pre>
     * </li>
     */
    /**
     * @cfg {Boolean} phpMode
     * <p>Adjust the format of this filter. Defaults to false.</p>
     * <br><p>When GridFilters <code>@cfg encode = false</code> (default):</p>
     * <pre><code>
     // phpMode == false (default):
     filter[0][data][type] list
     filter[0][data][value] value1
     filter[0][data][value] value2
     filter[0][field] prod

     // phpMode == true:
     filter[0][data][type] list
     filter[0][data][value] value1, value2
     filter[0][field] prod
     * </code></pre>
     * When GridFilters <code>@cfg encode = true</code>:
     * <pre><code>
     // phpMode == false (default):
     filter : [{"type":"list","value":["small","medium"],"field":"size"}]

     // phpMode == true:
     filter : [{"type":"list","value":"small,medium","field":"size"}]
     * </code></pre>
     */
    phpMode: false,
    /**
     * @cfg {Ext.data.Store} store
     * The {@link Ext.data.Store} this list should use as its data source
     * when the data source is <b>remote</b>. If the data for the list
     * is local, use the <code>{@link #options}</code> config instead.
     */

    /**
     * @private
     * Template method that is to initialize the filter.
     * @param {Object} config
     */
    init: function (config) {
        this.dt = Ext.create('Ext.util.DelayedTask', this.fireUpdate, this);
    },

    /**
     * @private @override
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
    createMenu: function (config) {
        var menu = Ext.create('Ext.ux.grid.menu.ListMenu', config);
        menu.on('checkchange', this.onCheckChange, this);
        return menu;
    },

    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        return this.menu.getSelected();
    },
    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
    setValue: function (value) {
        this.menu.setSelected(value);
        this.fireEvent('update', this);
    },

    /**
     * @private
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
    isActivatable: function () {
        return this.getValue().length > 0;
    },

    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function () {
        return {
            type: 'list',
            value: this.phpMode ? this.getValue().join(',') : this.getValue()
        };
    },

    /** @private */
    onCheckChange: function () {
        this.dt.delay(this.updateBuffer);
    },


    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function (record) {
        var valuesArray = this.getValue();
        return Ext.Array.indexOf(valuesArray, record.get(this.dataIndex)) > -1;
    }
});


/**
 * @class Ext.ux.grid.filter.DateFilter
 * @extends Ext.ux.grid.filter.Filter
 * Filter by a configurable Ext.picker.DatePicker menu
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
 var filters = Ext.create('Ext.ux.grid.GridFilters', {
 ...
 filters: [{
 // required configs
 type: 'date',
 dataIndex: 'dateAdded',

 // optional configs
 dateFormat: 'm/d/Y',  // default
 beforeText: 'Before', // default
 afterText: 'After',   // default
 onText: 'On',         // default
 pickerOpts: {
 // any DatePicker configs
 },

 active: true // default is false
 }]
 });
 * </code></pre>
 */
Ext.define('Ext.ux.grid.filter.DateFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.date',
    uses: ['Ext.picker.Date', 'Ext.menu.Menu'],

    /**
     * @cfg {String} afterText
     * Defaults to 'After'.
     */
    afterText: 'Sonra',
    /**
     * @cfg {String} beforeText
     * Defaults to 'Before'.
     */
    beforeText: 'Önce',
    /**
     * @cfg {Object} compareMap
     * Map for assigning the comparison values used in serialization.
     */
    compareMap: {
        before: 'lt',
        after: 'gt',
        on: 'eq'
    },
    /**
     * @cfg {String} dateFormat
     * The date format to return when using getValue.
     * Defaults to 'm/d/Y'.
     */
    dateFormat: 'm/d/Y',

    /**
     * @cfg {Date} maxDate
     * Allowable date as passed to the Ext.DatePicker
     * Defaults to undefined.
     */
    /**
     * @cfg {Date} minDate
     * Allowable date as passed to the Ext.DatePicker
     * Defaults to undefined.
     */
    /**
     * @cfg {Array} menuItems
     * The items to be shown in this menu
     * Defaults to:<pre>
     * menuItems : ['before', 'after', '-', 'on'],
     * </pre>
     */
    menuItems: ['before', 'after', '-', 'on'],

    /**
     * @cfg {Object} menuItemCfgs
     * Default configuration options for each menu item
     */
    menuItemCfgs: {
        selectOnFocus: true,
        width: 125
    },

    /**
     * @cfg {String} onText
     * Defaults to 'On'.
     */
    onText: 'Tam gün',

    /**
     * @cfg {Object} pickerOpts
     * Configuration options for the date picker associated with each field.
     */
    pickerOpts: {},

    /**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
    init: function (config) {
        var me = this,
            pickerCfg, i, len, item, cfg;

        pickerCfg = Ext.apply(me.pickerOpts, {
            xtype: 'datepicker',
            minDate: me.minDate,
            maxDate: me.maxDate,
            format: me.dateFormat,
            listeners: {
                scope: me,
                select: me.onMenuSelect
            }
        });

        me.fields = {};
        for (i = 0, len = me.menuItems.length; i < len; i++) {
            item = me.menuItems[i];
            if (item !== '-') {
                cfg = {
                    itemId: 'range-' + item,
                    text: me[item + 'Text'],
                    menu: Ext.create('Ext.menu.Menu', {
                        items: [
                            Ext.apply(pickerCfg, {
                                itemId: item,
                                listeners: {
                                    select: me.onPickerSelect,
                                    scope: me
                                }
                            }),
                        ]
                    }),
                    listeners: {
                        scope: me,
                        checkchange: me.onCheckChange
                    }
                };
                item = me.fields[item] = Ext.create('Ext.menu.CheckItem', cfg);
            }
            //me.add(item);
            me.menu.add(item);
        }
        me.values = {};
    },

    onCheckChange: function (item, checked) {
        var me = this,
            picker = item.menu.items.first(),
            itemId = picker.itemId,
            values = me.values;

        if (checked) {
            values[itemId] = picker.getValue();
        } else {
            delete values[itemId]
        }
        me.setActive(me.isActivatable());
        me.fireEvent('update', me);
    },

    /**
     * @private
     * Handler method called when there is a keyup event on an input
     * item of this menu.
     */
    onInputKeyUp: function (field, e) {
        var k = e.getKey();
        if (k == e.RETURN && field.isValid()) {
            e.stopEvent();
            this.menu.hide();
        }
    },

    /**
     * Handler for when the DatePicker for a field fires the 'select' event
     * @param {Ext.picker.Date} picker
     * @param {Object} date
     */
    onMenuSelect: function (picker, date) {
        var fields = this.fields,
            field = this.fields[picker.itemId];

        field.setChecked(true);

        if (field == fields.on) {
            fields.before.setChecked(false, true);
            fields.after.setChecked(false, true);
        } else {
            fields.on.setChecked(false, true);
            if (field == fields.after && this.getFieldValue('before') < date) {
                fields.before.setChecked(false, true);
            } else if (field == fields.before && this.getFieldValue('after') > date) {
                fields.after.setChecked(false, true);
            }
        }
        this.fireEvent('update', this);

        picker.up('menu').hide();
    },

    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        var key, result = {};
        for (key in this.fields) {
            if (this.fields[key].checked) {
                result[key] = this.getFieldValue(key);
            }
        }
        return result;
    },

    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     * @param {Boolean} preserve true to preserve the checked status
     * of the other fields.  Defaults to false, unchecking the
     * other fields
     */
    setValue: function (value, preserve) {
        var key;
        for (key in this.fields) {
            if (value[key]) {
                this.getPicker(key).setValue(value[key]);
                this.fields[key].setChecked(true);
            } else if (!preserve) {
                this.fields[key].setChecked(false);
            }
        }
        this.fireEvent('update', this);
    },

    /**
     * @private
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
    isActivatable: function () {
        var key;
        for (key in this.fields) {
            if (this.fields[key].checked) {
                return true;
            }
        }
        return false;
    },

    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function () {
        var args = [];
        for (var key in this.fields) {
            if (this.fields[key].checked) {
                args.push({
                    type: 'date',
                    comparison: this.compareMap[key],
                    value: Ext.Date.format(this.getFieldValue(key), this.dateFormat)
                });
            }
        }
        return args;
    },

    /**
     * Get and return the date menu picker value
     * @param {String} item The field identifier ('before', 'after', 'on')
     * @return {Date} Gets the current selected value of the date field
     */
    getFieldValue: function (item) {
        return this.values[item];
    },

    /**
     * Gets the menu picker associated with the passed field
     * @param {String} item The field identifier ('before', 'after', 'on')
     * @return {Object} The menu picker
     */
    getPicker: function (item) {
        return this.fields[item].menu.items.first();
    },

    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function (record) {
        var key,
            pickerValue,
            val = record.get(this.dataIndex),
            clearTime = Ext.Date.clearTime;

        if (!Ext.isDate(val)) {
            return false;
        }
        val = clearTime(val, true).getTime();

        for (key in this.fields) {
            if (this.fields[key].checked) {
                pickerValue = clearTime(this.getFieldValue(key), true).getTime();
                if (key == 'before' && pickerValue <= val) {
                    return false;
                }
                if (key == 'after' && pickerValue >= val) {
                    return false;
                }
                if (key == 'on' && pickerValue != val) {
                    return false;
                }
            }
        }
        return true;
    },

    onPickerSelect: function (picker, date) {
        // keep track of the picker value separately because the menu gets destroyed
        // when columns order changes.  We return this value from getValue() instead
        // of picker.getValue()
        this.values[picker.itemId] = date;
        this.fireEvent('update', this);
    }
});


/**
 * @class Ext.ux.grid.filter.BooleanFilter
 * @extends Ext.ux.grid.filter.Filter
 * Boolean filters use unique radio group IDs (so you can have more than one!)
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
 var filters = Ext.create('Ext.ux.grid.GridFilters', {
 ...
 filters: [{
 // required configs
 type: 'boolean',
 dataIndex: 'visible'

 // optional configs
 defaultValue: null, // leave unselected (false selected by default)
 yesText: 'Yes',     // default
 noText: 'No'        // default
 }]
 });
 * </code></pre>
 */
Ext.define('Ext.ux.grid.filter.BooleanFilter', {
    extend: 'Ext.ux.grid.filter.Filter',
    alias: 'gridfilter.boolean',

    /**
     * @cfg {Boolean} defaultValue
     * Set this to null if you do not want either option to be checked by default. Defaults to false.
     */
    defaultValue: false,
    /**
     * @cfg {String} yesText
     * Defaults to 'Yes'.
     */
    yesText: 'Yes',
    /**
     * @cfg {String} noText
     * Defaults to 'No'.
     */
    noText: 'No',

    /**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
    init: function (config) {
        var gId = Ext.id();
        this.options = [
            Ext.create('Ext.menu.CheckItem', {
                text: this.yesText,
                group: gId,
                checked: this.defaultValue === true
            }),
            Ext.create('Ext.menu.CheckItem', {
                text: this.noText,
                group: gId,
                checked: this.defaultValue === false
            })
        ];

        this.menu.add(this.options[0], this.options[1]);

        for (var i = 0; i < this.options.length; i++) {
            this.options[i].on('click', this.fireUpdate, this);
            this.options[i].on('checkchange', this.fireUpdate, this);
        }
    },

    /**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
    getValue: function () {
        return this.options[0].checked;
    },

    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
    setValue: function (value) {
        this.options[value ? 0 : 1].setChecked(true);
    },

    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function () {
        var args = {
            type: 'boolean',
            value: this.getValue()
        };
        return args;
    },

    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function (record) {
        return record.get(this.dataIndex) == this.getValue();
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Ext.ux.desktop.Module', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },

    init: Ext.emptyFn
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

var windowIndex = 0;

Ext.define('UGRFrontend.desktop.ApplicationModule', {
    extend: 'Ext.ux.desktop.Module',

    constructor: function (c) {
        var me = this;
        this.launcher = {
            id: c.id + '-launcher',
            text: c.title,
            cls: c.cls,
            iconCls: 'bogus',
            name: c.name,
            typeFK: c.typeFK,
            iconFile: c.iconFile,
            iconFolder: c.iconFolder,
            listeners: {
                click: function () {
                    if (this.typeFK == '00000000000000000000000000000003') {
                        window.open(c.cls, '_blank');
                    } else {
                        UGRJS.Desktop.initiateModule({
                            cls: c.cls,
                            form: 'default'
                        });
                    }
                },
                render: me.initDD
            },
            scope: me,
            windowId: c.name,
            icon: '../icons/' + c.iconFolder + '/16/' + c.iconFile
        }

        this.callParent(arguments);
    },

    initDD: function (module) {
        var me = this;

        var prevProxy = Ext.getCmp(me.id + '-drag-status-proxy');
        if (prevProxy != null) {
            Ext.destroy(prevProxy);
        }

        me.ghost = Ext.core.DomHelper.append(
            'desktop-shortcut-dataview',
            '<div class="ux-desktop-shortcut x-abs-layout-ct" id="' + me.initialConfig.name + '-shortcut" style="left:0px; top:0px; position:absolute">' +
            '<div class="ux-desktop-shortcut-icon" id="' + me.initialConfig.name + '-shortcut-img" style="background-image: url(sources/assets/icons/' + me.initialConfig.iconFolder + '/48/' + me.initialConfig.iconFile + ')">' +
            '<img src="' + Ext.BLANK_IMAGE_URL + '" title="' + me.text + '">' +
            '</div>' +
            '<span class="ux-desktop-shortcut-text">' + me.text + '</span>' +
            '</div>',
            true
        );

        me.ghost.hide();

        me.dragSource = Ext.create('Ext.dd.DragSource', me.getEl(), {
            ddGroup: 'organizerDD',
            animRepair: true,
            getDragEl: function () {
                return me.ghost;
            },
            getRepairXY: function (e) {
                return [0, 0];
            },
            setDragElPos: function (x, y) {
                var el = this.getDragEl();
                this.alignElWithMouse(el, x - 45, y - 45);
            },
            getDragData: function (e) {
                return {
                    applicationModuleName: me.initialConfig.name,
                    applicationModuleClass: me.initialConfig.cls,
                    applicationModuleForm: 'default',
                    applicationModuleIconFolder: me.initialConfig.iconFolder,
                    applicationModuleIcon: me.initialConfig.iconFile,
                    applicationModuleFK: me.initialConfig.apFK,
                    userShortcutTitle: me.text
                };
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

Ext.define('UGRFrontend.desktop.ApplicationMenu', {
    extend: 'Ext.ux.desktop.Module',

    constructor: function (c) {
        var me = this;
        var items = [];

        for (var k in c.menus) {
            if (c.menus[k].startMenuFK == c.self) {
                if (c.menus[k].applicationModuleClass == '') {
                    var menu = Ext.create('UGRFrontend.desktop.ApplicationMenu', {
                        id: 'taskbar-startmenu-' + c.menus[k].startMenuPK,
                        title: c.menus[k].startMenuTitle,
                        parentMenu: c.menus[k].startMenuFK,
                        self: c.menus[k].startMenuPK,
                        menus: c.menus
                    });

                    if (menu.launcher != null) {
                        items.push(menu.launcher);
                    }
                } else {

                    items.push(Ext.create('UGRFrontend.desktop.ApplicationModule', {
                        id: 'taskbar-startmenu-' + c.menus[k].startMenuPK,
                        title: c.menus[k].startMenuTitle,
                        parentMenu: c.menus[k].startMenuFK,
                        self: c.menus[k].startMenuPK,
                        cls: c.menus[k].applicationModuleClass,
                        name: c.menus[k].applicationModuleName,
                        typeFK: c.menus[k].applicationModuleTypeFK_,
                        iconFolder: c.menus[k].applicationModuleIconFolder,
                        iconFile: c.menus[k].applicationModuleIcon
                    }).launcher);
                }
            }
        }

        if (items.length > 0) {
            this.launcher = {
                id: c.id + '-launcher',
                text: c.title,
                iconCls: 'x-tree-icon-parent',
                handler: function () {
                    return false;
                },
                menu: {
                    items: items
                }
            };
        }
        /*
        for (var i = 0; i < 5; ++i) {
            this.launcher.menu.items.push({
                text: 'Window '+(++windowIndex),
                iconCls:'bogus',
                handler : this.createWindow,
                scope: this,
                windowId: windowIndex
            });
        }
        */

        this.callParent(arguments);
    }

    /*
    init : function() {

        this.launcher = {
            text: c.title,
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
    */
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.widget.GTWidget', {
    extend: 'Ext.container.Container',
    alias: 'widget.mwidget',

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.callParent(arguments);
    },

    onRender: function () {
        var me = this;

        me.getEl().addCls('widget');

        this.callParent(arguments);
    }
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.widget.GWClock', {
    extend: 'UGRFrontend.desktop.widget.GTWidget',
    alias: 'widget.wclock',

    constructor: function (c) {
        var me = this;

        if (!myDesktopApp.clockInitialized) {
            $('head').append('<style type="text/css"> * { margin: 0; padding: 0; }  #clock { position: relative; width: 200px; height: 200px; margin: 10px auto 0 auto; background: url(images/clockface.png); -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; list-style: none; }  #sec, #min, #hour { position: absolute; width: 10px; height: 200px; top: 0px; left: 95px; }  #sec { background: url(images/sechand.png); -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; z-index: 16003; }  #min { background: url(images/minhand.png); -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; z-index: 16002; }  #hour { background: url(images/hourhand.png); -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; z-index: 16001; } </style>');

            myDesktopApp.clockInitialized = true;
        }

        c.html = '<ul id="clock"> <li id="sec"></li> <li id="hour"></li> <li id="min"></li> </ul>';

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.callParent(arguments);
    },

    onRender: function () {
        setInterval(function () {
            var seconds = new Date().getSeconds();
            var sdegree = seconds * 6;
            var srotate = "rotate(" + sdegree + "deg)";

            $("#sec").css({
                "-moz-transform": srotate,
                "-webkit-transform": srotate
            });

        }, 1000);


        setInterval(function () {
            var hours = new Date().getHours();
            var mins = new Date().getMinutes();
            var hdegree = hours * 30 + (mins / 2);
            var hrotate = "rotate(" + hdegree + "deg)";

            $("#hour").css({
                "-moz-transform": hrotate,
                "-webkit-transform": hrotate
            });

        }, 1000);


        setInterval(function () {
            var mins = new Date().getMinutes();
            var mdegree = mins * 6;
            var mrotate = "rotate(" + mdegree + "deg)";

            $("#min").css({
                "-moz-transform": mrotate,
                "-webkit-transform": mrotate
            });

        }, 1000);

        this.callParent(arguments);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.widget.GWNotification', {
    extend: 'UGRFrontend.desktop.widget.GTWidget',
    alias: 'widget.wnotification',

    constructor: function (c) {
        var me = this;

        if (!myDesktopApp.notificationInitialized) {
            $('head').append('<link rel="stylesheet" href="../UGRJS/plugin/notification/css/style.css">');

            myDesktopApp.notificationInitialized = true;
        }

        c.html = '<div class="notification-container">' +
            '<nav class="notification-nav">' +
            '<ul class="notification-nav-list">' +
            '<li><a href="#" class="notification-nav-link" id="notification-nav-link-message">Mesajlar <span class="notification-nav-counter notification-nav-counter-green">1</span></a></li>' +
            '<li><a href="#" class="notification-nav-link" id="notification-nav-link-notification">Bildirimler <span class="notification-nav-counter notification-nav-counter-blue">1</span></a></li>' +
            '<li><a href="#" class="notification-nav-link" id="notification-nav-link-warning">Uyarılar <span class="notification-nav-counter">1</span></a></li>' +
            '</ul>' +
            '</nav>' +
            '<div class="notification-call"><img src="../resources/desktop/widgets/calling.gif" style="width:80px; height:80px"><div style="pading: 4px;">' +
            '<a href="#" id="notification-call-answer"><img src="../resources/desktop/widgets/answer.png" style="width:24px; height:24px;"></a> &nbsp;' +
            '<a href="#" id="notification-call-reject"><img src="../resources/desktop/widgets/reject.png" style="width:24px; height:24px;"></a></div></div>' +
            '<div class="notification-call-name">... arıyor...</div>' +
            '</div>';

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.callParent(arguments);
        me.callAudio = new Audio('../resources/desktop/widgets/phonecall.mp3');
        me.callAudio.loop = true;
    },

    startRinging: function (options) {
        var me = this;

        var parts = options.split('|')

        me.callAudio.play();
        $(".notification-call").show();
        $(".notification-call-name").html(parts[0]);
        $(".notification-call-name").show();
    },

    stopRinging: function (options) {
        var me = this;

        me.callAudio.pause();
        me.callAudio.currentTime = 0;
        $(".notification-call").hide();
        $(".notification-call-name").hide();
    },

    onRender: function () {
        var me = this;
        this.callParent(arguments);

        $("#notification-nav-link-message .notification-nav-counter").hide();
        $("#notification-nav-link-notification .notification-nav-counter").hide();
        $("#notification-nav-link-warning .notification-nav-counter").hide();

        $(".notification-call").hide();
        $(".notification-call-name").hide();

        $("#notification-nav-link-message").click(function (e) {
            me.openNotifications("message");
        });

        $("#notification-nav-link-notification").click(function (e) {
            me.openNotifications("notification");
        });

        $("#notification-nav-link-warning").click(function (e) {
            me.openNotifications("warning");
        });

        $("#notification-call-answer").click(function (e) {
            me.stopRinging();

            UGRJS.Desktop.runMethod({
                cls: 'com.ark.server.probe.desktop.ServiceNotification',
                method: 'callReply',
                args: [{
                    key: 'type',
                    value: 'answer'
                }],
                processResponse: true,
                onSuccess: function (msg) {

                },
                onFail: function (msg) {
                    Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
                }
            });
        });

        $("#notification-call-reject").click(function (e) {
            me.stopRinging();

            UGRJS.Desktop.runMethod({
                cls: 'com.ark.server.probe.desktop.ServiceNotification',
                method: 'callReply',
                args: [{
                    key: 'type',
                    value: 'reject'
                }],
                processResponse: true,
                onSuccess: function (msg) {

                },
                onFail: function (msg) {
                    Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
                }
            });
        });

        UGRJS.Desktop.runMethod({
            cls: 'com.ark.server.probe.desktop.ServiceNotification',
            method: 'getNotifications',
            processResponse: true,
            onSuccess: function (msg) {

            },
            onFail: function (msg) {
                Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
            }
        });
    },

    openNotifications: function (type) {
        UGRJS.Desktop.runMethod({
            cls: 'com.ark.server.probe.desktop.ServiceNotification',
            method: 'openNotifications',
            processResponse: true,
            args: [{
                key: 'type',
                value: type
            }],
            onSuccess: function (msg) {

            },
            onFail: function (msg) {
                Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
            }
        });
    },

    setWarning: function (num) {
        if (num && (num > 0)) {
            $("#notification-nav-link-warning .notification-nav-counter").html(num + "");
            $("#notification-nav-link-warning .notification-nav-counter").show();
        } else {
            $("#notification-nav-link-warning .notification-nav-counter").html("");
            $("#notification-nav-link-warning .notification-nav-counter").hide();
        }
    },

    setMessage: function (num) {
        if (num && (num > 0)) {
            $("#notification-nav-link-message .notification-nav-counter").html(num + "");
            $("#notification-nav-link-message .notification-nav-counter").show();
        } else {
            $("#notification-nav-link-message .notification-nav-counter").html("");
            $("#notification-nav-link-message .notification-nav-counter").hide();
        }
    },

    setNotification: function (num) {
        if (num && (num > 0)) {
            $("#notification-nav-link-notification .notification-nav-counter").html(num + "");
            $("#notification-nav-link-notification .notification-nav-counter").show();
        } else {
            $("#notification-nav-link-notification .notification-nav-counter").html("");
            $("#notification-nav-link-notification .notification-nav-counter").hide();
        }
    },

    setWarningTip: function (tip) {
        var me = this;
        if (tip != null) {
            if (me.messageTip != null) {
                me.messageTip.destroy();
            }

            me.messageTip = Ext.create('Ext.tip.ToolTip', {
                target: 'notification-nav-link-warning',
                html: tip,
                anchor: 'top',
                autoHide: false,
                closable: true
            });

            var pos = $('#notification-nav-link-warning').offset();

            me.messageTip.showAt([
                pos.left,
                pos.top + 40
            ]);
        }
    },

    setNotificationTip: function (tip) {
        var me = this;
        if (tip != null) {
            if (me.messageTip != null) {
                me.messageTip.destroy();
            }

            me.messageTip = Ext.create('Ext.tip.ToolTip', {
                target: 'notification-nav-link-notification',
                html: tip,
                anchor: 'top',
                autoHide: false,
                closable: true
            });

            var pos = $('#notification-nav-link-notification').offset();

            me.messageTip.showAt([
                pos.left,
                pos.top + 40
            ]);
        }
    },

    setMessageTip: function (tip) {
        var me = this;
        if (tip != null) {
            if (me.messageTip != null) {
                me.messageTip.destroy();
            }

            me.messageTip = Ext.create('Ext.tip.ToolTip', {
                target: 'notification-nav-link-message',
                html: tip,
                anchor: 'top',
                autoHide: false,
                closable: true
            });

            var pos = $('#notification-nav-link-message').offset();

            me.messageTip.showAt([
                pos.left,
                pos.top + 40
            ]);
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.Language', {

    translateables: [],

    constructor: function (c) {
        var me = this;
        Ext.DatePicker.prototype.startDay = 1;
        Ext.Date.dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        Ext.Date.monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

        me.addTranslateable('desktop-taskbar-btn-startmenu', 'STATIC.START', 'text', 'Menü');
        me.addTranslateable('shortcutmenu-rename', 'STATIC.RENAME', 'text', 'Yeniden adlandır');
        me.addTranslateable('desktop-taskbar-btn-settings', 'STATIC.SETTINGS', 'text', 'Ayarlar');
        me.addTranslateable('desktop-taskbar-btn-logout', 'STATIC.LOGOUT', 'text', 'Çıkış');

        var cmpAscending = Ext.create('Ext.Button', {
            id: 'generic-sort-ascending'
        });
        me.addTranslateable('generic-sort-ascending', 'STATIC.SORTASCENDING', 'text', 'Artan Sıralama');

        var cmpEditedBy = Ext.create('Ext.Button', {
            id: 'generic-edited-by'
        });
        me.addTranslateable('generic-edited-by', 'STATIC.EDITEDBY', 'text', 'Kaydı düzenleyen: ');

        var cmpInsertedBy = Ext.create('Ext.Button', {
            id: 'generic-inserted-by'
        });
        me.addTranslateable('generic-inserted-by', 'STATIC.INSERTEDBY', 'text', 'Kaydı ekleyen: ');

        var cmpDeletedBy = Ext.create('Ext.Button', {
            id: 'generic-deleted-by'
        });
        me.addTranslateable('generic-deleted-by', 'STATIC.DELETEDBY', 'text', 'Kaydı silen: ');

        var cmpConnectionLost = Ext.create('Ext.Button', {
            id: 'generic-connection-lost'
        });
        me.addTranslateable('generic-connection-lost', 'STATIC.CONNECTIONLOST', 'text', 'Sunucuyla bağlantı koptu. Yeniden bağlanılsın mı? ');

        var cmpMsgLogout = Ext.create('Ext.Button', {
            id: 'generic-msg-logout'
        });
        me.addTranslateable('generic-msg-logout', 'STATIC.MSGLOGOUT', 'text', 'Çıkış yapmak istediğinizden emin misiniz? ');

        var cmpTitleLogout = Ext.create('Ext.Button', {
            id: 'generic-title-logout'
        });
        me.addTranslateable('generic-title-logout', 'STATIC.TITLELOGOUT', 'text', 'Güvenli Çıkış');

        me.addTranslateable('generic-title-logout', 'STATIC.SETTINGS', 'text', 'Ayarlar');

        // MesageBox Config
        var cmpYES = Ext.create('Ext.Button', {
            id: 'generic-confirm-yes'
        });
        me.addTranslateable('generic-confirm-yes', 'STATIC.YES', 'text', 'Evet');

        var cmpNO = Ext.create('Ext.Button', {
            id: 'generic-confirm-no'
        });
        me.addTranslateable('generic-confirm-no', 'STATIC.NO', 'text', 'Hayır');

        var cmpOK = Ext.create('Ext.Button', {
            id: 'generic-confirm-ok'
        });
        me.addTranslateable('generic-confirm-ok', 'STATIC.OK', 'text', 'Tamam');

        var cmpCANCEL = Ext.create('Ext.Button', {
            id: 'generic-confirm-cancel'
        });
        me.addTranslateable('generic-confirm-cancel', 'STATIC.CANCEL', 'text', 'İptal');

        me.prepareMessageBox();
        //
    },

    changeLanguage: function (lang) {
        var me = this;

        if (lang == 'EN-US') {
            Ext.Date.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            Ext.Date.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'December', 'November'];
        } else if (lang == 'TR-TR') {
            Ext.Date.dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            Ext.Date.monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        }

        me.prepareMessageBox();
    },

    prepareMessageBox: function () {
        Ext.window.MessageBox.prototype.buttonText = {
            ok: Ext.getCmp('generic-confirm-ok').getText(),
            cancel: Ext.getCmp('generic-confirm-cancel').getText(),
            yes: Ext.getCmp('generic-confirm-yes').getText(),
            no: Ext.getCmp('generic-confirm-no').getText(),
        };
    },

    addTranslateable: function (id, key, pName, value) {
        var me = this;
        var trb = {
            gtype: 'translateable',
            id: id,
            key: key,
            pName: pName,
            value: value
        };

        this.translateables.push(trb);
        UGRJS.Desktop.registerTranslateable(trb);
        UGRJS.Desktop.setTranslateable(trb);
    }
});


/**

 */
Ext.define('UGRFrontend.data.proxy.Socket', {
    requires: ['Ext.util.MixedCollection'],
    extend: 'Ext.data.proxy.Server',
    alias: 'proxy.socket',
    alternateClassName: ['UGRFrontend.data.SocketProxy'],

    constructor: function (c) {
        var me = this;

        Ext.apply(c, {
            pageParam: '@page',
            limitParam: '@limit',
            startParam: '@start',
            sortParam: '@sort'
        });

        me.relatedTree = c.relatedTree;
        me.relatedCalendar = c.relatedCalendar;

        this.callParent(arguments);
    },

    actionMethods: {
        create: 'save',
        read: 'list',
        update: 'save',
        destroy: 'delete'
    },

    doRequest: function (operation, callback, scope) {
        var me = this;

        if (UGRFrontend.data.proxy.Socket.isBusy) {
            Ext.defer(me.doRequest, 200, me, [operation, callback, scope]);
        } else {

            UGRFrontend.data.proxy.Socket.isBusy = true;

            var writer = this.getWriter(),
                request = this.buildRequest(operation, callback, scope);

            if (operation.allowWrite()) {
                request = writer.write(request);
            }

            var args = [];

            if (request.params != null) {
                for (var pname in request.params) {
                    args.push({
                        'key': pname,
                        'value': request.params[pname]
                    });
                }
            }

            var gParameters = null;
            if (scope.proxy.relatedStore != null) {
                if (scope.proxy.relatedStore.relatedGrid != null) {
                    gParameters = scope.proxy.relatedStore.relatedGrid.gParameters;
                } else if (scope.proxy.relatedStore.relatedView != null) {
                    gParameters = scope.proxy.relatedStore.relatedView.gParameters;
                } else if (scope.proxy.relatedStore.relatedChart != null) {
                    gParameters = scope.proxy.relatedStore.relatedChart.gParameters;
                } else if (scope.proxy.relatedStore.relatedCalendar != null) {
                    gParameters = scope.proxy.relatedStore.relatedCalendar.gParameters;
                } else if (scope.proxy.relatedStore.relatedSearchBox != null) {
                    gParameters = scope.proxy.relatedStore.relatedSearchBox.gParameters;
                }
            } else if (scope.proxy.relatedTree != null) {
                gParameters = scope.proxy.relatedTree.gParameters;
            }

            if (gParameters != null) {
                for (var pName in gParameters) {
                    args.push({
                        'key': pName,
                        'value': gParameters[pName]
                    });
                }
            }

            if (Ext.isArray(operation.sorters)) {
                var sorterParams = '';
                for (var k = 0; k < operation.sorters.length; k++) {
                    if (sorterParams != '') {
                        sorterParams += ';';
                    }

                    var sorter = operation.sorters[k];
                    sorterParams += sorter.property + '=' + ((sorter.direction == 'ASC') ? 'A' : 'D');
                }

                args.push({
                    'key': '@sort',
                    'value': sorterParams
                });
            }

            args.push({
                'key': '@formUuid',
                'value': scope.proxy.formUuid
            });

            Ext.apply(request, {
                args: args,
                onSuccess: function (msg) {
                    msg.success = true;
                    msg.orgRows = msg.rows;
                    msg.rows = UGRJS.Desktop.getRowData(msg.orgRows);
                    if (msg.rows.length > 0) {
                        if (me.relatedStore != null) {
                            me.relatedStore.idField = msg.rows[0]['@id'];
                            // if ( (! me.storeInitiated ) && (me.model['$className'] == 'UGRFrontend.data.model.Dynamic')){
                            me.initiateStore(me.relatedStore, msg);
                            // }
                        }
                    }

                    // var cb = me.createRequestCallback(request, operation, callback, scope);
                    me.processResponse(true, operation, request, msg, callback, scope);
                    if (Ext.isArray(msg.changes)) {
                        UGRJS.Desktop.processChanges(msg.changes);
                    }

                    UGRFrontend.data.proxy.Socket.isBusy = false;
                },
                onFail: function (msg) {
                    UGRFrontend.data.proxy.Socket.isBusy = false;
                    // alert('failed loading tree');
                },
                scope: this,
                processResponse: false
            });

            UGRJS.Desktop.runAction(request);
            // Ext.Ajax.request(request);
        }

        return request;
    },

    getMethod: function (request) {
        return this.actionMethods[request.action];
    },

    buildRequest: function (operation, callBack, scope) {
        var request = this.callParent(arguments);

        return Ext.apply(request, {
            cls: scope.proxy.url,
            action: this.getMethod(request)
        });
    },

    storeInitiated: false,

    initiateStore: function (store, msg, columnsOnly) {
        var me = this;

        var model = me.getModel();
        if (model.modelName == 'UGRFrontend.data.model.Dynamic') {
            var fields = me.getDataFields(msg.orgRows || msg);
            fields.push({
                name: '_status',
                type: 'string'
            });
            fields.push({
                name: '_owner',
                type: 'string'
            });
            model.setFields(fields);
            if (!columnsOnly) {
                me.relatedStore.removeAll();
            }
            // me.getStore().add(UGRJS.Desktop.getRowData(msg.orgRows));
        } else {
            if (me.relatedStore.setDateFormat != null) {
                me.relatedStore.setDateFormat(msg.dateFormat);
            }
        }

        me.storeInitiated = true;
    },

    getDataFields: function (rows) {
        var output = [];
        if (rows.length > 0) {
            var row = rows[0];
            for (var m = 0; m < row.columns.length; m++) {
                var column = row.columns[m];
                var type = 'string';
                if (column.isInteger) {
                    type = 'int';
                }
                output.push({
                    name: column.name,
                    type: type
                });
            }
        }

        return output;
    }
}, function () {
    //backwards compatibility, remove in Ext JS 5.0
    Ext.data.HttpProxy = this;
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.view.GTChatView', {
    extend: 'Ext.view.View',
    alias: 'widget.chatview',

    requires: [
        'UGRFrontend.data.proxy.Socket'
    ],

    constructor: function (c) {
        var me = this;
        if (c.store == null) {
            Ext.ns('UGRFrontend.model');
            if (UGRFrontend.model.ChatMessage == null) {
                Ext.define('UGRFrontend.model.ChatMessage', {
                    extend: 'Ext.data.Model',
                    fields: [{
                        name: 'sender',
                        type: 'string'
                    },
                        {
                            name: 'message',
                            type: 'string'
                        },
                        {
                            name: 'id',
                            type: 'string'
                        }
                    ]
                });
            }

            var chatStore = Ext.create('Ext.data.Store', {
                model: 'UGRFrontend.model.ChatMessage',
                proxy: (c.service == null) ? null : {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        type: 'json',
                        root: 'rows'
                    }
                },
                autoLoad: (c.service != null)
            });

            c.store = chatStore;

            if (c.tpl == null) {
                c.tpl = '<tpl for=\".\"><table class="chat-message"><tr><td class="chat-message-sender"><p>{sender}</p></td></tr><tr><td class="chat-message-text"><p>{message}</p></td></tr></table></tpl>';
            }

            if (c.channel != null) {
                c.subscriptionId = UGRJS.Desktop.subscribe({
                    name: c.channel,
                    callBack: me.processMessage,
                    scope: me
                });
            }

            UGRJS.Desktop.subscribe({
                name: 'public.presence',
                callBack: me.processPresence,
                scope: me
            });
        }

        this.callParent(arguments);
    },

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;
        var store = this.getStore();
        if (store != null) {
            store.getProxy()['formUuid'] = this.ownerUuid;
        }

        this.callParent(arguments);
    },

    messageId: 2,

    processMessage: function (message) {
        var me = this;
        if (message.fn == 'chat') {
            message.customData.id = me.messageId + '';
            me.messageId++;
            me.getStore().add(message.customData);
        }
    },

    onDestroy: function () {
        var me = this;

        UGRJS.Desktop.unsubscribe(me.subscriptionId);

        me.callParent(arguments);
    },

    processPresence: function (message) {
        var me = this;
        var contactTree = Ext.getCmp('communicator-tab-friends-tree');
        if (contactTree != null) {
            if (message.fn == 'presence') {
                var targetNode = contactTree.getRootNode().findChildBy(
                    function (cn) {
                        if (cn.raw.user2FK == message.customData.user) {
                            return true;
                        }
                    },
                    me,
                    true
                );
                if (targetNode != null) {
                    if (message.customData.type == "ONLINE") {
                        targetNode.set('icon', "../icons/communicator/online.png");
                    } else if (message.customData.type == "OFFLINE") {
                        targetNode.set('icon', "../icons/communicator/offline.png");
                    }
                }
            }
        }
    }
});


/**
 * FiltersFeature is a grid {@link Ext.grid.feature.Feature feature} that allows for a slightly more
 * robust representation of filtering than what is provided by the default store.
 *
 * Filtering is adjusted by the user using the grid's column header menu (this menu can be
 * disabled through configuration). Through this menu users can configure, enable, and
 * disable filters for each column.
 *
 * #Features#
 *
 * ##Filtering implementations:##
 *
 * Default filtering for Strings, Numeric Ranges, Date Ranges, Lists (which can be backed by a
 * {@link Ext.data.Store}), and Boolean. Additional custom filter types and menus are easily
 * created by extending {@link Ext.ux.grid.filter.Filter}.
 *
 * ##Graphical Indicators:##
 *
 * Columns that are filtered have {@link #filterCls a configurable css class} applied to the column headers.
 *
 * ##Automatic Reconfiguration:##
 *
 * Filters automatically reconfigure when the grid 'reconfigure' event fires.
 *
 * ##Stateful:##
 *
 * Filter information will be persisted across page loads by specifying a `stateId`
 * in the Grid configuration.
 *
 * The filter collection binds to the {@link Ext.grid.Panel#beforestaterestore beforestaterestore}
 * and {@link Ext.grid.Panel#beforestatesave beforestatesave} events in order to be stateful.
 *
 * ##GridPanel Changes:##
 *
 * - A `filters` property is added to the GridPanel using this feature.
 * - A `filterupdate` event is added to the GridPanel and is fired upon onStateChange completion.
 *
 * ##Server side code examples:##
 *
 * - [PHP](http://www.vinylfox.com/extjs/grid-filter-php-backend-code.php) - (Thanks VinylFox)
 * - [Ruby on Rails](http://extjs.com/forum/showthread.php?p=77326#post77326) - (Thanks Zyclops)
 * - [Ruby on Rails](http://extjs.com/forum/showthread.php?p=176596#post176596) - (Thanks Rotomaul)
 *
 * #Example usage:#
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         pageSize: 15
 *         ...
 *     });
 *
 *     var filtersCfg = {
 *         ftype: 'filters',
 *         autoReload: false, //don't reload automatically
 *         local: true, //only filter locally
 *         // filters may be configured through the plugin,
 *         // or in the column definition within the headers configuration
 *         filters: [{
 *             type: 'numeric',
 *             dataIndex: 'id'
 *         }, {
 *             type: 'string',
 *             dataIndex: 'name'
 *         }, {
 *             type: 'numeric',
 *             dataIndex: 'price'
 *         }, {
 *             type: 'date',
 *             dataIndex: 'dateAdded'
 *         }, {
 *             type: 'list',
 *             dataIndex: 'size',
 *             options: ['extra small', 'small', 'medium', 'large', 'extra large'],
 *             phpMode: true
 *         }, {
 *             type: 'boolean',
 *             dataIndex: 'visible'
 *         }]
 *     };
 *
 *     var grid = Ext.create('Ext.grid.Panel', {
 *          store: store,
 *          columns: ...,
 *          features: [filtersCfg],
 *          height: 400,
 *          width: 700,
 *          bbar: Ext.create('Ext.PagingToolbar', {
 *              store: store
 *          })
 *     });
 *
 *     // a filters property is added to the GridPanel
 *     grid.filters
 */
Ext.define('Ext.ux.grid.FiltersFeature', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.filters',
    uses: [
        'Ext.ux.grid.menu.ListMenu',
        'Ext.ux.grid.menu.RangeMenu',
        'Ext.ux.grid.filter.BooleanFilter',
        'Ext.ux.grid.filter.DateFilter',
        'Ext.ux.grid.filter.ListFilter',
        'Ext.ux.grid.filter.NumericFilter',
        'Ext.ux.grid.filter.StringFilter'
    ],

    /**
     * @cfg {Boolean} autoReload
     * Defaults to true, reloading the datasource when a filter change happens.
     * Set this to false to prevent the datastore from being reloaded if there
     * are changes to the filters.  See <code>{@link #updateBuffer}</code>.
     */
    autoReload: true,
    /**
     * @cfg {Boolean} encode
     * Specify true for {@link #buildQuery} to use Ext.util.JSON.encode to
     * encode the filter query parameter sent with a remote request.
     * Defaults to false.
     */
    /**
     * @cfg {Array} filters
     * An Array of filters config objects. Refer to each filter type class for
     * configuration details specific to each filter type. Filters for Strings,
     * Numeric Ranges, Date Ranges, Lists, and Boolean are the standard filters
     * available.
     */
    /**
     * @cfg {String} filterCls
     * The css class to be applied to column headers with active filters.
     * Defaults to <tt>'ux-filterd-column'</tt>.
     */
    filterCls: 'x-column-header-filtered',
    /**
     * @cfg {Boolean} local
     * <tt>true</tt> to use Ext.data.Store filter functions (local filtering)
     * instead of the default (<tt>false</tt>) server side filtering.
     */
    local: false,
    /**
     * @cfg {String} menuFilterText
     * defaults to <tt>'Filters'</tt>.
     */
    menuFilterText: 'Filtrele',
    /**
     * @cfg {String} paramPrefix
     * The url parameter prefix for the filters.
     * Defaults to <tt>'filter'</tt>.
     */
    paramPrefix: '@search',
    /**
     * @cfg {Boolean} showMenu
     * Defaults to true, including a filter submenu in the default header menu.
     */
    showMenu: true,
    /**
     * @cfg {String} stateId
     * Name of the value to be used to store state information.
     */
    stateId: undefined,
    /**
     * @cfg {Number} updateBuffer
     * Number of milliseconds to defer store updates since the last filter change.
     */
    updateBuffer: 500,

    // doesn't handle grid body events
    hasFeatureEvent: false,


    /** @private */
    constructor: function (config) {
        var me = this;

        config = config || {};
        Ext.apply(me, config);

        me.deferredUpdate = Ext.create('Ext.util.DelayedTask', me.reload, me);

        // Init filters
        me.filters = me.createFiltersCollection();
        me.filterConfigs = config.filters;
    },

    attachEvents: function () {
        var me = this,
            view = me.view,
            headerCt = view.headerCt,
            grid = me.getGridPanel();

        me.bindStore(view.getStore(), true);

        // Listen for header menu being created
        headerCt.on('menucreate', me.onMenuCreate, me);

        view.on('refresh', me.onRefresh, me);
        grid.on({
            scope: me,
            beforestaterestore: me.applyState,
            beforestatesave: me.saveState,
            beforedestroy: me.destroy
        });

        // Add event and filters shortcut on grid panel
        grid.filters = me;
        grid.addEvents('filterupdate');
    },

    createFiltersCollection: function () {
        return Ext.create('Ext.util.MixedCollection', false, function (o) {
            return o ? o.dataIndex : null;
        });
    },

    /**
     * @private Create the Filter objects for the current configuration, destroying any existing ones first.
     */
    createFilters: function () {
        var me = this,
            hadFilters = me.filters.getCount(),
            grid = me.getGridPanel(),
            filters = me.createFiltersCollection(),
            model = grid.store.model,
            fields = model.prototype.fields,
            field,
            filter,
            state;

        if (hadFilters) {
            state = {};
            me.saveState(null, state);
        }

        function add(dataIndex, config, filterable) {
            if (dataIndex && (filterable || config)) {
                field = fields.get(dataIndex);
                filter = {
                    dataIndex: dataIndex,
                    type: (field && field.type && field.type.type) || 'auto'
                };

                if (Ext.isObject(config)) {
                    Ext.apply(filter, config);
                }

                filters.replace(filter);
            }
        }

        // We start with filters from our config
        Ext.Array.each(me.filterConfigs, function (filterConfig) {
            add(filterConfig.dataIndex, filterConfig);
        });

        // Then we merge on filters from the columns in the grid. The columns' filters take precedence.
        Ext.Array.each(grid.columns, function (column) {
            if (column.filterable === false) {
                filters.removeAtKey(column.dataIndex);
            } else {
                add(column.dataIndex, column.filter, column.filterable);
            }
        });


        me.removeAll();
        if (filters.items) {
            me.initializeFilters(filters.items);
        }

        if (hadFilters) {
            me.applyState(null, state);
        }
    },

    /**
     * @private
     */
    initializeFilters: function (filters) {
        var me = this,
            filtersLength = filters.length,
            i, filter, FilterClass;

        for (i = 0; i < filtersLength; i++) {
            filter = filters[i];
            if (filter) {
                FilterClass = me.getFilterClass(filter.type);
                filter = filter.menu ? filter : new FilterClass(filter);
                me.filters.add(filter);
                Ext.util.Observable.capture(filter, this.onStateChange, this);
            }
        }
    },

    /**
     * @private Handle creation of the grid's header menu. Initializes the filters and listens
     * for the menu being shown.
     */
    onMenuCreate: function (headerCt, menu) {
        var me = this;
        me.createFilters();
        menu.on('beforeshow', me.onMenuBeforeShow, me);
    },

    /**
     * @private Handle showing of the grid's header menu. Sets up the filter item and menu
     * appropriate for the target column.
     */
    onMenuBeforeShow: function (menu) {
        var me = this,
            menuItem, filter;

        if (me.showMenu) {
            menuItem = me.menuItem;
            if (!menuItem || menuItem.isDestroyed) {
                me.createMenuItem(menu);
                menuItem = me.menuItem;
            }

            filter = me.getMenuFilter();

            if (filter) {
                menuItem.setMenu(filter.menu, false);
                menuItem.setChecked(filter.active);
                // disable the menu if filter.disabled explicitly set to true
                menuItem.setDisabled(filter.disabled === true);
            }
            menuItem.setVisible(!!filter);
            this.sep.setVisible(!!filter);
        }
    },


    createMenuItem: function (menu) {
        var me = this;
        me.sep = menu.add('-');
        me.menuItem = menu.add({
            checked: false,
            itemId: 'filters',
            text: me.menuFilterText,
            listeners: {
                scope: me,
                checkchange: me.onCheckChange,
                beforecheckchange: me.onBeforeCheck
            }
        });
    },

    getGridPanel: function () {
        return this.view.up('gridpanel');
    },

    /**
     * @private
     * Handler for the grid's beforestaterestore event (fires before the state of the
     * grid is restored).
     * @param {Object} grid The grid object
     * @param {Object} state The hash of state values returned from the StateProvider.
     */
    applyState: function (grid, state) {
        var me = this,
            key, filter;
        me.applyingState = true;
        me.clearFilters();
        if (state.filters) {
            for (key in state.filters) {
                if (state.filters.hasOwnProperty(key)) {
                    filter = me.filters.get(key);
                    if (filter) {
                        filter.setValue(state.filters[key]);
                        filter.setActive(true);
                    }
                }
            }
        }
        me.deferredUpdate.cancel();
        if (me.local) {
            me.reload();
        }
        delete me.applyingState;
        delete state.filters;
    },

    /**
     * Saves the state of all active filters
     * @param {Object} grid
     * @param {Object} state
     * @return {Boolean}
     */
    saveState: function (grid, state) {
        var filters = {};
        this.filters.each(function (filter) {
            if (filter.active) {
                filters[filter.dataIndex] = filter.getValue();
            }
        });
        return (state.filters = filters);
    },

    /**
     * @private
     * Handler called by the grid 'beforedestroy' event
     */
    destroy: function () {
        var me = this;
        Ext.destroyMembers(me, 'menuItem', 'sep');
        me.removeAll();
        me.clearListeners();
    },

    /**
     * Remove all filters, permanently destroying them.
     */
    removeAll: function () {
        if (this.filters) {
            Ext.destroy.apply(Ext, this.filters.items);
            // remove all items from the collection
            this.filters.clear();
        }
    },


    /**
     * Changes the data store bound to this view and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this view
     */
    bindStore: function (store) {
        var me = this;

        // Unbind from the old Store
        if (me.store && me.storeListeners) {
            me.store.un(me.storeListeners);
        }

        // Set up correct listeners
        if (store) {
            me.storeListeners = {
                scope: me
            };
            if (me.local) {
                me.storeListeners.load = me.onLoad;
            } else {
                me.storeListeners['before' + (store.buffered ? 'prefetch' : 'load')] = me.onBeforeLoad;
            }
            store.on(me.storeListeners);
        } else {
            delete me.storeListeners;
        }
        me.store = store;
    },

    /**
     * @private
     * Get the filter menu from the filters MixedCollection based on the clicked header
     */
    getMenuFilter: function () {
        var header = this.view.headerCt.getMenu().activeHeader;
        return header ? this.filters.get(header.dataIndex) : null;
    },

    /** @private */
    onCheckChange: function (item, value) {
        this.getMenuFilter().setActive(value);
    },

    /** @private */
    onBeforeCheck: function (check, value) {
        return !value || this.getMenuFilter().isActivatable();
    },

    /**
     * @private
     * Handler for all events on filters.
     * @param {String} event Event name
     * @param {Object} filter Standard signature of the event before the event is fired
     */
    onStateChange: function (event, filter) {
        if (event !== 'serialize') {
            var me = this,
                grid = me.getGridPanel();

            if (filter == me.getMenuFilter()) {
                me.menuItem.setChecked(filter.active, false);
            }

            if ((me.autoReload || me.local) && !me.applyingState) {
                me.deferredUpdate.delay(me.updateBuffer);
            }
            me.updateColumnHeadings();

            if (!me.applyingState) {
                grid.saveState();
            }
            grid.fireEvent('filterupdate', me, filter);
        }
    },

    /**
     * @private
     * Handler for store's beforeload event when configured for remote filtering
     * @param {Object} store
     * @param {Object} options
     */
    onBeforeLoad: function (store, options) {
        options.params = options.params || {};
        this.cleanParams(options.params);
        var params = this.buildQuery(this.getFilterData());
        Ext.apply(options.params, params);
    },

    /**
     * @private
     * Handler for store's load event when configured for local filtering
     * @param {Object} store
     */
    onLoad: function (store) {
        store.filterBy(this.getRecordFilter());
    },

    /**
     * @private
     * Handler called when the grid's view is refreshed
     */
    onRefresh: function () {
        this.updateColumnHeadings();
    },

    /**
     * Update the styles for the header row based on the active filters
     */
    updateColumnHeadings: function () {
        var me = this,
            headerCt = me.view.headerCt;
        if (headerCt) {
            headerCt.items.each(function (header) {
                var filter = me.getFilter(header.dataIndex);
                header[filter && filter.active ? 'addCls' : 'removeCls'](me.filterCls);
            });
        }
    },

    /** @private */
    reload: function () {
        var me = this,
            store = me.view.getStore();

        if (me.local) {
            store.clearFilter(true);
            store.filterBy(me.getRecordFilter());
            store.sort();
        } else {
            me.deferredUpdate.cancel();
            if (store.buffered) {
                store.pageMap.clear();
            }
            store.loadPage(1);
        }
    },

    /**
     * Method factory that generates a record validator for the filters active at the time
     * of invokation.
     * @private
     */
    getRecordFilter: function () {
        var f = [],
            len, i;
        this.filters.each(function (filter) {
            if (filter.active) {
                f.push(filter);
            }
        });

        len = f.length;
        return function (record) {
            for (i = 0; i < len; i++) {
                if (!f[i].validateRecord(record)) {
                    return false;
                }
            }
            return true;
        };
    },

    /**
     * Adds a filter to the collection and observes it for state change.
     * @param {Object/Ext.ux.grid.filter.Filter} config A filter configuration or a filter object.
     * @return {Ext.ux.grid.filter.Filter} The existing or newly created filter object.
     */
    addFilter: function (config) {
        var me = this,
            columns = me.getGridPanel().columns,
            i, columnsLength, column, filtersLength, filter;


        for (i = 0, columnsLength = columns.length; i < columnsLength; i++) {
            column = columns[i];
            if (column.dataIndex === config.dataIndex) {
                column.filter = config;
            }
        }

        if (me.view.headerCt.menu) {
            me.createFilters();
        } else {
            // Call getMenu() to ensure the menu is created, and so, also are the filters. We cannot call
            // createFilters() withouth having a menu because it will cause in a recursion to applyState()
            // that ends up to clear all the filter values. This is likely to happen when we reorder a column
            // and then add a new filter before the menu is recreated.
            me.view.headerCt.getMenu();
        }

        for (i = 0, filtersLength = me.filters.items.length; i < filtersLength; i++) {
            filter = me.filters.items[i];
            if (filter.dataIndex === config.dataIndex) {
                return filter;
            }
        }
    },

    /**
     * Adds filters to the collection.
     * @param {Array} filters An Array of filter configuration objects.
     */
    addFilters: function (filters) {
        if (filters) {
            var me = this,
                i, filtersLength;
            for (i = 0, filtersLength = filters.length; i < filtersLength; i++) {
                me.addFilter(filters[i]);
            }
        }
    },

    /**
     * Returns a filter for the given dataIndex, if one exists.
     * @param {String} dataIndex The dataIndex of the desired filter object.
     * @return {Ext.ux.grid.filter.Filter}
     */
    getFilter: function (dataIndex) {
        return this.filters.get(dataIndex);
    },

    /**
     * Turns all filters off. This does not clear the configuration information
     * (see {@link #removeAll}).
     */
    clearFilters: function () {
        this.filters.each(function (filter) {
            filter.setActive(false);
        });
    },

    /**
     * Returns an Array of the currently active filters.
     * @return {Array} filters Array of the currently active filters.
     */
    getFilterData: function () {
        var filters = [],
            i, len;

        this.filters.each(function (f) {
            if (f.active) {
                var d = [].concat(f.serialize());
                for (i = 0, len = d.length; i < len; i++) {
                    filters.push({
                        field: f.dataIndex,
                        data: d[i]
                    });
                }
            }
        });
        return filters;
    },

    /**
     * Function to take the active filters data and build it into a query.
     * The format of the query depends on the {@link #encode} configuration:
     *
     *   - `false` (Default) :
     *     Flatten into query string of the form (assuming <code>{@link #paramPrefix}='filters'</code>:
     *
     *         filters[0][field]="someDataIndex"&
     *         filters[0][data][comparison]="someValue1"&
     *         filters[0][data][type]="someValue2"&
     *         filters[0][data][value]="someValue3"&
     *
     *
     *   - `true` :
     *     JSON encode the filter data
     *
     *         {filters:[{"field":"someDataIndex","comparison":"someValue1","type":"someValue2","value":"someValue3"}]}
     *
     * Override this method to customize the format of the filter query for remote requests.
     *
     * @param {Array} filters A collection of objects representing active filters and their configuration.
     * Each element will take the form of {field: dataIndex, data: filterConf}. dataIndex is not assured
     * to be unique as any one filter may be a composite of more basic filters for the same dataIndex.
     *
     * @return {Object} Query keys and values
     */
    buildQuery: function (filters) {
        var p = {},
            i, f, root, dataPrefix, key, tmp,
            len = filters.length;

        if (!this.encode) {
            for (i = 0; i < len; i++) {
                f = filters[i];
                root = [this.paramPrefix, '[', i, ']'].join('');
                p[root + '[field]'] = f.field;

                dataPrefix = root + '[data]';
                for (key in f.data) {
                    p[[dataPrefix, '[', key, ']'].join('')] = f.data[key];
                }
            }
        } else {
            tmp = '';
            for (i = 0; i < len; i++) {
                f = filters[i];
                if (tmp != '') {
                    tmp += ';';
                }
                if (f.data.comparison) {
                    if (f.data.comparison == "gt") {
                        tmp += f.field + '=' + '>' + f.data.value;
                    } else if (f.data.comparison == "lt") {
                        tmp += f.field + '=' + '<' + f.data.value;
                    } else {
                        tmp += f.field + '=' + f.data.value;
                    }
                } else if (Ext.isArray(f.data.value)) {
                    tmp += f.field + '=' + f.data.value.join('|');
                } else {
                    tmp += f.field + '=' + f.data.value;
                }
            }

            // only build if there is active filter
            if (tmp.length > 0) {
                p[this.paramPrefix] = tmp;
            }

        }
        return p;
    },

    /**
     * Removes filter related query parameters from the provided object.
     * @param {Object} p Query parameters that may contain filter related fields.
     */
    cleanParams: function (p) {
        // if encoding just delete the property
        if (this.encode) {
            delete p[this.paramPrefix];
            // otherwise scrub the object of filter data
        } else {
            var regex, key;
            regex = new RegExp('^' + this.paramPrefix + '\[[0-9]+\]');
            for (key in p) {
                if (regex.test(key)) {
                    delete p[key];
                }
            }
        }
    },

    /**
     * Function for locating filter classes, overwrite this with your favorite
     * loader to provide dynamic filter loading.
     * @param {String} type The type of filter to load ('Filter' is automatically
     * appended to the passed type; eg, 'string' becomes 'StringFilter').
     * @return {Function} The Ext.ux.grid.filter.Class
     */
    getFilterClass: function (type) {
        // map the supported Ext.data.Field type values into a supported filter
        switch (type) {
            case 'auto':
                type = 'string';
                break;
            case 'int':
            case 'float':
                type = 'numeric';
                break;
            case 'bool':
                type = 'boolean';
                break;
        }
        return Ext.ClassManager.getByAlias('gridfilter.' + type);
    }
});


/**
 * @author Ed Spencer
 */
Ext.define('Ext.ux.DataView.DragSelector', {
    requires: ['Ext.dd.DragTracker', 'Ext.util.Region'],

    /**
     * Initializes the plugin by setting up the drag tracker
     */
    init: function (dataview) {
        /**
         * @property dataview
         * @type Ext.view.View
         * The DataView bound to this instance
         */
        this.dataview = dataview;
        dataview.mon(dataview, {
            beforecontainerclick: this.cancelClick,
            scope: this,
            render: {
                fn: this.onRender,
                scope: this,
                single: true
            }
        });
    },

    /**
     * @private
     * Called when the attached DataView is rendered. This sets up the DragTracker instance that will be used
     * to created a dragged selection area
     */
    onRender: function () {
        /**
         * @property tracker
         * @type Ext.dd.DragTracker
         * The DragTracker attached to this instance. Note that the 4 on* functions are called in the scope of the
         * DragTracker ('this' refers to the DragTracker inside those functions), so we pass a reference to the
         * DragSelector so that we can call this class's functions.
         */
        this.tracker = Ext.create('Ext.dd.DragTracker', {
            dataview: this.dataview,
            el: this.dataview.el,
            dragSelector: this,
            onBeforeStart: this.onBeforeStart,
            onStart: this.onStart,
            onDrag: this.onDrag,
            onEnd: this.onEnd
        });

        /**
         * @property dragRegion
         * @type Ext.util.Region
         * Represents the region currently dragged out by the user. This is used to figure out which dataview nodes are
         * in the selected area and to set the size of the Proxy element used to highlight the current drag area
         */
        this.dragRegion = Ext.create('Ext.util.Region');
    },

    /**
     * @private
     * Listener attached to the DragTracker's onBeforeStart event. Returns false if the drag didn't start within the
     * DataView's el
     */
    onBeforeStart: function (e) {
        return e.target == this.dataview.getEl().dom;
    },

    /**
     * @private
     * Listener attached to the DragTracker's onStart event. Cancel's the DataView's containerclick event from firing
     * and sets the start co-ordinates of the Proxy element. Clears any existing DataView selection
     * @param {Ext.EventObject} e The click event
     */
    onStart: function (e) {
        var dragSelector = this.dragSelector,
            dataview = this.dataview;

        // Flag which controls whether the cancelClick method vetoes the processing of the DataView's containerclick event.
        // On IE (where else), this needs to remain set for a millisecond after mouseup because even though the mouse has
        // moved, the mouseup will still trigger a click event.
        this.dragging = true;

        //here we reset and show the selection proxy element and cache the regions each item in the dataview take up
        dragSelector.fillRegions();
        dragSelector.getProxy().show();
        dataview.getSelectionModel().deselectAll();
    },

    /**
     * @private
     * Reusable handler that's used to cancel the container click event when dragging on the dataview. See onStart for
     * details
     */
    cancelClick: function () {
        return !this.tracker.dragging;
    },

    /**
     * @private
     * Listener attached to the DragTracker's onDrag event. Figures out how large the drag selection area should be and
     * updates the proxy element's size to match. Then iterates over all of the rendered items and marks them selected
     * if the drag region touches them
     * @param {Ext.EventObject} e The drag event
     */
    onDrag: function (e) {
        var dragSelector = this.dragSelector,
            selModel = dragSelector.dataview.getSelectionModel(),
            dragRegion = dragSelector.dragRegion,
            bodyRegion = dragSelector.bodyRegion,
            proxy = dragSelector.getProxy(),
            regions = dragSelector.regions,
            length = regions.length,

            startXY = this.startXY,
            currentXY = this.getXY(),
            minX = Math.min(startXY[0], currentXY[0]),
            minY = Math.min(startXY[1], currentXY[1]),
            width = Math.abs(startXY[0] - currentXY[0]),
            height = Math.abs(startXY[1] - currentXY[1]),
            region, selected, i;

        Ext.apply(dragRegion, {
            top: minY,
            left: minX,
            right: minX + width,
            bottom: minY + height
        });

        dragRegion.constrainTo(bodyRegion);
        proxy.setRegion(dragRegion);

        for (i = 0; i < length; i++) {
            region = regions[i];
            selected = dragRegion.intersect(region);

            if (selected) {
                selModel.select(i, true);
            } else {
                selModel.deselect(i);
            }
        }
    },

    /**
     * @private
     * Listener attached to the DragTracker's onEnd event. This is a delayed function which executes 1
     * millisecond after it has been called. This is because the dragging flag must remain active to cancel
     * the containerclick event which the mouseup event will trigger.
     * @param {Ext.EventObject} e The event object
     */
    onEnd: Ext.Function.createDelayed(function (e) {
        var dataview = this.dataview,
            selModel = dataview.getSelectionModel(),
            dragSelector = this.dragSelector;

        this.dragging = false;
        dragSelector.getProxy().hide();
    }, 1),

    /**
     * @private
     * Creates a Proxy element that will be used to highlight the drag selection region
     * @return {Ext.Element} The Proxy element
     */
    getProxy: function () {
        if (!this.proxy) {
            this.proxy = this.dataview.getEl().createChild({
                tag: 'div',
                cls: 'x-view-selector'
            });
        }
        return this.proxy;
    },

    /**
     * @private
     * Gets the region taken up by each rendered node in the DataView. We use these regions to figure out which nodes
     * to select based on the selector region the user has dragged out
     */
    fillRegions: function () {
        var dataview = this.dataview,
            regions = this.regions = [];

        dataview.all.each(function (node) {
            regions.push(node.getRegion());
        });
        this.bodyRegion = dataview.getEl().getRegion();
    }
});


/**
 * @author Ed Spencer
 *
 <pre><code>
 Ext.create('Ext.view.View', {
 mixins: {
 draggable: 'Ext.ux.DataView.Draggable'
 },

 initComponent: function() {
 this.mixins.draggable.init(this, {
 ddConfig: {
 ddGroup: 'someGroup'
 }
 });

 this.callParent(arguments);
 }
 });
 </code></pre>
 *
 */
Ext.define('Ext.ux.DataView.Draggable', {
    requires: 'Ext.dd.DragZone',

    /**
     * @cfg {String} ghostCls The CSS class added to the outermost element of the created ghost proxy
     * (defaults to 'x-dataview-draggable-ghost')
     */
    ghostCls: 'x-dataview-draggable-ghost',

    /**
     * @cfg {Ext.XTemplate/Array} ghostTpl The template used in the ghost DataView
     */
    ghostTpl: [
        '<tpl for=".">',
        '{title}',
        '</tpl>'
    ],

    /**
     * @cfg {Object} ddConfig Config object that is applied to the internally created DragZone
     */

    /**
     * @cfg {String} ghostConfig Config object that is used to configure the internally created DataView
     */

    init: function (dataview, config) {
        /**
         * @property dataview
         * @type Ext.view.View
         * The Ext.view.View instance that this DragZone is attached to
         */
        this.dataview = dataview;

        dataview.on('render', this.onRender, this);

        Ext.apply(this, {
            itemSelector: dataview.itemSelector,
            ghostConfig: {}
        }, config || {});

        Ext.applyIf(this.ghostConfig, {
            itemSelector: 'img',
            cls: this.ghostCls,
            tpl: this.ghostTpl
        });
    },

    /**
     * @private
     * Called when the attached DataView is rendered. Sets up the internal DragZone
     */
    onRender: function () {
        var config = Ext.apply({}, this.ddConfig || {}, {
            dvDraggable: this,
            dataview: this.dataview,
            getDragData: this.getDragData,
            getTreeNode: this.getTreeNode,
            afterRepair: this.afterRepair,
            getRepairXY: this.getRepairXY
        });

        /**
         * @property dragZone
         * @type Ext.dd.DragZone
         * The attached DragZone instane
         */
        this.dragZone = Ext.create('Ext.dd.DragZone', this.dataview.getEl(), config);
        this.dragZone.setDragElPos = function (x, y) {
            var el = this.getDragEl();
            this.alignElWithMouse(el, x - 45, y - 45);
        };
    },

    getDragData: function (e) {
        var draggable = this.dvDraggable,
            dataview = this.dataview,
            selModel = dataview.getSelectionModel(),
            target = e.getTarget(draggable.itemSelector),
            selected, dragData;

        if (target) {
            if (!dataview.isSelected(target)) {
                selModel.select(dataview.getRecord(target));
            }

            selected = dataview.getSelectedNodes();
            dragData = {
                copy: true,
                nodes: selected,
                records: selModel.getSelection(),
                item: true
            };

            if (selected.length == 1) {
                dragData.single = true;
                dragData.ddel = Ext.getDom(selModel.selected.items[0].data.applicationModuleName + "-shortcut-img");
            } else {
                dragData.multi = true;
                dragData.ddel = draggable.prepareGhost(selModel.getSelection()).dom;
            }

            return dragData;
        }

        return false;
    },

    getTreeNode: function () {
        // console.log('test');
    },

    afterRepair: function () {
        this.dragging = false;

        var nodes = this.dragData.nodes,
            length = nodes.length,
            i;

        //FIXME: Ext.fly does not work here for some reason, only frames the last node
        for (i = 0; i < length; i++) {
            Ext.get(nodes[i]).frame('#8db2e3', 1);
        }
    },

    /**
     * @private
     * Returns the x and y co-ordinates that the dragged item should be animated back to if it was dropped on an
     * invalid drop target. If we're dragging more than one item we don't animate back and just allow afterRepair
     * to frame each dropped item.
     */
    getRepairXY: function (e) {
        if (this.dragData.multi) {
            return false;
        } else {
            var repairEl = Ext.get(this.dragData.ddel),
                repairXY = repairEl.getXY();

            //take the item's margins and padding into account to make the repair animation line up perfectly
            repairXY[0] += repairEl.getPadding('t') + repairEl.getMargin('t');
            repairXY[1] += repairEl.getPadding('l') + repairEl.getMargin('l');

            return repairXY;
        }
    },

    /**
     * Updates the internal ghost DataView by ensuring it is rendered and contains the correct records
     * @param {Array} records The set of records that is currently selected in the parent DataView
     * @return {Ext.view.View} The Ghost DataView
     */
    prepareGhost: function (records) {
        var ghost = this.createGhost(records),
            store = ghost.store;

        store.removeAll();
        store.add(records);

        return ghost.getEl();
    },

    /**
     * @private
     * Creates the 'ghost' DataView that follows the mouse cursor during the drag operation. This div is usually a
     * lighter-weight representation of just the nodes that are selected in the parent DataView.
     */
    createGhost: function (records) {
        if (!this.ghost) {

            var ghostConfig = Ext.apply({}, this.ghostConfig, {
                store: Ext.create('Ext.data.Store', {
                    model: records[0].modelName
                })
            });

            this.ghost = Ext.create('Ext.view.View', ghostConfig);

            this.ghost.render(document.createElement('div'));
        }

        return this.ghost;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.data.store.GTTreeStore', {
    extend: 'Ext.data.TreeStore',
    constructor: function (c) {
        var me = this;

        me.addEvents({
            'aftermanipulated': true
        });

        if (c.service != null) {
            Ext.applyIf(c, {
                proxy: {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        type: 'json',
                        root: 'rows'
                    },
                    relatedTree: me
                }
            });
        }

        if (c.channel != null) {
            c.subscriptionId = UGRJS.Desktop.subscribe({
                name: c.channel,
                callBack: me.processMessage,
                scope: me
            });
        }

        this.callParent(arguments);
    },

    processMessage: function (msg) {
        var me = this;

        if (Ext.isArray(msg.manipulations)) {
            for (var k = 0; k < msg.manipulations.length; k++) {
                me.processManipulation(msg.manipulations[k]);
            }
        } else {
            me.processManipulation(msg);
        }
        // alert('store needs to be update');
    },

    processManipulation: function (msg) {
        var me = this;

        var postedToMe = false;
        if (msg.targetView != null) {
            if (me.proxy.relatedTree != null) {
                if (msg.targetView == me.proxy.relatedTree.id) {
                    postedToMe = true;
                }
            }
        }

        if (postedToMe) {
            if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_INSERT) {
                var recordData = UGRJS.Desktop.getRecordData(msg.record);

                var node;
                if (recordData.parent == NULL_HEX) {
                    node = me.getRootNode();
                } else {
                    node = me.getNodeById(recordData.parent);
                }

                if (node != null) {
                    node.appendChild(recordData);
                }
            } else if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_UPDATE) {
                var recordData = UGRJS.Desktop.getRecordData(msg.record);

                node = me.getNodeById(recordData.id);

                if (node != null) {
                    node.set('text', recordData.text);
                }
            } else if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_DELETE) {
                var recordData = UGRJS.Desktop.getRecordData(msg.record);

                node = me.getNodeById(recordData.id);

                if (node != null) {
                    node.parentNode.removeChild(node);
                }
            }
        }
    },

    onDestroy: function () {
        var me = this;

        UGRJS.Desktop.unsubscribe(me.subscriptionId);
    },

    reload: function (options) {
        var me = this;
        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = true;
        }

        me.callParent(arguments);

        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = false;
        }
    },

    loadPage: function (options) {
        var me = this;
        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = true;
        }

        me.callParent(arguments);

        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = false;
        }
    }

});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.data.store.GTStore', {
    extend: 'Ext.data.Store',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'aftermanipulated': true
        });

        if (c.service != null) {
            Ext.applyIf(c, {
                pageSize: 30,
                remoteSort: true,
                proxy: {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        totalProperty: 'totalRows',
                        type: 'json',
                        root: 'rows'
                    },
                    relatedStore: me
                },
                autoLoad: true
            });
        }

        if (c.model == 'UGRFrontend.data.model.Dynamic') {
            me.dynamicModel = true;
        }

        if (c.channel != null) {
            c.subscriptionId = UGRJS.Desktop.subscribe({
                name: c.channel,
                callBack: me.processMessage,
                scope: me
            });
        }

        this.callParent(arguments);
    },

    processMessage: function (msg) {
        var me = this;

        if (Ext.isArray(msg.manipulations)) {
            for (var k = 0; k < msg.manipulations.length; k++) {
                me.processManipulation(msg.manipulations[k]);
            }
        } else {
            me.processManipulation(msg);
        }
        // alert('store needs to be update');
    },

    processManipulation: function (msg) {
        var me = this;

        me.proxy.initiateStore(me, [msg.row], true);

        var postedToMe = false;
        if (msg.targetView != null) {
            if (me.relatedGrid != null) {
                if (msg.targetView == me.relatedGrid.id) {
                    postedToMe = true;
                }
            } else if (me.relatedChart != null) {
                if (msg.targetView == me.relatedChart.id) {
                    postedToMe = true;
                }
            }
        }

        if (postedToMe) {
            if (msg.type == 'INSERT') {
                var data = UGRJS.Desktop.getRowData([msg.row]);
                if (me.findExact(me.idField, data[0][me.idField]) < 0) {
                    data[0]['_status'] = 'INSERTED'
                    data[0]['_owner'] = msg.owner;
                    me.add(data[0]);
                }
            } else if (msg.type == 'UPDATE') {
                var index = me.findExact(me.idField, msg.pk);
                var data = UGRJS.Desktop.getRowData([msg.row])[0];
                if (index > -1) {
                    var record = me.getAt(index);
                    for (var name in data) {
                        var orgName = record.get(name);
                        if (orgName != data[name]) {
                            record.set(name, data[name]);
                            record.set('_status', 'CHANGED');
                            record.set('_owner', msg.owner);
                            if (me.relatedGrid != null) {
                                // Buraya griddeki değişiklikler yazılacak
                            }
                        }
                    }

                    me.fireEvent('aftermanipulated', data);
                }
            } else if (msg.type == 'DELETE') {
                var index = me.findExact(me.idField, msg.pk);
                if (index > -1) {
                    var record = me.getAt(index);
                    record.set('_status', 'DELETED');
                    record.set('_owner', msg.owner);
                    Ext.defer(
                        function () {
                            me.removeAt(me.findExact(me.idField, msg.pk));
                        }, 20000
                    );
                }
            }
        }
    },

    onDestroy: function () {
        var me = this;

        UGRJS.Desktop.unsubscribe(me.subscriptionId);
    },

    reload: function (options) {
        var me = this;
        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = true;
        }

        me.callParent(arguments);

        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = false;
        }
    },

    loadPage: function (options) {
        var me = this;
        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = true;
        }

        me.callParent(arguments);

        if (me.relatedGrid != null) {
            me.relatedGrid.isReloading = false;
        }
    }

});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mpanel',

    constructor: function (c) {
        var me = this;

        me.expandedPanel = c.expandedPanel;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);

    },

    initComponent: function () {

        var me = this;

        if (me.iconFolder && me.iconFolder.length > 0) {
            me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;
        }

        me.callParent(arguments);

        me.on('afterrender', me.afterRendered, me);
        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('resize', me.onCmpResize, me);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);

        if (this.initialConfig.background != null) {
            this.body.setStyle('background', this.initialConfig.background);
        }
    },

    afterRendered: function (pnl) {
        var me = this;
        if (me.expandedPanel != null) {
            me.items.items[me.expandedPanel].expand();
        }
    },

    setBackground: function (bg) {
        var me = this;
        me.body.setStyle('background', bg);
    },

    onCmpResize: function (pnl, width, height) {
        var me = this;

        if (width) {
            UGRJS.Desktop.setComponent(me, 'width', width, true);
        }

        if (height) {
            Ext.defer(function () {
                UGRJS.Desktop.setComponent(me, 'height', height, true);
            }, 200);
        }
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    },

    printFrame: function (frameId) {
        var frame = document.getElementById(frameId)
        frame.focus();
        frame.contentWindow.print();
    },

    removeSubComponent: function (cmpId) {
        var me = this;
        me.remove(cmpId, true);
    },

    setHidden: function (hidden) {
        var me = this;
        me.setVisible(!hidden);
    },

    setHtml: function (html) {
        var me = this;
        me.update(html);
        me.removeAll();
    },

    removeAllComponent: function (html) {
        var me = this;
        me.removeAll();
    }
});

Ext.define('UGRFrontend.desktop.GTCall', {
    extend: 'UGRFrontend.desktop.GTPanel',
    alias: 'widget.mcall',

    constructor: function (c) {
        var me = this;

        c.title = "Conference Call";
        c.layout = 'border';
        c.items = [{
            xtype: 'panel',
            split: true,
            id: c.id + '-c1',
            title: 'Your Camera',
            region: 'center'
        },
            {
                xtype: 'panel',
                split: true,
                id: c.id + '-c2',
                title: "Not in a Call",
                region: 'east',
                width: 400
            }
        ];

        this.callParent(arguments);

    },

    afterRendered: function (cmp) {
        var me = this;

        Ext.getCmp(me.getId() + '-c1').update('<video id="' + me.getId() + '-selfVideo" style="width:100%; height: auto">Browser video desteklemiyor</video>');
        Ext.getCmp(me.getId() + '-c2').update('<video id="' + me.getId() + '-targetVideo" style="width:100%; height: auto;"> Browser video desteklemiyor</video>');

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        me.peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection ||
            window.webkitRTCPeerConnection || window.msRTCPeerConnection;

        me.sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
            window.webkitRTCSessionDescription || window.msRTCSessionDescription;

        me.iceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate ||
            window.webkitRTCIceCandidate || window.msRTCIceCandidate;

        me.pConnection = new me.peerConnection({
            "iceServers": [{
                "url": "stun:stun.services.mozilla.com"
            }]
        });
        me.pConnection.scope = me;

        me.pError = function (err) {
            alert(err);
        };

        me.pConnection.onaddstream = function (evt) {
            document.querySelector('#' + me.getId() + '-targetVideo').src = window.URL.createObjectURL(evt.stream);
        };

        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    audio: true,
                    video: {
                        width: 640,
                        height: 480
                    }
                },
                function (stream) {
                    var video = document.querySelector('#' + me.getId() + '-selfVideo');
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();
                    };

                    me.pConnection.addStream(stream);
                    me.pConnection.onicecandidate = me.onIceCandidate;
                    me.pConnection.onaddstream = me.onAddStream;
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        }

        if (me.initialConfig.channel != null) {
            me.setChannel(me.initialConfig.channel);
        }

    },


    onIceCandidate: function (ev) {
        var me = this;

        if (ev.candidate != null) {
            UGRJS.Desktop.pumpToChannel(me.scope.channel, me.scope.ownerUuid + me.scope.iceToken + ev.candidate.candidate);
            console.log(ev.candidate);
        }

    },

    onAddStream: function (ev) {
        var me = this;
        console.log('Adding new stream');

        if (ev != null) {
            var targetVideo = document.querySelector('#' + me.scope.getId() + '-targetVideo');
            targetVideo.src = window.URL.createObjectURL(ev.stream);
            targetVideo.play();
        }
    },

    setChannel: function (channel) {
        var me = this;

        me.channel = channel;

        UGRJS.Desktop.subscribe({
            name: me.channel,
            callBack: me.processMessage,
            scope: me
        });
    },

    isCalling: false,

    startCall: function (start) {
        var me = this;

        Ext.getCmp(me.getId() + '-c2').setTitle('Starting call...');

        me.pConnection.createOffer(function (offer) {
            me.pConnection.setLocalDescription(new me.sessionDescription(offer), function () {
                UGRJS.Desktop.pumpToChannel(me.channel, me.ownerUuid + me.callToken + offer.sdp);
                me.isCalling = true;
            }, me.pError);
        }, me.pError, {
            'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': true
            }
        });
    },

    answerToken: '--answer--',
    callToken: '--call--',
    iceToken: '--ice--',

    processMessage: function (message) {
        var me = this;

        if (message.customData.substring(0, me.ownerUuid.length) === me.ownerUuid) {

        } else {
            if (me.isCalling) {
                var answer = message.customData.substring(me.ownerUuid.length);
                if (answer.substring(0, me.answerToken.length) === me.answerToken) {
                    var sdp = answer.substring(me.answerToken.length);
                    console.log("Answer Received with SDP : " + sdp);

                    me.pConnection.setRemoteDescription(new me.sessionDescription({
                        type: 'answer',
                        sdp: sdp
                    }), function () {
                        Ext.getCmp(me.getId() + '-c2').setTitle('Connected. Showing remote camera.');
                    }, me.pError);
                }
            } else {
                var call = message.customData.substring(me.ownerUuid.length);
                if (call.substring(0, me.callToken.length) === me.callToken) {
                    var sdp = call.substring(me.callToken.length);
                    console.log("Call Received with SDP : " + sdp);

                    me.pConnection.setRemoteDescription(new me.sessionDescription({
                        type: 'offer',
                        sdp: sdp
                    }), function () {
                        me.pConnection.createAnswer(function (answer) {
                            me.pConnection.setLocalDescription(new me.sessionDescription(answer), function () {
                                Ext.getCmp(me.getId() + '-c2').setTitle('Connected.');
                                UGRJS.Desktop.pumpToChannel(me.channel, me.ownerUuid + me.answerToken + answer.sdp);
                            }, me.pError);
                        }, me.pError, {
                            'mandatory': {
                                'OfferToReceiveAudio': true,
                                'OfferToReceiveVideo': true
                            }
                        });
                    }, me.pError);
                }
            }

            var msg = message.customData.substring(me.ownerUuid.length);
            if (msg.substring(0, me.iceToken.length) === me.iceToken) {
                var ice = msg.substring(me.iceToken.length);
                console.log('Received Ice Candidate : ' + ice);
                me.pConnection.addIceCandidate(new me.iceCandidate({
                    candidate: ice
                }));
            }
        }
    },

    setOffer: function (sdp) {
        var me = this;

        me.pConnection.setRemoteDescription(new me.sessionDescription({
            type: 'offer',
            sdp: sdp
        }), function () {
            me.pConnection.createAnswer(function (answer) {
                me.pConnection.setLocalDescription(new me.sessionDescription(answer), function () {
                    UGRJS.Desktop.setComponent(me, 'answer', answer.sdp, true);
                    me.fireEvent('afteranswer', me);
                    alert('answer sdp: ' + answer.sdp);
                }, me.pError);
            }, me.pError, {
                'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true
                }
            });
        }, me.pError);
    },

    startCallOld: function (answer) {
        var me = this;

        alert('starting call');


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
Ext.define('UGRFrontend.data.model.Dynamic', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'temporary'
    }]
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.data.store.GTCalendarStore', {
    extend: 'Ext.data.Store',
    model: 'Extensible.calendar.data.EventModel',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'aftermanipulated': true
        });

        if (c.service != null) {
            Ext.applyIf(c, {
                proxy: {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        type: 'json',
                        root: 'rows'
                    },
                    relatedStore: me
                }
            });
        }

        if (c.channel != null) {
            c.subscriptionId = UGRJS.Desktop.subscribe({
                name: c.channel,
                callBack: me.processMessage,
                scope: me
            });
        }

        this.callParent(arguments);
    },

    processMessage: function (msg) {
        var me = this;

        if (Ext.isArray(msg.manipulations)) {
            for (var k = 0; k < msg.manipulations.length; k++) {
                me.processManipulation(msg.manipulations[k]);
            }
        } else {
            me.processManipulation(msg);
        }
        // alert('store needs to be update');
    },

    getModelData: function (row) {
        var me = this;

        var output = {};

        var fields = me.model.getFields();

        for (var k = 0; k < fields.length; k++) {
            var field = fields[k];
            output[field.name] = row[field.mapping];
        }

        return output;

    },

    processManipulation: function (msg) {
        var me = this;

        if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_INSERT) {
            var recordData = UGRJS.Desktop.getRowData([msg.row]);

            if (recordData != null) {

                me.setDateFormat(me.dateFormat);
                var pos = me.find('ID', recordData[0][me.idField]);
                if (pos == -1) {
                    me.add(me.getModelData(recordData[0]));
                }
            }

        } else if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_UPDATE) {
            var recordData = UGRJS.Desktop.getRowData([msg.row]);

            if (recordData != null) {

                me.setDateFormat(me.dateFormat);
                var pos = me.find('ID', recordData[0][me.idField]);
                if (pos > -1) {
                    var record = me.getAt(pos);
                    record.set('StartDt', recordData[0]['__event_start']);
                    record.set('StartDt', recordData[0]['__event_end']);
                    record.set('Title', recordData[0]['__event_title']);
                }
            }

        } else if (msg.type == UGRFrontend.desktop.Desktop.MANIPULATION_DELETE) {
            var recordData = UGRJS.Desktop.getRecordData(msg.record);

            var pos = me.find('ID', recordData[me.idField]);
            me.removeAt(pos);
        }
    },

    onDestroy: function () {
        var me = this;

        UGRJS.Desktop.unsubscribe(me.subscriptionId);
    },

    reload: function (options) {
        var me = this;
        me.callParent(arguments);

    },

    sync: function () {
        var me = this;
        // me.reload();
    },

    setDateFormat: function (format) {
        var me = this;
        me.dateFormat = format;

        Extensible.calendar.data.EventMappings = {
            // These are the same fields as defined in the standard EventRecord object but the
            // names and mappings have all been customized. Note that the name of each field
            // definition object (e.g., 'EventId') should NOT be changed for the default fields
            // as it is the key used to access the field data programmatically.
            EventId: {
                name: 'ID',
                mapping: '__event_id',
                type: 'string'
            }, // int by default
            CalendarId: {
                name: 'CalID',
                mapping: 'cal_id',
                type: 'string'
            }, // int by default
            Title: {
                name: 'EvtTitle',
                mapping: '__event_title'
            },
            StartDate: {
                name: 'StartDt',
                mapping: '__event_start',
                type: 'date',
                dateFormat: format
            },
            EndDate: {
                name: 'EndDt',
                mapping: '__event_end',
                type: 'date',
                dateFormat: format
            },
            RRule: {
                name: 'RecurRule',
                mapping: 'recur_rule'
            },
            Location: {
                name: 'Location',
                mapping: 'location'
            },
            Notes: {
                name: 'Desc',
                mapping: 'full_desc'
            },
            Url: {
                name: 'LinkUrl',
                mapping: 'link_url'
            },
            IsAllDay: {
                name: 'AllDay',
                mapping: '__event_allday',
                type: 'boolean'
            },
            Reminder: {
                name: 'Reminder',
                mapping: 'reminder'
            },

            // We can also add some new fields that do not exist in the standard EventRecord:
            CreatedBy: {
                name: 'CreatedBy',
                mapping: 'created_by'
            },
            IsPrivate: {
                name: 'Private',
                mapping: 'private',
                type: 'boolean'
            }
        };

        Extensible.calendar.data.EventModel.reconfigure();
    }

});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTTab', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.mtabpanel',

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);

    },

    initComponent: function () {

        var me = this;

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);

        me.on('tabchange', me.onCmpTabChange, me);
        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('resize', me.onCmpResize, me);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    onCmpTabChange: function (tab, newcard, oldcard, eops) {
        var me = this;

        var activeTabIndex = me.items.findIndex('id', newcard.id);
        UGRJS.Desktop.setComponent(me, 'activeTab', activeTabIndex + '', true);
    },

    changeActiveTab: function (args) {
        var me = this;
        me.un('tabchange', me.onCmpTabChange, me);

        me.setActiveTab(args);

        me.on('tabchange', me.onCmpTabChange, me);

    },

    setHidden: function (hidden) {
        var me = this;
        me.setVisible(!hidden);
    },

    onCmpResize: function (tab, width, height) {
        var me = this;

        if (width) {
            UGRJS.Desktop.setComponent(me, 'width', width, true);
        }

        if (height) {
            Ext.defer(function () {
                UGRJS.Desktop.setComponent(me, 'height', height, true);
            }, 200);
        }
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTFlow', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mflow',

    statics: {
        convertToPath: function (paths) {
            var mvc = [];
            if (Ext.isArray(paths)) {
                for (var k = 0; k < paths.length; k++) {
                    mvc.push(new google.maps.LatLng(paths[k].lat, paths[k].lon));
                }
            }

            return mvc;
        }
    },

    constructor: function (c) {
        var me = this;

        me.addEvents({
            // 'mapdblclick' : true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        if (me.ownerUuid != null) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                    value: (c.gListeners.hasTarget ? me.getId() : '')
                                }],
                                onSuccess: function (args) {
                                    var a = 5;
                                    // If there is an afterselect event registered
                                    // enable the grid after successfull load
                                    Ext.defer(function () {
                                        me.setLoading(false);
                                    }, 1000, me);
                                },
                                onFail: function (args) {
                                    // If there is an afterselect event registered
                                    // enable the grid after successfull load
                                    Ext.defer(function () {
                                        me.setLoading(false);
                                    }, 1000, me);
                                },
                                processResponse: true
                            });
                        }
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        // this is the paint style for the connecting lines..
        var approveConnectorPaintStyle = {
                lineWidth: 4,
                strokeStyle: "#61B7CF",
                joinstyle: "round",
                outlineColor: "white",
                outlineWidth: 2
            },
            rejectConnectorPaintStyle = {
                lineWidth: 4,
                strokeStyle: "#992222",
                joinstyle: "round",
                outlineColor: "white",
                outlineWidth: 2
            },
            // .. and this is the hover style. 
            connectorHoverStyle = {
                lineWidth: 4,
                strokeStyle: "#216477",
                outlineWidth: 2,
                outlineColor: "white"
            },
            endpointHoverStyle = {
                fillStyle: "#216477",
                strokeStyle: "#216477"
            };

        me.sourceApproveEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                strokeStyle: "#7AB02C",
                fillStyle: "transparent",
                radius: 7,
                lineWidth: 3
            },
            isSource: true,
            connector: ["Flowchart", {
                stub: [40, 60],
                gap: 10,
                cornerRadius: 5,
                alwaysRespectStubs: true
            }],
            connectorStyle: approveConnectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
            overlays: [
                ["Label", {
                    location: [0.5, 1.5],
                    label: "",
                    cssClass: "endpointSourceLabel"
                }]
            ]
        };

        me.sourceRejectEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                strokeStyle: "#993333",
                fillStyle: "transparent",
                radius: 7,
                lineWidth: 3
            },
            isSource: true,
            connector: ["Flowchart", {
                stub: [40, 60],
                gap: 10,
                cornerRadius: 5,
                alwaysRespectStubs: true
            }],
            connectorStyle: rejectConnectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
            overlays: [
                ["Label", {
                    location: [0.5, 1.5],
                    label: "",
                    cssClass: "endpointSourceLabel"
                }]
            ]
        };

        // the definition of target endpoints (will appear when the user drags a connection) 
        me.targetEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                fillStyle: "#7AB02C",
                radius: 11
            },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: {
                hoverClass: "hover",
                activeClass: "active"
            },
            isTarget: true,
            overlays: [
                ["Label", {
                    location: [0.5, -0.5],
                    label: "",
                    cssClass: "endpointTargetLabel"
                }]
            ]
        };

        me.addEndpoints = function (toId, itemType) {
            if (itemType == 'target') {
                var sourceUUID = toId;
                me.flowInstance.addEndpoint(toId, me.sourceApproveEndpoint, {
                    anchor: [1, 0.3, 1, 0],
                    uuid: sourceUUID + '_approve'
                });
                me.flowInstance.addEndpoint(toId, me.sourceRejectEndpoint, {
                    anchor: [1, 0.7, 1, 0],
                    uuid: sourceUUID + '_reject'
                });

                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            } else if (itemType == 'start') {
                var targetUUID = toId + '_leave';
                me.flowInstance.addEndpoint(toId, me.sourceApproveEndpoint, {
                    anchor: [1, 0.5, 1, 0],
                    uuid: targetUUID
                });
            } else if (itemType == 'end') {
                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            } else if (itemType == 'trash') {
                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            } else if (itemType == 'decision') {
                var sourceUUID = toId;
                me.flowInstance.addEndpoint(toId, me.sourceApproveEndpoint, {
                    anchor: [0.5, 0, 0, -1],
                    uuid: sourceUUID + '_approve'
                });
                me.flowInstance.addEndpoint(toId, me.sourceRejectEndpoint, {
                    anchor: [0.5, 1, 0, 1],
                    uuid: sourceUUID + '_reject'
                });

                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            } else if (itemType == 'starter') {
                var sourceUUID = toId;
                me.flowInstance.addEndpoint(toId, me.sourceApproveEndpoint, {
                    anchor: [0.5, 0, 0, -1],
                    uuid: sourceUUID + '_approve'
                });
                me.flowInstance.addEndpoint(toId, me.sourceRejectEndpoint, {
                    anchor: [0.5, 1, 0, 1],
                    uuid: sourceUUID + '_reject'
                });

                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            } else {
                var sourceUUID = toId;
                me.flowInstance.addEndpoint(toId, me.sourceApproveEndpoint, {
                    anchor: [0.5, 0, 0, -1],
                    uuid: sourceUUID + '_approve'
                });
                me.flowInstance.addEndpoint(toId, me.sourceRejectEndpoint, {
                    anchor: [0.5, 1, 0, 1],
                    uuid: sourceUUID + '_reject'
                });

                var targetUUID = toId + '_receive';
                me.flowInstance.addEndpoint(toId, me.targetEndpoint, {
                    anchor: [0, 0.5, -1, 0],
                    uuid: targetUUID
                });
            }
        };

        me.isRemovingItem = false;

        this.callParent(arguments);

    },

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
    },

    onRender: function () {
        var me = this;

        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);

        this.prepareFlow();

        var connections = [];

        if (this.initialConfig.flowItems != null) {
            for (var k = 0; k < this.initialConfig.flowItems.length; k++) {
                var flowItem = this.initialConfig.flowItems[k];

                this.addItem(flowItem);

                if (flowItem.connections != null) {
                    for (var i = 0; i < flowItem.connections.length; i++) {
                        connections.push({
                            source: flowItem.id,
                            target: flowItem.connections[i].target,
                            type: flowItem.connections[i].type
                        });
                    }
                }
            }
        }

        me.isInitializingConnections = true;

        for (var k = 0; k < connections.length; k++) {
            this.flowInstance.connect({
                uuids: [connections[k].source + '_' + connections[k].type, connections[k].target + '_receive']
            });
        }

        me.isInitializingConnections = false;
    },

    onItemMove: function (e) {
        var pos = $(e.target).position();
        UGRJS.Desktop.setComponent(this, 'itemPosition', e.target.id + ';' + pos.left + ';' + pos.top);
    },

    onItemDblClick: function (e) {
        var me = this;
        UGRJS.Desktop.setComponent(this, 'selected', e.target.id);
        Ext.defer(function () {
            me.fireEvent('itemdblclick', me)
        }, 500);
    },

    onConnection: function (info) {
        var me = this;

        if (me.isInitializingConnections == false) {
            var uuidparts = info.sourceEndpoint.getUuid().split('_');
            var type = uuidparts[uuidparts.length - 1];
            UGRJS.Desktop.setComponent(this, 'itemConnection', info.sourceId + ';' + info.targetId + ';' + type);
        }
    },

    onConnectionDetached: function (info) {
        var me = this;

        if (!me.isRemovingItem) {
            var uuidparts = info.sourceEndpoint.getUuid().split('_');
            var type = uuidparts[uuidparts.length - 1];
            UGRJS.Desktop.setComponent(this, 'itemConnectionRemove', info.sourceId + ';' + info.targetId + ';' + type);
        }
    },

    addItem: function (itemConfig) {
        var me = this;

        if (itemConfig.type == 'target') {
            me.flowContainer.append(
                '<div class="flow-window" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else if (itemConfig.type == 'start') {
            me.flowContainer.append(
                '<div class="flow-window flow-window-start" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else if (itemConfig.type == 'end') {
            me.flowContainer.append(
                '<div class="flow-window flow-window-end" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else if (itemConfig.type == 'trash') {
            me.flowContainer.append(
                '<div class="flow-window flow-window-end-trash" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else if (itemConfig.type == 'decision') {
            me.flowContainer.append(
                '<div class="flow-window flow-window-decision" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else if (itemConfig.type == 'starter') {
            me.flowContainer.append(
                '<div class="flow-window flow-window-starter" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        } else {
            me.flowContainer.append(
                '<div class="flow-window flow-window-other" style="left:' + itemConfig.left + 'px; top:' + itemConfig.top + 'px" id="' + itemConfig.id + '">' + itemConfig.title + '</div>'
            );
        }

        me.addEndpoints(itemConfig.id, itemConfig.type);

        me.flowInstance.draggable(jsPlumb.getSelector('#' + itemConfig.id), {
            grid: [20, 20]
        });

        $('#' + itemConfig.id).mouseup(function (e) {
            me.onItemMove(e);
        });

        $('#' + itemConfig.id).click(function (e) {
            me.onItemClick(e);
        });

        $('#' + itemConfig.id).dblclick(function (e) {
            me.onItemDblClick(e);
        });
    },

    removeItem: function (itemId) {
        var me = this;

        me.isRemovingItem = true;

        me.flowInstance.deleteEndpoint(itemId + '_receive');
        me.flowInstance.deleteEndpoint(itemId + '_approve');
        me.flowInstance.deleteEndpoint(itemId + '_reject');

        $('#' + itemId).remove();

        me.isRemovingItem = false;
    },

    onItemClick: function (e) {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'selected', e.target.id);

        $('.flow-window', me.flowContainer).removeClass('flow-item-selected');
        $('#' + e.target.id).addClass('flow-item-selected');
    },

    clearFlow: function () {
        var me = this;

        me.flowInstance.reset();
        me.flowContainer.empty();

        me.flowInstance.bind("connection", function (info) {
            me.onConnection(info);
        });

        me.flowInstance.bind("connectionDetached", function (info) {
            me.onConnectionDetached(info);
        });
    },

    loadFlow: function (items) {
        var me = this;

        var connections = [];

        for (var k = 0; k < items.length; k++) {
            var flowItem = items[k];

            this.addItem(flowItem);

            if (flowItem.connections != null) {
                for (var i = 0; i < flowItem.connections.length; i++) {
                    connections.push({
                        source: flowItem.id,
                        target: flowItem.connections[i].target,
                        type: flowItem.connections[i].type
                    });
                }
            }
        }

        me.isInitializingConnections = true;

        for (var k = 0; k < connections.length; k++) {
            this.flowInstance.connect({
                uuids: [connections[k].source + '_' + connections[k].type, connections[k].target + '_receive']
            });
        }

        me.isInitializingConnections = false;
    },

    prepareFlow: function () {
        var me = this;

        me.body.dom.innerHTML = '<div class="flow-design" id="' + me.getId() + '-design-panel" style="width:100%; height:100%"></div>';
        /*
            + '<div class="flow-window" data-shape="Ellipse" style="left:200px; top:200px" id="flowchartWindow1"><strong>1</strong><br/><br/></div>'
            + '<div class="flow-window" id="flowchartWindow2"><strong>2</strong><br/><br/></div>'
            + '<div class="flow-window" id="flowchartWindow3"><strong>3</strong><br/><br/></div>'
            + '<div class="flow-window" id="flowchartWindow4"><strong>4</strong><br/><br/></div></div>';
            */

        me.flowContainer = $('#' + me.getId() + '-design-panel');

        var instance = jsPlumb.getInstance({
            // Connector:"StateMachine",
            Connector: "StateMachine",
            PaintStyle: {
                lineWidth: 3,
                strokeStyle: "#ffa500",
                "dashstyle": "2 4"
            },
            Endpoint: ["Dot", {
                radius: 5
            }],
            EndpointStyle: {
                fillStyle: "#ffa500"
            },
            Container: me.getId() + '-design-panel'
        });

        me.flowInstance = instance;

        instance.bind("connection", function (info) {
            me.onConnection(info);
        });

        instance.bind("connectionDetached", function (info) {
            me.onConnectionDetached(info);
        });
    },

    setBackground: function (bg) {
        var me = this;
        me.body.setStyle('background', bg);
    },

    setExpanded: function (expanded) {
        var me = this;
        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }
    }
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTCellTextField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.mcelltextfield',

    constructor: function (c) {
        var me = this;

        if (c.maskRe != null) {
            c.maskRe = new RegExp(c.maskRe);
        }

        if (c.regex != null) {
            c.regex = new RegExp(c.regex);
        }

        me.callParent(arguments);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTCellSearchBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.mcellsearchbox',

    translateables: [],

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        if (c.service != null) {
            c.store = Ext.create('UGRFrontend.data.store.GTStore', {
                // Dynamic data model is used for manipulation and
                // generating model dynamically using the service defiend
                model: 'UGRFrontend.data.model.Dynamic',
                service: c.service,
                // Add searchbox reference to store
                relatedSearchBox: me,
                listeners: {
                    beforeload: function () {
                        return true;
                    },
                    load: function () {

                    }
                }
            });
        }


        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.displayField == null) {
            c.displayField = "title";
        }

        c.typeAhead = false;
        c.hideTrigger = false;
        c.value = '';

        c.listConfig = {
            loadingText: c.loadingText,
            emptyText: c.emptyText,

            // Custom rendering template for each item
            getInnerTpl: function () {
                return '{' + c.displayField + '}';
            }
        };
        c.pageSize = 10;

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;
        me.on("focus", me.onCmpFocus);

        me.callParent(arguments);
    },

    onCmpFocus: function (cmp) {
        cmp.selectText();
    }

});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTCellNumberField', {
    extend: 'UGRFrontend.desktop.GTCellTextField',
    alias: 'widget.mcellnumberfield',

    constructor: function (c) {
        var me = this;

        c.maskRe = /^[0-9,.]$/;

        me.dSeparator = c.dSeparator;
        me.tSeparator = c.tSeparator;

        if (c.tSeparator == '.') {
            me.replaceRegExp = /\./g;
        } else if (c.tSeparator == ',') {
            me.replaceRegExp = /,/g;
        }

        me.currencyPrefix = c.currencyPrefix;
        me.currencySuffix = c.currencySuffix;

        if (me.currencyPrefix) {
            me.currencyPrefixRx = new RegExp(me.currencyPrefix, "g");
        }

        if (me.currencySuffix) {
            me.currencySuffixRx = new RegExp(me.currencySuffix, "g");
        }

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on("focus", me.onCmpFocus);
    },

    onCmpFocus: function (cmp) {
        cmp.selectText();
    },

    getErrors: function (value) {
        var me = this;

        var valueLength = value.length;

        var intPart = "";
        var decPart = "";

        var hasDecimal = false;

        if ((me.currencyPrefix != null) || (me.currencySuffix != null)) {
            value = value.replace(/[^0-9,.]/gi, '');
        }

        if (value.indexOf(me.dSeparator) != -1) {
            var decimalParts = value.split(me.dSeparator);
            intPart = decimalParts[0];
            decPart = decimalParts[1];
            hasDecimal = true;
        } else {
            intPart = value;
        }

        intPart = intPart.replace(me.replaceRegExp, '');

        var newIntPart = "";
        for (var k = 1; k <= intPart.length; k++) {
            newIntPart = intPart.substr(intPart.length - k, 1) + newIntPart;

            if (((k) % 3) == 0 && k != intPart.length) {
                newIntPart = me.tSeparator + newIntPart;
            }
        }

        if (hasDecimal) {
            value = newIntPart + me.dSeparator + decPart;
        } else {
            value = newIntPart;
        }

        /*if ( me.previousValue ){
            if ( (valueLength <= me.previousValue.length) && valueLength > 1 ){
                value = value.substring(0, value.length - 1);
            }
        }*/

        value = (me.currencyPrefix || '') + value + (me.currencySuffix || '');

        me.setRawValue(value);

        me.previousValue = value;

        return me.callParent(arguments);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTNumberField', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.mnumberfield',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'startedit': true,
            'stopedit': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        me.callParent(arguments);
    },

    onBlur: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },


    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    canFireEdit: true,

    onKeyPress: function (e) {
        var me = this;

        if (me.canFireEdit) {
            me.fireEvent('startedit', me);
            me.canFireEdit = false;
            Ext.defer(me.setFireEdit, 5000, me);
        }
    },

    setFireEdit: function () {
        var me = this;
        me.canFireEdit = true;
        me.fireEvent('stopedit', me);
    },

    // private
    filterKeys: function (e) {
        /*
         * On European keyboards, the right alt key, Alt Gr, is used to type certain special characters.
         * JS detects a keypress of this as ctrlKey & altKey. As such, we check that alt isn't pressed
         * so we can still process these special characters.
         */
        if (e.ctrlKey && !e.altKey) {
            return;
        }
        var key = e.getKey(),
            charCode = String.fromCharCode(e.getCharCode());

        if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))) {
            return;
        }

        if ((!Ext.isGecko && !Ext.isOpera) && e.isSpecialKey() && !charCode) {
            return;
        }
        if (!this.maskRe.test(this.getValue() + charCode)) {
            e.stopEvent();
        }
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    }
});

/* =========================================================
 * @private
 * Ext overrides required by Extensible components
 * =========================================================
 */
Ext.require([
    'Ext.picker.Color',
    'Ext.form.Basic',
    'Ext.data.proxy.Memory'
]);

Extensible.applyOverrides = function () {

    var extVersion = Ext.getVersion();

    // This was fixed in Ext 4.0.5:
    if (Ext.layout.container.AbstractCard) {
        Ext.layout.container.AbstractCard.override({
            renderChildren: function () {
                // added check to honor deferredRender when rendering children
                if (!this.deferredRender) {
                    this.getActiveItem();
                    this.callParent();
                }
            }
        });
    }

    // This was fixed in Ext 4.0.4?
    Ext.Component.override({
        getId: function () {
            var me = this,
                xtype;

            if (!me.id) {
                xtype = me.getXType();
                xtype = xtype ? xtype.replace(/[\.,\s]/g, '-') : 'ext-comp';
                me.id = xtype + '-' + me.getAutoId();
            }
            return me.id;
        }
    });

    if (Ext.picker && Ext.picker.Color) {
        Ext.picker.Color.override({
            constructor: function () {
                // use an existing renderTpl if specified
                this.renderTpl = this.renderTpl || Ext.create('Ext.XTemplate', '<tpl for="colors"><a href="#" ' +
                    'class="color-{.}" hidefocus="on"><em><span style="background:#{.}" ' +
                    'unselectable="on">&#160;</span></em></a></tpl>');

                this.callParent(arguments);
            }
        });
    }

    if (extVersion.isLessThan('4.1')) {
        if (Ext.data && Ext.data.reader && Ext.data.reader.Reader) {
            Ext.data.reader.Reader.override({
                extractData: function (root) {
                    var me = this,
                        values = [],
                        records = [],
                        Model = me.model,
                        i = 0,
                        length = root.length,
                        idProp = me.getIdProperty(),
                        node, id, record;

                    if (!root.length && Ext.isObject(root)) {
                        root = [root];
                        length = 1;
                    }

                    for (; i < length; i++) {
                        node = root[i];
                        values = me.extractValues(node);

                        // Assuming that the idProperty is intended to use the id mapping, if
                        // available, getId() should read from the mapped values not the raw values.
                        // Using the non-mapped id causes updates later to silently fail since
                        // the updated data is replaced by id.
                        //id = me.getId(node);
                        id = me.getId(values);

                        record = new Model(values, id, node);
                        records.push(record);

                        if (me.implicitIncludes) {
                            me.readAssociated(record, node);
                        }
                    }

                    return records;
                }
            });
        }
    }

    if (Ext.form && Ext.form.Basic) {
        Ext.form.Basic.override({
            reset: function () {
                var me = this;
                // This causes field events to be ignored. This is a problem for the
                // DateTimeField since it relies on handling the all-day checkbox state
                // changes to refresh its layout. In general, this batching is really not
                // needed -- it was an artifact of pre-4.0 performance issues and can be removed.
                //me.batchLayouts(function() {
                me.getFields().each(function (f) {
                    f.reset();
                });
                //});
                return me;
            }
        });
    }

    // Currently MemoryProxy really only functions for read-only data. Since we want
    // to simulate CRUD transactions we have to at the very least allow them to be
    // marked as completed and successful, otherwise they will never filter back to the
    // UI components correctly.
    if (Ext.data && Ext.data.proxy && Ext.data.proxy.Memory) {
        Ext.data.proxy.Memory.override({
            updateOperation: function (operation, callback, scope) {
                Ext.each(operation.records, function (rec) {
                    rec.commit();
                });
                operation.setCompleted();
                operation.setSuccessful();
                Ext.callback(callback, scope || this, [operation]);
            },
            create: function () {
                this.updateOperation.apply(this, arguments);
            },
            update: function () {
                this.updateOperation.apply(this, arguments);
            },
            destroy: function () {
                this.updateOperation.apply(this, arguments);
            }
        });
    }
};

Ext.onReady(Extensible.applyOverrides);

Ext.define('UGRFrontend.desktop.GTCalendar', {
    //extend: 'UGRFrontend.desktop.GTPanel',
    extend: 'Extensible.calendar.CalendarPanel',
    alias: 'widget.mcalendar',

    requires: [
        'UGRFrontend.data.model.Dynamic',
        'UGRFrontend.data.store.GTCalendarStore'
    ],

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'itemclick': true,
            'dateclick': true,
            'aftereventedit': true,
            'eventcreate': true
        });

        Ext.applyIf(c, {
            viewConfig: {
                dateParamStart: '@startDate',
                dateParamEnd: '@endDate',
                dateParamFormat: c.dateFormat,
            }
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.eventStore == null) {
            var calendarStore = Ext.create('UGRFrontend.data.store.GTCalendarStore', {
                service: c.service,
                channel: c.channel,
                proxy: {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        type: 'json',
                        root: 'rows'
                    },
                    relatedCalendar: me,
                },
                relatedCalendar: me,
                autoLoad: true
            });

            c.eventStore = calendarStore;
            c.eventStore.proxy.relatedStore = calendarStore;
        }

        Ext.applyIf(c, {
            gParameters: {
                '@viewId': c.id,
                '@viewType': 'calendar'
            }
        });

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);
        me.gParameters['@viewId'] = c.id;

        if (c.isEditable) {
            c.readOnly = false;
            me.isEditable = true;
        } else {
            c.readOnly = true;
            c.isEditable = false;
        }

        me.callParent(arguments);

    },

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('eventclick', me.onCmpEventClick);
        me.on('eventupdate', me.onCmpEventUpdate);
        me.on('eventmove', me.onCmpEventUpdate);
        me.on('dayclick', me.onCmpDayClick);
        me.on('rangeselect', me.onCmpRangeSelect);

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    onCmpDayClick: function (pnl, dt, el) {
        var me = this;

        var startDT = dt;
        var endDT = Ext.Date.add(startDT, Ext.Date.MINUTE, 30);

        UGRJS.Desktop.setComponent(this, 'dateselection',
            Ext.Date.format(startDT, me.initialConfig.dateFormat) + '|' +
            Ext.Date.format(endDT, me.initialConfig.dateFormat), true);

        Ext.defer(function () {
            me.fireEvent('eventcreate', me);
        }, 100);

        return false;
    },

    onCmpRangeSelect: function (pnl, dates, el) {
        var me = this;

        var startDT = dates.StartDt;
        var endDT = dates.EndDt;

        UGRJS.Desktop.setComponent(this, 'dateselection',
            Ext.Date.format(startDT, me.initialConfig.dateFormat) + '|' +
            Ext.Date.format(endDT, me.initialConfig.dateFormat), true);

        Ext.defer(function () {
            me.fireEvent('eventcreate', me);
        }, 100);

        return false;

    },

    onCmpEventClick: function (cal, record, el) {
        var me = this;
        UGRJS.Desktop.setComponent(this, 'selected', record.get('ID'), true);

        Ext.defer(function () {
            me.fireEvent('afterselect', me);
        }, 100);

        $('.ext-cal-evr').removeClass('x-calendar-event-item-selected');

        Ext.fly(el).addCls('x-calendar-event-item-selected');

        return false;
    },

    doRefresh: function (val) {
        var me = this;
        me.store.reload();
        me.update();
    },

    setParameter: function (parameter) {
        var me = this;

        for (var name in parameter) {
            me.gParameters[name] = parameter[name];
        }
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    onCmpEventUpdate: function (panel, record) {
        var me = this;
        var change = Ext.Date.format(record.get('StartDt'), me.initialConfig.dateFormat) + ';' +
            Ext.Date.format(record.get('EndDt'), me.initialConfig.dateFormat);

        UGRJS.Desktop.setComponent(this, 'dateChanged', record.get('ID') + ';' + change, true);

        Ext.defer(function () {
            me.fireEvent('aftereventedit', me);
        }, 100);

        var store = me.initialConfig.eventStore;

        var count = store.getCount();
        var records = [];
        for (var k = 0; k < count; k++) {
            records.push(store.getAt(k));
        }

        store.removeAll();
        store.add(records);

        return true;
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTDisplay', {
    extend: 'Ext.form.field.Display',
    alias: 'widget.mdisplay',

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    },

    setCls: function (cls) {
        var me = this;

        if (me.initialConfig.cls != null) {
            me.removeCls(me.initialConfig.cls);
        }

        me.initialConfig.cls = cls;

        me.addCls(cls);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTHtmlEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.mhtmleditor',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'startedit': true,
            'stopedit': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.initConfig(c);

        this.callParent(arguments);

        me.on({
            scope: me,
            initialize: me.onInitializeHtmlEditor
        });
    },

    onInitializeHtmlEditor: function () {
        var me = this,
            frameWin = me.getWin(),
            fnBlur = Ext.bind(me.onHtmlEditorBlur, me);

        if (frameWin.attachEvent) {
            frameWin.addEventListener('blur', fnBlur);
        } else {
            frameWin.addEventListener('blur', fnBlur, false);
        }
    },

    onHtmlEditorBlur: function (event) {
        this.fireEvent('blur', this);

        UGRJS.Desktop.setComponent(this, 'value', this.getValue());
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    canFireEdit: true,

    onKeyPress: function (e) {
        var me = this;

        if (me.canFireEdit) {
            me.fireEvent('startedit', me);
            me.canFireEdit = false;
            Ext.defer(me.setFireEdit, 5000, me);
        }
    },

    setFireEdit: function () {
        var me = this;
        me.canFireEdit = true;
        me.fireEvent('stopedit', me);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTFileField', {
    extend: 'Ext.form.field.File',
    alias: 'widget.mfilefield',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'uploadcomplete': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        Ext.Ajax.timeout = 200000;

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on('afterrender', me.onAfterRender, me);
    },

    onAfterRender: function (cmp) {
        var me = this;

        if (me.initialConfig.acceptMime != null) {
            cmp.fileInputEl.set({
                accept: me.initialConfig.acceptMime // or w/e type
            });
        }

        me.fileInputEl.on('change', me.onFileSelect, me);
    },

    onFileSelect: function (evt) {
        var me = this;

        if (me.ownerUuid != null) {
            me.getEl().mask('Dosya yükleniyor...', 'loading');
        }
        console.log(evt);

        var fileInputId = me.fileInputEl.id;
        console.log(fileInputId);
        var fileNameSuffix = fileInputId.split('-')[0];
        console.log(fileNameSuffix);
        var reader = new FileReader();
        var f = evt.target.files[0];
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                console.log(e);
                console.log(theFile);
                // Render thumbnail.
                Ext.Ajax.method = "POST";
                Ext.Ajax.request({
                    url: '/gtsp/upload',
                    params: {
                        data: e.target.result,
                        name: fileNameSuffix+"_"+theFile.name
                    },
                    success: function (response) {
                        UGRJS.Desktop.setComponent(me, 'file', response.responseText);
                        Ext.defer(function () {
                            UGRJS.Desktop.setComponent(me, 'value', theFile.name);
                        }, 300);

                        Ext.defer(function () {
                            me.fireEvent('uploadcomplete', me);
                        }, 300);

                        me.getEl().unmask();
                    },
                    failure: function (response, opts) {
                        Ext.Msg.alert('Hata', 'Dosya yüklenirken hata oluştu. Lütfen tekrar deneyiniz.');
                    }
                });
                // UGRJS.Desktop.setComponent(me, 'data', e.target.result);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    },

    setCmpWidth: function (w) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setWidth(w);
        me.on('resize', me.changeSize, me);
    },

    setCmpHeight: function (h) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setHeight(h);
        me.on('resize', me.changeSize, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTSplit', {
    extend: 'Ext.button.Split',
    alias: 'widget.msplit',

    constructor: function (c) {
        var me = this;

        if (c.items != null) {
            c.menu = {
                items: c.items
            };

            c.menuItems = c.items;
            c.items = null;
        }

        me.callParent(arguments);

    },

    initComponent: function () {
        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
    },

    onRender: function () {
        var me = this;

        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        if (me.menuItems != null) {
            for (var k = 0; k < me.menuItems.length; k++) {
                var subItem = me.menuItems[k];
                Ext.getCmp(subItem.id).ownerUuid = owner.uuid;
            }
        }

        this.callParent(arguments);
    },

    setHidden: function (value) {
        this.setVisible(!value);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTDrawing', {
    extend: 'UGRFrontend.desktop.GTPanel',
    alias: 'widget.mdrawing',

    statics: {},

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        me.storeItems = [];

        if (c.store == null) {
            if (c.service != null) {
                me.store = Ext.create('UGRFrontend.data.store.GTStore', {
                    // Dynamic data model is used for manipulation and
                    // generating model dynamically using the service defiend
                    model: 'UGRFrontend.data.model.Dynamic',
                    service: c.service,
                    channel: c.channel,
                    listeners: {
                        load: me.onStoreLoad,
                        scope: me
                    },
                    pageSize: 500,
                    autoLoad: false
                });

                me.store.on('aftermanipulated', me.onStoreManipulated, me);
            }
        }

        this.callParent(arguments);

    },

    currentDate: new Date(),

    initComponent: function () {
        var me = this;

        me.on('afterrender', me.prepareDrawing, me);

        me.callParent(arguments);
    },

    redraw: function (drawingItems) {
        var me = this;
        if (me.drawing != null) {
            me.remove(me.drawing);
            me.drawing.destroy();

            me.initialConfig.drawingItems = drawingItems;

            me.prepareDrawing();
            me.doLayout();
        }
    },

    setDrawingHeight: function (height) {
        var me = this;
        me.drawing.setHeight(height);
    },

    prepareDrawing: function (pnl) {
        var me = this;

        if (me.initialConfig.drawingItems != null) {
            var drawingCfg = me.initialConfig.drawing || {};
            Ext.applyIf(drawingCfg, {
                renderTo: me.body,
                width: 1000,
                height: 600,
                autoSize: false,
                viewBox: false
            });
            drawingCfg.items = me.initialConfig.drawingItems;

            me.drawing = Ext.create('Ext.draw.Component', drawingCfg);
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTRegionSchedule', {
    extend: 'UGRFrontend.desktop.GTPanel',
    alias: 'widget.mregionschedule',

    statics: {},

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        me.myRegions = [];
        me.storeItems = [];

        if (Ext.isArray(c.regions)) {
            for (var k = 0; k < c.regions.length; k++) {
                var region = c.regions[k];
                me.myRegions.push(region);
            }
        }

        if (c.store == null) {
            if (c.service != null) {
                me.store = Ext.create('UGRFrontend.data.store.GTStore', {
                    // Dynamic data model is used for manipulation and
                    // generating model dynamically using the service defiend
                    model: 'UGRFrontend.data.model.Dynamic',
                    service: c.service,
                    channel: c.channel,
                    listeners: {
                        load: me.onStoreLoad,
                        scope: me
                    },
                    pageSize: 500,
                    autoLoad: false
                });

                me.store.on('aftermanipulated', me.onStoreManipulated, me);
            }
        }

        this.callParent(arguments);

    },

    currentDate: new Date(),

    initComponent: function () {
        var me = this;

        me.on('beforerender', me.prepareSchedule, me);

        me.callParent(arguments);
    },

    prepareSchedule: function (pnl) {
        var me = this;

        me.scheduleConfig = {};
        Ext.applyIf(me.scheduleConfig, me.initialConfig.schedule);
        Ext.applyIf(me.scheduleConfig, {
            id: me.id + '-schedule',
            title: me.title,
            dateWidth: 100,
            regionHeight: 60,
            regionWidth: 100
        });

        Ext.apply(me.scheduleConfig, {
            layout: {
                type: 'vbox'
            },
            autoScroll: true
        });

        me.schedulePanel = Ext.create('Ext.panel.Panel', me.scheduleConfig);

        me.headerPanel = Ext.create('Ext.panel.Panel', {
            id: me.id + '-header',
            height: me.scheduleConfig.regionHeight,
            width: (me.myRegions.length + 1) * me.scheduleConfig.regionWidth,
            layout: {
                type: 'hbox'
            }
        });

        me.viewPanel = Ext.create('Ext.panel.Panel', {
            id: me.id + '-view',
            height: me.scheduleConfig.regionHeight * 30,
            width: (me.myRegions.length + 1) * me.scheduleConfig.regionWidth,
            layout: {
                type: 'absolute'
            }
        });

        me.schedulePanel.add(me.headerPanel);
        me.schedulePanel.add(me.viewPanel);
        me.add(me.schedulePanel);

        me.prepareHeader();
        me.prepareDate();
        me.prepareCells();

        me.load();
    },

    load: function () {
        var me = this;

        for (var k = 0; k < me.storeItems.length; k++) {
            if (me.storeItems[k].parentNode != null) {
                me.storeItems[k].parentNode.removeChild(me.storeItems[k]);
            }
        }

        me.storeItems = [];

        if (me.store != null) {
            me.setLoading(true);
            if (me.initialConfig.sorterField != null) {
                me.store.sorters.add(Ext.create('Ext.util.Sorter', {
                    property: me.initialConfig.sorterField,
                    direction: 'ASC'
                }));
            }

            if (me.initialConfig.filterField != null) {
                var start = Ext.Date.getFirstDateOfMonth(me.currentDate);
                var end = Ext.Date.getLastDateOfMonth(me.currentDate);

                var options = {
                    params: {
                        '@search': me.initialConfig.filterField + '=>' + Ext.Date.format(start, me.initialConfig.dateFormat) + ';' +
                            me.initialConfig.filterField + '=<' + Ext.Date.format(end, me.initialConfig.dateFormat)
                    }
                };

                me.store.load(options);

            } else {
                me.store.load();
            }

        }
    },

    prevMonth: function () {
        var me = this;
        me.currentDate = Ext.Date.add(me.currentDate, Ext.Date.MONTH, -1);
        Ext.getCmp(me.id + '-regions-space-lbl').setText(Ext.Date.format(me.currentDate, 'm.Y'));
        for (var k = 0; k < me.dateCells.length; k++) {
            me.viewPanel.remove(me.dateCells[k]);
            me.dateCells[k].destroy();
        }
        me.prepareDate();

        me.load();
    },

    nextMonth: function () {
        var me = this;
        me.currentDate = Ext.Date.add(me.currentDate, Ext.Date.MONTH, 1);
        Ext.getCmp(me.id + '-regions-space-lbl').setText(Ext.Date.format(me.currentDate, 'm.Y'));

        for (var k = 0; k < me.dateCells.length; k++) {
            me.viewPanel.remove(me.dateCells[k]);
            me.dateCells[k].destroy();
        }
        me.prepareDate();

        me.load();
    },

    prepareHeader: function () {
        var me = this;

        me.toolPanel = Ext.create('Ext.panel.Panel', {
            id: me.id + '-regions-space',
            width: me.scheduleConfig.regionWidth,
            height: me.scheduleConfig.regionHeight,
            items: [{
                xtype: 'label',
                id: me.id + '-regions-space-lbl',
                text: Ext.Date.format(me.currentDate, 'm.Y')
            },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [{
                        xtype: 'button',
                        text: '<',
                        flex: 1,
                        listeners: {
                            scope: me,
                            click: me.prevMonth
                        }
                    },
                        {
                            xtype: 'button',
                            text: '>',
                            flex: 1,
                            listeners: {
                                scope: me,
                                click: me.nextMonth
                            }
                        }
                    ]
                }
            ],
            layout: {
                type: 'vbox',
                align: 'center'
            },
            baseCls: 'x-panel-header',
            colNumber: k
        });

        me.headerPanel.add(me.toolPanel);

        for (var k = 0; k < me.myRegions.length; k++) {
            var region = me.myRegions[k];
            var cr = Ext.create('Ext.panel.Panel', {
                id: me.id + '-regions-' + region.key,
                html: '<div><div class="ux-regionschedule-header"><font>' + region.value + '</font></div></div>',
                width: me.scheduleConfig.regionWidth,
                height: me.scheduleConfig.regionHeight,
                baseCls: 'x-panel-header',
                colNumber: k
            });

            me.headerPanel.add(cr);
        }

        var toolPanel = Ext.getCmp(me.id + '-regions-space');
    },

    prepareDate: function () {
        var me = this;

        var daysInMonth = Ext.Date.getDaysInMonth(me.currentDate);
        var date = Ext.Date.format(me.currentDate, 'm.Y');

        me.dateCells = [];

        for (var k = 1; k <= daysInMonth; k++) {
            var cd = Ext.create('Ext.panel.Panel', {
                id: me.id + '-days-' + k,
                html: '<div><div class="ux-regionschedule-header"><font>' + k + '</font><br>' + date + '</div></div>',
                width: me.scheduleConfig.regionWidth,
                height: me.scheduleConfig.regionHeight,
                baseCls: 'x-panel-header',
                x: 0,
                y: (k - 1) * me.scheduleConfig.regionHeight,
                rowNumber: k
            });

            me.viewPanel.add(cd);
            me.dateCells.push(cd);
        }
    },

    prepareCells: function () {
        var me = this;

        var daysInMonth = Ext.Date.getDaysInMonth(me.currentDate);
        var innerHtml = '';
        for (var k = 1; k <= daysInMonth; k++) {
            for (m = 0; m < me.myRegions.length; m++) {
                var region = me.myRegions[m];
                /*
                var cell = Ext.create('Ext.panel.Panel', {
                    id: me.id + '-cell-' + k + '-' + region.key,
                    width: me.scheduleConfig.regionWidth,
                    bodyCls: 'ux-gtregionschedule',
                    height: me.scheduleConfig.regionHeight,
                    x: (m + 1) * me.scheduleConfig.regionWidth,
                    y: (k-1) * me.scheduleConfig.regionHeight,
                    layout: 'vbox'
                });
                */
                innerHtml += '<div id="' + me.id + '-cell-' + k + '-' + region.key +
                    '" class="ux-gtregionschedule" style="left:' + (m + 1) * me.scheduleConfig.regionWidth +
                    'px; top:' + (k - 1) * me.scheduleConfig.regionHeight + 'px; width:' + me.scheduleConfig.regionWidth +
                    'px; height:' + me.scheduleConfig.regionHeight + 'px; position:absolute; border-style:solid;' +
                    ' border-width:1px; border-color:#224455"></div>';


                // me.viewPanel.add(cell);
            }


        }

        me.viewPanel.update(innerHtml);
    },

    onStoreLoad: function (store, records, successful, eOpts) {
        var me = this;

        if (Ext.isArray(records)) {

            for (var k = 0; k < records.length; k++) {
                var record = records[k];
                var itemData = record.data;
                var itemDate = Ext.Date.parse(itemData.date, me.initialConfig.dateFormat);
                var day = parseInt(Ext.Date.format(itemDate, "j"));
                // var cell = Ext.getCmp(me.id + '-cell-' + day + '-' + itemData.region);
                var cell = document.getElementById(me.id + '-cell-' + day + '-' + itemData.region);
                var cellId = itemData[itemData['@id']];
                if (cell != null) {
                    /*
                    var cmp = Ext.create('Ext.panel.Panel', {
                        id: me.id + '-items-' + cellId,
                        html: '<div><div class="ux-regionschedule-cell"><font>' + itemData[me.initialConfig.titleField] + '</font></div></div>',
                        width: me.scheduleConfig.regionWidth,
                        height: me.scheduleConfig.regionHeight,
                        flex: 1,
                        listeners: {
                            afterrender: function(){
                                this.getEl().scheduleCellId = cellId;
                                this.getEl().on('click', function(){
                                    me.cellSelect(this.scheduleCellId);
                                })
                            }
                        }
                    });
                    
                    if ( itemData.color != null ){
                        cmp.orgBodyStyle = 'background-color:' + itemData['color'] + '; border-style: solid';
                        cmp.setBodyStyle(cmp.orgBodyStyle);
                    }
                    */

                    var color = itemData.color || '#FFFFFF';
                    var id = me.id + '-items-' + cellId;

                    var innerHtml = '<div cellId="' + cellId + '" id="' + id +
                        '" class="ux-gtregionschedule-cell" style="width:100%; ' +
                        'height:100%; border-style:solid; background-color:' + color + ';' +
                        ' border-width:1px; border-color:#668899"><font>' +
                        itemData[me.initialConfig.titleField] + '</font></div>';


                    // cell.add(cmp);

                    cell.innerHTML += innerHtml;

                    var height = 100 / (cell.childNodes.length);
                    for (var m = 0; m < cell.childNodes.length; m++) {
                        cell.childNodes[m].style.height = height + '%';
                        Ext.get(cell.childNodes[m]).on('click', me.cellSelect, me);
                        me.storeItems.push(cell.childNodes[m]);
                    }
                }

            }
        }

        me.setLoading(false);
    },

    cellSelect: function (e, t, eOpts) {
        var me = this;

        if (t.nodeName != 'DIV') {
            t = t.parentNode;
        }
        if (me.selectedCell != null) {
            if (me.selectedCell.id == t.id) {
                return;
            }
        }

        t.prevBackgroundColor = t.style.backgroundColor;
        t.style.backgroundColor = '#A0FFFF';
        t.style.borderStyle = 'dashed';
        if (me.selectedCell != null) {
            me.selectedCell.style.backgroundColor = me.selectedCell.prevBackgroundColor;
            me.selectedCell.style.borderStyle = 'solid';
        }

        me.selectedCell = t;

        UGRJS.Desktop.setComponent(me, 'selected', t.getAttribute("cellId"), true);
        Ext.defer(function () {
            me.fireEvent('afterselect', me)
        }, 500);

        /*
        var selectedCell = Ext.getCmp(me.id + '-items-' + id);
        if ( selectedCell != null ){
            selectedCell.setBodyStyle('background-color: #A0FFFF; border-style: dashed');
        	
            if ( me.selectedCell != null ){
                me.selectedCell.setBodyStyle(me.selectedCell.orgBodyStyle);
                // me.selectedCell.setBodyStyle('background-color: #FFFFFF; border-style: solid');
            }
        	
            me.selectedCell = selectedCell;
            UGRJS.Desktop.setComponent(me, 'selected', id, true);
            Ext.defer(function() { me.fireEvent('afterselect', me) }, 500);
        }
        */
    },

    onStoreManipulated: function (data) {
        var me = this;
        var cell = document.getElementById(me.id + '-items-' + data[data['@id']]);
        if (cell != null) {
            cell.childNodes[0].innerHTML = data[me.initialConfig.titleField];
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.mfieldset',

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: '@target',
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);

    },

    initComponent: function () {

        var me = this;

        me.callParent(arguments);

        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('afterlayout', me.onAfterCmpLayout, me);
    },

    onAfterCmpLayout: function () {
        var me = this;

        if (me.initialConfig.background != null) {
            me.setBackground(me.initialConfig.background);
        }
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setBackground: function (bg) {
        var me = this;
        me.body.setStyle('background', bg);
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTSlider', {
    extend: 'Ext.slider.Single',
    alias: 'widget.mslider',

    initComponent: function () {
        var me = this;

        me.on('changecomplete', me.onChangeValue, me);

        me.callParent(arguments);
    },

    onChangeValue: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTMapMarker', {
    extend: 'Ext.Component',
    alias: 'widget.mmapmarker',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'move': true,
            'aftermove': true,
            'afterrender': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.lat != null && c.lon != null) {
            c.position = new google.maps.LatLng(c.lat, c.lon)
        }

        if (c.icon != null) {
            c.icon = '../icons/map/' + c.icon;
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[name],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }
            }
        }

        Ext.applyIf(c, {
            visible: true
        });

        me.marker = new google.maps.Marker(c);

        this.callParent(arguments);

        me.initialize();
    },

    initialize: function () {

        var me = this;

        me.on('afterrender', me.onRender, me);

        google.maps.event.addListener(me.marker, 'dragend', function (event) {
            me.onPositionChanged(event.latLng);
        });

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        //me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;
    },

    setMap: function (mapPanel) {
        var me = this;
        if (mapPanel == null) {
            me.marker.setMap(null);
        } else if (me.marker != null && mapPanel.map != null) {
            me.marker.setMap(mapPanel.map);
            me.ownerCt = mapPanel;

            me.fireEvent('afterrender', me);
        }
    },

    setDraggable: function (editable) {

    },

    onPositionChanged: function (latlng) {
        var me = this;

        UGRJS.Desktop.setComponent(me, 'encodedPosition', latlng.lat() + ';' + latlng.lng());

        Ext.defer(function () {
            me.fireEvent('aftermove', me);
        }, 200, me);
    },

    startDrawing: function (val) {
        var me = this;
        if (me.ownerCt.map != null) {
            google.maps.event.addListener(
                me.ownerCt.map,
                'click',
                function (e) {
                    me.marker.setPosition(e.latLng);
                    me.onPositionChanged(e.latLng);
                }
            );
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTPolyline', {
    extend: 'Ext.Component',
    alias: 'widget.mpolyline',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'edit': true,
            'afteredit': true,
            'afterrender': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[name],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }
            }
        }

        Ext.applyIf(c, {
            clickable: false,
            editable: false,
            geodesic: false,
            strokeColor: '#203060',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            visible: true
        });

        if (c.path != null) {
            c.path = UGRFrontend.desktop.GTMap.convertToPath(c.path);
        }

        me.polyline = new google.maps.Polyline(c);

        this.callParent(arguments);

        me.initialize();
    },

    initialize: function () {

        var me = this;

        google.maps.event.addListener(me.polyline.getPath(), 'insert_at', function () {
            me.fireEvent('edit', me);
        });

        google.maps.event.addListener(me.polyline.getPath(), 'remove_at', function () {
            me.fireEvent('edit', me);
        });

        google.maps.event.addListener(me.polyline.getPath(), 'set_at', function () {
            me.fireEvent('edit', me);
        });

        me.on('edit', me.onEdit, me);
        me.on('afterrender', me.onRender, me);

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        //me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;
    },

    setMap: function (mapPanel) {
        var me = this;
        if (mapPanel == null) {
            me.polyline.setMap(null);
        } else if (me.polyline != null && mapPanel.map != null) {
            me.polyline.setMap(mapPanel.map);
            me.ownerCt = mapPanel;

            me.fireEvent('afterrender', me);
        }
    },

    encodePath: function (cPath) {
        var me = this;

        var output = [];
        for (var k = 0; k < cPath.length; k++) {
            output.push(cPath.getAt(k).lat() + '|' + cPath.getAt(k).lng());
        }

        return output.join(';');
    },

    onEdit: function (poly) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'encodedPath', me.encodePath(me.polyline.getPath()), true);
        me.fireEvent('afteredit', me);
    },

    setEditable: function (editable) {
        var me = this;
        me.polyline.setMap(null);
        var path = me.polyline.getPath();
        me.initialConfig.editable = editable;
        me.initialConfig.path = path;
        me.polyline = new google.maps.Polyline(me.initialConfig);
        me.polyline.setMap(me.ownerCt.map);
    },

    startDrawing: function (val) {
        var me = this;
        if (me.ownerCt.map != null) {
            google.maps.event.addListener(
                me.ownerCt.map,
                'click',
                function (e) {
                    me.addPathToPolyline(e.latLng)
                }
            );
        }
    },

    addPathToPolyline: function (latLng) {
        var me = this;
        var path = me.polyline.getPath();
        path.push(latLng);
        me.polyline.setPath(path);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTPolygon', {
    extend: 'Ext.Component',
    alias: 'widget.mpolygon',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'edit': true,
            'afteredit': true,
            'afterrender': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[name],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }
            }
        }

        Ext.applyIf(c, {
            clickable: false,
            editable: false,
            fillColor: '#AA9900',
            fillOpacity: 0.3,
            geodesic: false,
            strokeColor: '#203060',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            visible: true
        });

        if (c.paths != null) {
            c.paths = UGRFrontend.desktop.GTMap.convertToPath(c.paths);
        }

        me.polygon = new google.maps.Polygon(c);

        this.callParent(arguments);

        me.initialize();
    },

    initialize: function () {

        var me = this;

        google.maps.event.addListener(me.polygon.getPath(), 'insert_at', function () {
            me.fireEvent('edit', me);
        });

        google.maps.event.addListener(me.polygon.getPath(), 'remove_at', function () {
            me.fireEvent('edit', me);
        });

        google.maps.event.addListener(me.polygon.getPath(), 'set_at', function () {
            me.fireEvent('edit', me);
        });

        me.on('edit', me.onEdit, me);
        me.on('afterrender', me.onRender, me);

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        //me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;
    },

    setMap: function (mapPanel) {
        var me = this;
        if (mapPanel == null) {
            me.polygon.setMap(null);
        } else if (me.polygon != null && mapPanel.map != null) {
            me.polygon.setMap(mapPanel.map);
            me.ownerCt = mapPanel;

            me.fireEvent('afterrender', me);
        }
    },

    encodePath: function (cPath) {
        var me = this;

        var output = [];
        for (var k = 0; k < cPath.length; k++) {
            output.push(cPath.getAt(k).lat() + '|' + cPath.getAt(k).lng());
        }

        return output.join(';');
    },

    onEdit: function (poly) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'encodedPath', me.encodePath(me.polygon.getPath()), true);
        me.fireEvent('afteredit', me);
    },

    setEditable: function (editable) {
        var me = this;
        me.polygon.setMap(null);
        var paths = me.polygon.getPath();
        me.initialConfig.editable = editable;
        me.initialConfig.paths = paths;
        me.polygon = new google.maps.Polygon(me.initialConfig);
        me.polygon.setMap(me.ownerCt.map);
    },

    startDrawing: function (val) {
        var me = this;
        if (me.ownerCt.map != null) {
            google.maps.event.addListener(
                me.ownerCt.map,
                'click',
                function (e) {
                    me.addPathToPolygon(e.latLng)
                }
            );
        }
    },

    addPathToPolygon: function (latLng) {
        var me = this;
        var path = me.polygon.getPath();
        path.push(latLng);
        me.polygon.setPath(path);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTMap', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mmap',

    statics: {
        convertToPath: function (paths) {
            var mvc = [];
            if (Ext.isArray(paths)) {
                for (var k = 0; k < paths.length; k++) {
                    mvc.push(new google.maps.LatLng(paths[k].lat, paths[k].lon));
                }
            }

            return mvc;
        }
    },

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'mapdblclick': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[arguments.callee.listenerName],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }

                c.listeners[name].listenerName = name;
            }
        }

        // me.expandedPanel = c.expandedPanel;

        this.callParent(arguments);

    },

    map: null,

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);

        me.on('afterlayout', me.prepareMap, me);
        me.on('beforedestroy', me.destroyMap, me);
        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('resize', me.onCmpResize, me);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setBackground: function (bg) {
        var me = this;
        me.body.setStyle('background', bg);
    },

    setExpanded: function (expanded) {
        var me = this;
        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }
    },

    // Add map after this panel is rendered
    prepareMap: function () {
        var me = this;
        if (me.map == null) {
            var mapOptions = {
                zoom: me.initialConfig.zoom || 8,
                center: me.initialConfig.center == null ? new google.maps.LatLng(38.714308, 35.531594) : new google.maps.LatLng(me.initialConfig.center.lat, me.initialConfig.center.lon),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDoubleClickZoom: true
            };
            Ext.apply(mapOptions, me.initialConfig.mapOptions);

            me.map = new google.maps.Map(me.body.dom, mapOptions);

            if (Ext.isArray(me.initialConfig.mapItems)) {
                for (var k = 0; k < me.initialConfig.mapItems.length; k++) {
                    var cmpConfig = me.initialConfig.mapItems[k];
                    me.add(cmpConfig);
                }
            }
        }

        google.maps.event.addListener(me.map, 'dblclick', function (event) {
            me.onMapDblClick(event.latLng);
        });

        me.expand();

        if (me.initialConfig.initialAddress != null) {
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({
                'address': me.initialConfig.initialAddress
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    me.map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: me.map,
                        position: results[0].geometry.location
                    });
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });

        }
    },

    mapOverlays: [],

    add: function (cmpConfig) {
        var me = this;
        var cmp;
        if (cmpConfig.xtype == "mpolygon" || cmpConfig.xtype == "mpolyline" || cmpConfig.xtype == "mmapmarker") {
            cmp = Ext.create('widget.' + cmpConfig.xtype, cmpConfig);
            this.mapOverlays.push(cmp);
            cmp.setMap(me);
        } else {
            me.callParent(arguments);
        }
    },

    addMapItem: function (item) {
        var temp = 3;
    },

    clearMap: function (p) {
        for (var k = 0; k < this.mapOverlays.length; k++) {
            this.mapOverlays[k].setMap(null);
            this.mapOverlays[k].destroy();
        }

        this.mapOverlays = [];
    },

    setCenter: function (center) {
        var me = this;
        if (me.map != null) {
            me.map.setCenter(new google.maps.LatLng(center.lat, center.lon));
        }
    },

    setZoom: function (zoom) {
        var me = this;
        if (me.map != null) {
            me.map.setZoom(zoom);
        }
    },

    destroyMap: function (mapPanel, eOpts) {
        var me = this;
        me.clearMap();
    },

    onMapDblClick: function (latlng) {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'clickPosition', latlng.lat() + ';' + latlng.lng());
        Ext.defer(function () {
            me.fireEvent('mapdblclick', me);
        }, 200, me);
    },

    onCmpResize: function (pnl, width, height) {
        var me = this;

        if (width) {
            UGRJS.Desktop.setComponent(me, 'width', width, true);
        }

        if (height) {
            Ext.defer(function () {
                UGRJS.Desktop.setComponent(me, 'height', height, true);
            }, 200);
        }
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTColorPicker', {
    extend: 'Ext.picker.Color',
    alias: 'widget.mcolor',

    constructor: function (c) {
        var me = this;

        if (c.value == "0") {
            c.value = "000000";
        }

        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on('select', me.onChangeValue, me);

    },

    onChangeValue: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    setValue: function (val) {
        this.select(val, true);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTRadio', {
    extend: 'Ext.form.field.Radio',
    alias: 'widget.mradio',

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        if (me.ownerUuid != null) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: '@target',
                                    value: (c.gListeners.hasTarget ? me.getId() : "")
                                }],
                                processResponse: true
                            });
                        }
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.initConfig(c);

        this.callParent(arguments);
    },

    onBlur: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    }
});

Ext.define('UGRFrontend.desktop.GTCheckBox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.mcheckbox',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterchange': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        if (me.ownerUuid != null) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: '@target',
                                    value: (c.gListeners.hasTarget ? me.getId() : "")
                                }],
                                processResponse: true
                            });
                        }
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.initConfig(c);

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on('change', me.onCmpChangeValue, me);

        me.callParent(arguments);
    },

    onBlur: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    onCmpChangeValue: function () {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'value', this.getValue(), true);
        Ext.defer(function () {
            me.fireEvent('afterchange', me);
        }, 100, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTLabel', {
    extend: 'Ext.form.Label',
    alias: 'widget.mlabel',

    mixins: [
        'Ext.form.Labelable'
    ],

    constructor: function (c) {
        var me = this;

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[name],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }
            }
        }

        this.callParent(arguments);
    },

    onBlur: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getRawValue());

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    setBackground: function (bg) {
        var me = this;
        me.el.highlight(bg);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.mtoolbar',

    initComponent: function () {
        var me = this;

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    }
});


/*!
 * GTGrid is an extended version for ExtJS 4.0 Grid Panel.
 * Specifically extended to use with ARK Server
 */

Ext.define('UGRFrontend.desktop.GTChart', {
    extend: 'Ext.chart.Chart',
    alias: 'widget.mchart',

    requires: [
        // 'Ext.ux.grid.FiltersFeature',
        'UGRFrontend.data.model.Dynamic',
        'UGRFrontend.data.store.GTStore',
        'Ext.chart.*'
    ],

    constructor: function (c) {
        var me = this;

        // If no store is defined in config and service is defined
        // in config, initiate GTStore with specified service
        if (c.store == null) {
            if (c.service != null) {
                c.store = Ext.create('UGRFrontend.data.store.GTStore', {
                    // Dynamic data model is used for manipulation and
                    // generating model dynamically using the service defiend
                    model: 'UGRFrontend.data.model.Dynamic',
                    service: c.service,
                    channel: c.channel,
                    // Add grid reference to store
                    relatedChart: me
                });
            }
        }

        // If config does not have listener object
        // create it and add a row-select event to let the
        // server know about the selection change
        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                c.listeners[name] = function (arg) {
                    UGRJS.Desktop.runMethod({
                        cls: c.service,
                        method: c.gListeners[arguments.callee.listenerName],
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true
                    });
                }

                c.listeners[name].listenerName = name;
            }
        }

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);
        me.gParameters['@viewId'] = c.id;
        me.gParameters['@viewType'] = 'chart';

        this.callParent(arguments);
    },

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    doRefresh: function (val) {
        var me = this;
        me.getStore().load();
    },

    setExpanded: function (expanded) {
        var me = this;
        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTHiddenField', {
    extend: 'Ext.form.field.Hidden',
    alias: 'widget.mhidden',

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    }
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTTrigger', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.mtrigger',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'trigger': true
        });

        this.addEvents({
            'startedit': true,
            'stopedit': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        if (me.ownerUuid != null) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: '@target',
                                    value: (c.gListeners.hasTarget ? me.getId() : "")
                                }],
                                processResponse: true
                            });
                        }
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);

        me.on('stopedit', me.onStopEdit, me);
        me.on('focus', me.onGetFocus, me);
    },

    onBlur: function () {
        UGRJS.Desktop.setComponent(this, 'value', this.getValue());

        this.callParent(arguments);
    },

    onGetFocus: function (params) {
        var me = this;
        if (me.menu != null) {
            Ext.destroy(me.menu);
            me.menu = null;
        }
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    onKeyPress: function (e) {
        var me = this;

        if (me.canFireEdit) {
            me.fireEvent('startedit', me);
            me.canFireEdit = false;
            Ext.defer(me.setFireEdit, 5000, me);
        }
    },

    onTriggerClick: function () {
        var me = this;
        me.fireEvent('trigger', me);
    },

    canFireEdit: true,

    setFireEdit: function () {
        var me = this;
        me.canFireEdit = true;
        me.fireEvent('stopedit', me);
    },

    setHidden: function (hidden) {
        var me = this;
        me.setVisible(!hidden);
    },

    onStopEdit: function () {
        /*
        var me = this;
        
        var pos = me.getPosition();
        pos[0] = pos[0] + me.labelWidth + 5;
        pos[1] = pos[1] + me.getHeight() + 3;
        
        if ( ! me.menu ){
            me.menu = Ext.create('UGRFrontend.desktop.GTTriggerSelector', {
                items:[{xtype:"label",text:"Birinci"},{xtype:"label",text:"İkinci"}],
                x: pos[0],
                y: pos[1],
                width: me.getWidth() - me.labelWidth - 5,
                height: 100,
                style: 'background-color: #ffffff',
                parentTrigger: me
            });
        } else {
            me.menu.setPosition(pos);
        }
        
        me.menu.render(document.body);
        
        me.menu.toFront();
        
        me.selectText();
        */
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTDateField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.mdatefield',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'afterblur': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);
    },

    onBlur: function () {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'value', this.getRawValue());

        Ext.defer(function () {
            me.fireEvent('afterblur', me);
        }, 100, me);

        this.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    createPicker: function () {
        var me = this,
            format = Ext.String.format;

        return new Ext.picker.Date({
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            todayText: me.initialConfig.todayText,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onDatePickerSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.collapse();
                }
            }
        });
    },

    onDatePickerSelect: function (picker, date, eOpts) {
        var me = this;

        if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0) {
            var now = new Date();
            date.setHours(now.getHours());
            date.setMinutes(now.getMinutes());
            date.setSeconds(now.getSeconds());
        }

        me.onSelect(picker, date, eOpts);

    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    },

    setCmpWidth: function (w) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setWidth(w);
        me.on('resize', me.changeSize, me);
    },

    setCmpHeight: function (h) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setHeight(h);
        me.on('resize', me.changeSize, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTTree', {
    extend: 'Ext.tree.Panel',
    requires: [
        'UGRFrontend.data.proxy.Socket',
        'UGRFrontend.data.store.GTTreeStore'
    ],

    alias: 'widget.mtree',

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        Ext.applyIf(c, {
            gParameters: {
                '@viewId': c.id,
                '@viewType': 'tree'
            }
        });

        if (c.store == null) {
            var treeStore = Ext.create('UGRFrontend.data.store.GTTreeStore', {
                service: c.service,
                channel: c.channel,
                proxy: {
                    type: 'socket',
                    url: c.service,
                    reader: {
                        type: 'json',
                        root: 'rows'
                    },
                    relatedTree: me,
                },
                root: {
                    id: 'root',
                    text: 'root'
                },
                relatedTree: me,
                listeners: {
                    load: function (str) {
                        str.relatedTree.setLoading(false);
                        str.relatedTree.firstRender = true;
                    }
                }
            });

            c.store = treeStore;

            Ext.apply(c, {
                listeners: {
                    itemclick: this.onSelect
                }
            });
        }

        me.allowDeselect = true;

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    if (name == 'itemdblclick') {
                        me.allowDeselect = false;
                    }
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: '@target',
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        Ext.apply(c, {
            viewConfig: {
                getRowClass: function (record, index) {
                    return record.raw['@style'];
                }
            }
        });

        this.callParent(arguments);

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);
        me.gParameters['@viewId'] = c.id;
    },

    initComponent: function () {
        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('afterrender', me.onCmpAfterRender, me);

        me.callParent(arguments);
    },

    onSelect: function (panel, record, item, index, e, eOpts) {
        var me = this;

        if (me.selectedNodes == record.data.id && me.allowDeselect) {
            me.getSelectionModel().deselectAll(true);

            UGRJS.Desktop.setComponent(this, 'selectedNode', "", true);
            me.selectedNodes = "";
        } else {
            UGRJS.Desktop.setComponent(this, 'selectedNode', record.data.id, true);
            me.selectedNodes = record.data.id;
        }

        Ext.defer(function () {
            me.fireEvent('afterselect', me)
        }, 100);
        // this.callParent(arguments);
    },

    onRender: function () {
        var me = this;
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    firstRender: false,

    onCmpAfterRender: function (tree) {
        var me = this;
        if (!me.firstRender) {
            me.setLoading(true);
            me.firstRender = true;
        }

    },

    refreshNode: function (nodeId) {
        var me = this;


        if (nodeId == 'root') {
            me.doRefresh();
        } else {
            var node = me.getStore().getNodeById(nodeId);
            me.setLoading(true);
            if (node != null) {
                me.getStore().load({
                    node: node,
                    callback: function () {
                        me.setLoading(false);
                    }
                });
            }
        }
    },

    doRefresh: function (val) {
        var me = this;
        me.getRootNode().removeAll();
        me.setLoading(true);
        me.getStore().load({
            node: me.getRootNode(),
            callback: function () {
                me.setLoading(false);
            }
        });
    },

    expandNodeById: function (nodeId) {
        var me = this;
        me.expandPath(me.getStore().getNodeById(nodeId).getPath());
    },

    setSelectedNode: function (selection) {
        var me = this;

        me.selectPath(me.getStore().getNodeById(selection).getPath());

        Ext.defer(function () {
            me.fireEvent('afterselect', me)
        }, 500);
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    },

    processMessage: function (manipulation) {
        var me = this;

        if (Ext.isArray(manipulation.manipulations)) {
            for (var k = 0; k < manipulation.manipulations.length; k++) {
                var manip = manipulation.manipulations[k];

                me.processMessage(manip);
            }
        } else {
            if (manipulation.type == UGRFrontend.desktop.Desktop.MANIPULATION_INSERT) {
                var recordData = UGRJS.Desktop.getRecordData(manipulation.record);

                var node;
                if (recordData.parent == NULL_HEX) {
                    node = me.getStore().getRootNode();
                } else {
                    node = me.getStore().getNodeById(recordData.parent);
                }

                if (node != null) {
                    /*
                    me.getStore().load({
                        node: node
                    });
                    */
                    node.appendChild(recordData);
                }
                // else {
                // 	me.getStore().load();
                // }
            }
        }
    }
});

Ext.data.NodeInterface.oldGpv = Ext.data.NodeInterface.getPrototypeBody;
Ext.data.NodeInterface.getPrototypeBody = function () {
    var ret = Ext.data.NodeInterface.oldGpv.apply(this, arguments);

    ret.appendChild = function (node, suppressEvents, suppressNodeUpdate) {
        var me = this,
            i, ln,
            index,
            oldParent,
            ps;


        if (Ext.isArray(node)) {
            for (i = 0, ln = node.length; i < ln; i++) {
                me.appendChild(node[i]);
            }
        } else {
            node = me.createNode(node);

            if (suppressEvents !== true && me.fireEvent("beforeappend", me, node) === false) {
                return false;
            }

            index = me.childNodes.length;
            oldParent = node.parentNode;

            if (oldParent) {
                if (suppressEvents !== true && node.fireEvent("beforemove", node, oldParent, me, index) === false) {
                    return false;
                }
                oldParent.removeChild(node, null, false, true);
            } else {
                node.phantom = true;
            }

            if (me.isLoaded()) {
                index = me.childNodes.length;
                if (index === 0) {
                    me.setFirstChild(node);
                }

                me.childNodes.push(node);
                node.parentNode = me;
                node.nextSibling = null;

                me.setLastChild(node);

                ps = me.childNodes[index - 1];
                if (ps) {
                    node.previousSibling = ps;
                    ps.nextSibling = node;
                    ps.updateInfo(suppressNodeUpdate);
                } else {
                    node.previousSibling = null;
                }
                node.updateInfo(suppressNodeUpdate);
            }

            //console.log('appendChild was called');

            // I don't know what this code mean even given the comment
            // in ExtJS native source, commented out

            // As soon as we append a child to this node, we are loaded
            //if (!me.isLoaded()) {
            //    me.set('loaded', true);
            //}

            // If this node didnt have any childnodes before, update myself
            //else 
            //if (me.childNodes.length === 1) {
            //    me.set('loaded', me.isLoaded());
            //}

            if (suppressEvents !== true) {
                me.fireEvent("append", me, node, index);

                if (oldParent) {
                    node.fireEvent("move", node, oldParent, me, index);
                }
            }

            return node;
        }
    };
    return ret;
};

Ext.override(Ext.view.AbstractView, {
    updateIndexes: function (startIndex, endIndex) {
        var ns = this.all.elements,
            records = this.store.getRange(),
            i;

        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length < records.length ? (ns.length - 1) : records.length - 1));
        for (i = startIndex; i <= endIndex; i++) {
            ns[i].viewIndex = i;
            ns[i].viewRecordId = records[i].internalId;
            if (!ns[i].boundView) {
                ns[i].boundView = this.id;
            }
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.view.GTFileManager', {
    extend: 'Ext.view.View',
    alias: 'widget.filemanager',

    requires: [
        'UGRFrontend.data.store.GTStore'
    ],

    mixins: {
        dragSelector: 'Ext.ux.DataView.DragSelector',
        draggable: 'Ext.ux.DataView.Draggable'
    },

    constructor: function (c) {
        var me = this;
        if (c.store == null) {
            var scStore = Ext.create('UGRFrontend.data.store.GTStore', {
                model: 'UGRFrontend.data.model.Dynamic',
                service: c.service,
                channel: c.channel,
                relatedView: me
            });

            c.store = scStore;

            c.trackOver = true;
            c.overItemCls = 'shortcutview-overitem';
            c.selectedItemCls = 'shortcutview-selecteditem';
            c.singleSelect = true;

            if (c.tpl == null) {
                c.tpl = '<tpl for=\".\"><div class="x-container x-container-default gt-filemanager-item" style="width:100px;height:100px;float:left"><div style="position:relative; left:26px;top:5px;width:48px;height:48px;"><img class="x-component x-component-default" src="../icons/{iconFolder}/48/{iconFile}"></div><div style="position:relative;top:5px"><label class="x-component x-component-default" style="display: block; text-align:center;width:100px;height:40px; word-wrap:break-word;" for="">{text}</label></div><div style="font-size: 1px; width: 1px; height: 1px; display: none;"></div></div></tpl>';
            }

            if (c.itemSelector == null) {
                c.itemSelector = "div.gt-filemanager-item";
            }

            /*
            if ( c.channel != null ){
                c.subscriptionId = UGRJS.Desktop.subscribe({
                    name: c.channel,
                    callBack: me.processMessage,
                    scope: me
                });
            }
            */

            if (c.listeners == null) {
                c.listeners = {};
            }

            if (c.gListeners != null) {
                for (var name in c.gListeners) {
                    if (name != 'hasTarget') {
                        if (name == 'itemdblclick') {
                            me.allowDeselect = false;
                        }
                        c.listeners[name] = function (arg) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: '@target',
                                    value: (c.gListeners.hasTarget ? me.getId() : "")
                                }],
                                processResponse: true
                            });
                        }

                        c.listeners[name].listenerName = name;
                    }
                }
            }

            Ext.apply(c.listeners, {
                'selectionchange': me.onSelectItem,
                'itemdblclick': me.onDblClickItem,
                'afterrender': me.onCmpRender
            });
        }

        me.addEvents({
            'doubleclick': true
        });

        this.callParent(arguments);
    },

    initComponent: function () {

        var me = this;

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        /*
        this.mixins.dragSelector.init(this);
        this.mixins.draggable.init(this, {
            ddConfig: {
                ddGroup: 'organizerDD'
            },
            ghostTpl: [
                '<tpl for=".">',
                    '<img src="../view/chooser/icons/{thumb}" />',
                    '<tpl if="xindex % 4 == 0"><br /></tpl>',
                '</tpl>',
                '<div class="count">',
                    '{[values.length]} images selected',
                '<div>'
            ]
        });
        */

        me.callParent(arguments);
    },

    onCmpRender: function (view) {
        var me = this;
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;
    },

    messageId: 2,

    onDestroy: function () {
        var me = this;

        me.getStore().onDestroy();

        this.callParent(arguments);
    },

    onSelectItem: function (selModel) {
        var me = this;

        var selection = selModel.getSelection();
        if (selection.length > 0) {
            UGRJS.Desktop.setComponent(this, 'selected', selection[0].data.userFilePK, true);
        } else {
            UGRJS.Desktop.setComponent(this, 'selected', '', true);
        }

        Ext.defer(function () {
            me.fireEvent('select', me)
        }, 500);

    },

    onDblClickItem: function (view, record, item, index, e, eOpts) {
        var me = this;

        if (record.raw['userFileTypeFK_'] == '00000000000000000000000000000001' || record.raw['userFileTypeFK_'] == '00000000000000000000000000000004') {
            me.currentFolder = record.get('userFilePK');

            UGRJS.Desktop.setComponent(me, 'folder', me.currentFolder);
            Ext.defer(function () {
                me.fireEvent('folderchange', me)
            }, 100);

            if (me.gParameters == null) {
                me.gParameters = {};
            }

            me.gParameters.parent = me.currentFolder;
            me.getStore().reload();
        } else {
            Ext.defer(function () {
                me.fireEvent('doubleclick', me)
            }, 100);
        }
    },

    doRefresh: function (val) {
        var me = this;
        me.getStore().reload();
    },

    setFolder: function (val) {
        var me = this;
        me.currentFolder = val;

        if (me.gParameters == null) {
            me.gParameters = {};
        }

        me.gParameters.parent = me.currentFolder;

        me.getStore().reload();
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.view.GTShortcutView', {
    extend: 'Ext.view.View',
    alias: 'widget.shortcutview',

    requires: [
        'UGRFrontend.data.store.GTStore'
    ],

    mixins: {
        dragSelector: 'Ext.ux.DataView.DragSelector',
        draggable: 'Ext.ux.DataView.Draggable'
    },

    constructor: function (c) {
        var me = this;
        if (c.store == null) {
            var scStore = Ext.create('UGRFrontend.data.store.GTStore', {
                model: 'Ext.ux.desktop.ShortcutModel',
                service: c.service,
                channel: c.channel
            });

            c.store = scStore;

            c.trackOver = true;
            c.overItemCls = 'shortcutview-overitem';
            c.selectedItemCls = 'shortcutview-selecteditem';
            c.singleSelect = true;

            if (c.tpl == null) {
                c.tpl = '<tpl for=\".\"><div class="x-container x-container-default x-abs-layout-ct gt-shortcut-item" style="width:100px;height:100px;left:{userShortcutPosX}px;top:{userShortcutPosY}px" id="stk-id-13"><img class="x-component x-abs-layout-item x-component-default" style="left:26px;top:5px;width:48px;height:48px;" id="stk-id-11" src="../icons/{applicationModuleIconFolder}/48/{applicationModuleIcon}"><label class="x-component x-abs-layout-item x-component-default" style="text-align:center;left:0px;top:60px;width:100px;height:40px;" id="stk-id-12" for="">{userShortcutTitle}</label><div id="stk-id-13-overflowPadderEl" style="font-size: 1px; width: 1px; height: 1px; display: none;"></div></div></tpl>';
            }

            if (c.itemSelector == null) {
                c.itemSelector = "div.gt-shortcut-item";
            }

            /*
            if ( c.channel != null ){
                c.subscriptionId = UGRJS.Desktop.subscribe({
                    name: c.channel,
                    callBack: me.processMessage,
                    scope: me
                });
            }
            */

            if (c.listeners == null) {
                c.listeners = {};
            }

            Ext.apply(c.listeners, {
                'selectionchange': me.onSelectShortcut
            });
        }

        this.callParent(arguments);
    },

    initComponent: function () {

        var me = this;

        // me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;

        this.mixins.dragSelector.init(this);
        this.mixins.draggable.init(this, {
            ddConfig: {
                ddGroup: 'organizerDD'
            },
            ghostTpl: [
                '<tpl for=".">',
                '<img src="../view/chooser/icons/{thumb}" />',
                '<tpl if="xindex % 4 == 0"><br /></tpl>',
                '</tpl>',
                '<div class="count">',
                '{[values.length]} images selected',
                '<div>'
            ]
        });

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        if (owner != null) {
            while (owner.xtype != 'window') {
                owner = owner.ownerCt;
            }
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    messageId: 2,

    onDestroy: function () {
        var me = this;

        me.getStore().onDestroy();

        this.callParent(arguments);
    },

    onSelectShortcut: function (selModel) {
        var selection = selModel.getSelection();
        if (selection.length > 0) {
            UGRJS.Desktop.setComponent(this, 'selected', selection[0].data.userShortcutPK);
        }
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTGridColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.mgridcolumn',

    initComponent: function () {

        var me = this;

        me.on('resize', me.gridResize, me);
        me.on('hide', me.gridHide, me);
        me.on('show', me.gridShow, me);

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);

        this.renderCompleted = false;
    },

    gridResize: function (col, nWidth) {
        if (this.renderCompleted) {
            UGRJS.Desktop.setComponent(this, 'width', nWidth);
        }

        this.renderCompleted = true;
    },

    gridHide: function (col) {
        if (this.renderCompleted) {
            UGRJS.Desktop.setComponent(this, 'hidden', true);
        }

        this.renderCompleted = true;
    },

    gridShow: function (col) {
        if (this.renderCompleted) {
            UGRJS.Desktop.setComponent(this, 'hidden', false);
        }

        this.renderCompleted = true;
    },

    setHidden: function (value) {
        this.setVisible(!value);
    }
});


/*!
 * GTGrid is an extended version for ExtJS 4.0 Grid Panel.
 * Specifically extended to use with ARK Server
 */

Ext.define('UGRFrontend.desktop.GTGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.mgrid',

    requires: [
        'Ext.ux.grid.FiltersFeature',
        'UGRFrontend.data.model.Dynamic',
        'UGRFrontend.data.store.GTStore'
    ],

    statics: {
        STATUSICONS: {
            'CHANGED': '../icons/actions/16/format-text-direction-ltr.png',
            'INSERTED': '../icons/actions/16/list-add.png',
            'DELETED': '../icons/actions/16/edit-delete.png',
        }
    },

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true,
            'afterrowedit': true,
            'afterload': true
        });

        if (c.multiSelect == true) {
            c.selModel = Ext.create('Ext.selection.CheckboxModel');
        } else {
            c.selModel = {
                allowDeselect: true
            };
        }

        /*
        Ext.applyIf(c, {
            gParameters: {
                '@viewId' : c.id,
                '@viewType' : 'grid'
            }
        });
        */

        // If no store is defined in config and service is defined
        // in config, initiate GTStore with specified service
        if (c.store == null) {
            if (c.service != null) {
                c.store = Ext.create('UGRFrontend.data.store.GTStore', {
                    // Dynamic data model is used for manipulation and
                    // generating model dynamically using the service defiend
                    model: 'UGRFrontend.data.model.Dynamic',
                    service: c.service,
                    channel: c.channel,
                    pageSize: c.storePageSize || 30,
                    // Add grid reference to store
                    relatedGrid: me,
                    listeners: {
                        beforeload: function () {
                            if (this.relatedGrid.initialConfig.lockUntilResponse) {
                                var mask = Ext.getBody().mask(this.relatedGrid.initialConfig.lockMessage || 'İşlem yapılıyor, lütfen bekleyiniz!', 'loading x-mask-msg-lock');
                                mask.dom.style.zIndex = 99999;
                            }

                            return true;
                        },
                        // If grid has a selected row, than select it after reload
                        load: function () {
                            if (this.relatedGrid.selectedPK != null) {
                                var selecteds = this.relatedGrid.selectedPK.split(';');
                                for (var k = 0; k < selecteds.length; k++) {
                                    var selectedIndex = this.find(this.idField, selecteds[k]);
                                    if (selectedIndex > -1) {
                                        this.relatedGrid.getSelectionModel().select(selectedIndex, true, true);
                                        if (this.relatedGrid.firstLoad) {
                                            Ext.defer(function () {
                                                this.relatedGrid.fireEvent('afterselect', this.relatedGrid)
                                            }, 100, this);
                                            this.relatedGrid.firstLoad = false;
                                        }
                                    } else {
                                        this.relatedGrid.selectedPK = '';
                                        UGRJS.Desktop.setComponent(this.relatedGrid, 'selected', '', true);
                                        Ext.defer(function () {
                                            this.relatedGrid.fireEvent('afterselect', this.relatedGrid)
                                        }, 100, this);
                                    }
                                }
                            }

                            if (this.relatedGrid.initialConfig.lockUntilResponse) {
                                Ext.getBody().unmask();
                            }

                            var grid = this.relatedGrid;
                            Ext.defer(function () {
                                grid.fireEvent('afterload', grid)
                            }, 200);

                        }
                    }
                });

                // Add store reference to paging toolbar
                if (c.dockedItems != null) {
                    if (c.dockedItems.length > 0) {
                        for (var k in c.dockedItems) {
                            if (c.dockedItems[k].xtype == 'pagingtoolbar') {
                                Ext.apply(c.dockedItems[k], {
                                    store: c.store,
                                    listeners: {
                                        'afterrender': function (pt) {
                                            me.addExcelExport(pt);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }

                c.columns.unshift({
                    dataIndex: '_status',
                    text: '*',
                    width: 30,
                    sortable: false,
                    menuDisabled: true,
                    resizable: false,
                    renderer: me.renderStatus
                });
            }
        }

        // If config does not have listener object
        // create it and add a row-select event to let the
        // server know about the selection change
        if (c.listeners == null) {
            c.listeners = {};

            c.listeners.itemmouseenter = function (view, record, item) {
                if (record.get('toolTip') != null) {
                    if (record.get('toolTip').length > 0) {
                        Ext.fly(item).set({
                            'data-qtip': record.get('toolTip')
                        });
                    }
                }
            };
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    if (name == 'itemdblclick') {
                        if (c.selModel.allowDeselect) {
                            c.selModel.allowDeselect = false;
                        }
                    }
                    c.listeners[name] = function (arg) {
                        if (me.ownerUuid != null) {
                            UGRJS.Desktop.runMethod({
                                cls: c.service,
                                method: c.gListeners[arguments.callee.listenerName],
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }, {
                                    key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                    value: (c.gListeners.hasTarget ? me.getId() : '')
                                }],
                                onSuccess: function (args) {
                                    var a = 5;
                                    // If there is an afterselect event registered
                                    // enable the grid after successfull load
                                    Ext.defer(function () {
                                        me.setLoading(false);
                                    }, 1000, me);
                                },
                                onFail: function (args) {
                                    // If there is an afterselect event registered
                                    // enable the grid after successfull load
                                    Ext.defer(function () {
                                        me.setLoading(false);
                                    }, 1000, me);
                                },
                                processResponse: true
                            });
                        }
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        me.maskOnLoad = c.maskOnLoad;

        me.selectColumnName = c.selectColumnName;

        var filters = [];
        if (c.columns != null) {
            for (var k in c.columns) {
                if (c.columns[k].searchable == true) {
                    var filterOps = {
                        type: c.columns[k].filterType || 'string',
                        dataIndex: c.columns[k].dataIndex
                    }

                    if (c.columns[k].filterType == "list") {
                        filterOps['options'] = c.columns[k].options;
                        filterOps['labelField'] = 'name'
                    }

                    if (c.columns[k].filterType == "date") {
                        filterOps['dateFormat'] = c.columns[k].dateFormat;
                        filterOps['active'] = true;
                    }

                    filters.push(filterOps);
                }
            }
        }

        Ext.apply(c, {
            viewConfig: {
                listeners: {
                    itemupdate: me.onRowUpdate,
                    scope: me
                },
                getRowClass: function (record, index) {
                    var status = record.get('_status');
                    if (status == 'CHANGED') {
                        return 'gtgrid-row-changed';
                    } else if (status == 'INSERTED') {
                        return 'gtgrid-row-inserted';
                    } else if (status == 'DELETED') {
                        return 'gtgrid-row-deleted';
                    } else {
                        return record.get('@style');
                    }
                }

            },
            features: [{
                ftype: 'filters',
                autoReload: true,
                local: false,
                filters: filters,
                encode: true
            }]
        });

        if (c.isEditable) {
            var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            });

            c.plugins = [cellEditing];
        }

        if (c.legendItems != null) {
            c.tools = [{
                id: c.id + '-help',
                type: 'help',
                // tooltip: c.toolTipHint || 'Lejand' ,
                handler: function (event, toolEl, panel) {
                    if (this.tip == null) {
                        this.tip = Ext.create('Ext.tip.ToolTip', {
                            html: me.renderLegendItems(),
                            anchor: 'right'
                        });
                    }
                    this.tip.setTarget(toolEl);
                    this.tip.show();
                }
            }];
        }

        me.firstLoad = true;

        this.callParent(arguments);

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);
        me.gParameters['@viewId'] = c.id;
        me.gParameters['@viewType'] = 'grid';
    },

    addExcelExport: function (pt) {
        var me = this;
        pt.add(
            '-', {
                icon: '../icons/stk/16/manipulationlog.png',
                tooltip: 'Kayıt logları...',
                listeners: {
                    click: function () {
                        me.logShow();
                    }
                }
            }
        );
        pt.add(
            '-', {
                icon: '../icons/stk/16/excel.png',
                tooltip: 'Excel\'e çıkar...',
                listeners: {
                    click: function () {
                        me.excelExport();
                    }
                }
            }
        );
    },
    logShow: function () {
        var me = this;
        var args = [{
            key: '@id',
            value: me.selectedPK
        }
        ];

        UGRJS.Desktop.runMethod({
            cls: 'com.ark.server.probe.log.ServiceManipulationlog',
            method: 'showLog',
            args: args,
            onSuccess: Ext.emptyFn,
            onFail: Ext.emptyFn,
            scope: this,
            processResponse: true
        });

    },
    excelExport: function () {
        var me = this;

        var filters = me.filters.getFilterData();
        var filterStr = "";
        for (var k = 0; k < filters.length; k++) {
            var filter = filters[k];
            if (filterStr.length > 0) {
                filterStr = filterStr + ';';
            }

            if (Ext.isArray(filter.data.value)) {
                filterStr = filterStr + filter.field + '=' + filter.data.value.join('|');
            } else {
                if (filter.data.comparison == "lt") {
                    filterStr = filterStr + filter.field + '=<' + filter.data.value;
                } else if (filter.data.comparison == "gt") {
                    filterStr = filterStr + filter.field + '=>' + filter.data.value;
                } else {
                    filterStr = filterStr + filter.field + '=' + filter.data.value;
                }

            }
        }

        //adding sort parameter for export
        var sorterParams = '';
        for (var k = 0; k < me.store.sorters.length; k++) {
            if (sorterParams != '') {
                sorterParams += ';';
            }

            var sorter = me.store.sorters.items[k];
            sorterParams += sorter.property + '=' + ((sorter.direction == 'ASC') ? 'A' : 'D');
        }

        //args.push({ 'key' : '@sort', 'value' : sorterParams});


        var args = [{
            key: '@os',
            value: me.initialConfig.service
        },
            {
                key: '@viewId',
                value: me.getId()
            },
            {
                key: '@viewType',
                value: 'grid'
            },
            {
                key: '@search',
                value: filterStr
            },
            {
                key: '@form',
                value: me.ownerUuid
            },
            {
                key: '@sort',
                value: sorterParams
            }
        ];

        for (var name in me.gParameters) {
            args.push({
                key: name,
                value: me.gParameters[name]
            });
        }

        UGRJS.Desktop.runMethod({
            cls: 'com.ark.server.probe.common.ServiceExport',
            method: 'export',
            args: args,
            onSuccess: Ext.emptyFn,
            onFail: Ext.emptyFn,
            scope: this,
            processResponse: true
        });
    },

    initComponent: function () {

        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.on('selectionchange', me.onSelectRow, me);
        me.on('expand', me.onCmpExpand, me);
        me.on('collapse', me.onCmpCollapse, me);
        me.on('edit', me.onCmpEdit);

        me.callParent(arguments);
    },

    selectedPK: null,

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.selectedPK = this.selectedPK || this.initialConfig.selected;

        this.ownerUuid = owner.uuid;
        this.ownerWindow = owner;

        this.callParent(arguments);
    },

    isReloading: false,

    onSelectRow: function (selModel) {
        var me = this;

        var selection = selModel.getSelection();
        if (selection.length > 0) {
            var selectedPKs = [];
            for (var k = 0; k < selection.length; k++) {
                if (me.selectColumnName != null) {
                    var colNames = me.selectColumnName.split(',');
                    var multiColSelection = [];
                    for (var m = 0; m < colNames.length; m++) {
                        multiColSelection.push(selection[k].data[colNames[m]]);
                    }
                    selectedPKs.push(multiColSelection.join('|'));
                } else {
                    selectedPKs.push(selection[k].data[me.getStore().idField]);
                }
            }
            me.selectedPK = selectedPKs.join(';');
            UGRJS.Desktop.setComponent(this, 'selected', me.selectedPK);
            if (me.initialConfig.gListeners['afterselect'] != null && me.maskOnLoad) {
                me.setLoading(true);
            }
            Ext.defer(function () {
                me.fireEvent('afterselect', me)
            }, 100);
        } else if (!me.isReloading) {
            me.selectedPK = null;
            UGRJS.Desktop.setComponent(this, 'selected', '');
            if (me.initialConfig.gListeners['afterselect'] != null && me.maskOnLoad) {
                me.setLoading(true);
            }
            Ext.defer(function () {
                me.fireEvent('afterselect', me)
            }, 100);
        }

        this.setDisabled(false);
    },

    onRowUpdate: function (record, index, node, eOpts) {
        var me = this;

        /*
        for ( var name in record.modified ){
            var index = me.getColumnIndex(name);
            if ( index > -1 ){
                Ext.defer( function() {
                    Ext.get(node).remove();
                }, 2000);
            }
        }
        */
    },

    getColumnIndex: function (colName) {
        var me = this;
        var gridColumns = me.headerCt.getGridColumns();
        for (var i = 0; i < gridColumns.length; i++) {
            if (gridColumns[i].dataIndex == colName) {
                return i;
            }
        }

        return -1;
    },

    renderStatus: function (val, metaData, record) {
        if (val != null && val != '') {
            var id = Ext.id();

            var changedBy = record.get('_owner');
            var status = record.get('_status');
            if (status == 'INSERTED') {
                changedBy = Ext.getCmp('generic-inserted-by').getText() + changedBy;
            } else if (status == 'DELETED') {
                changedBy = Ext.getCmp('generic-deleted-by').getText() + changedBy;
            } else if (status == 'CHANGED') {
                changedBy = Ext.getCmp('generic-edited-by').getText() + changedBy;
            }


            Ext.defer(function (imgId) {
                var tip = Ext.create('Ext.tip.ToolTip', {
                    target: imgId,
                    html: changedBy,
                    anchor: 'top'
                });
            }, 500, null, [id]);
            return '<img src="' + UGRFrontend.desktop.GTGrid.STATUSICONS[val] + '" id="' + id + '"/>';
        } else {
            return val;
        }
    },

    doRefresh: function (val) {
        var me = this;

        me.isReloading = true;
        me.getStore().loadPage(1);
       //  me.getStore().reload();
        me.isReloading = false;
    },
    doRefresh2: function (val) {
        var me = this;

        me.isReloading = true;
        // me.getStore().loadPage(1);
        me.getStore().reload();
        me.isReloading = false;
    },

    setSelected: function (selection) {
        var me = this;
        me.un('selectionchange', me.onSelectRow, me);
        var selecteds = selection.split(';');
        this.getSelectionModel().deselectAll(true);
        me.selectedPK = null;
        for (var k = 0; k < selecteds.length; k++) {
            var selectedIndex = this.getStore().find(this.getStore().idField, selecteds[k]);
            if (selectedIndex > -1) {
                this.getSelectionModel().select(selectedIndex, true, true);
            }
        }
        me.on('selectionchange', me.onSelectRow, me);
    },

    setParameter: function (parameter) {
        var me = this;

        for (var name in parameter) {
            me.gParameters[name] = parameter[name];
        }
    },

    changeExpanded: function (expanded) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (expanded) {
            me.expand();
        } else {
            me.collapse();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    changeCollapsed: function (collapsed) {
        var me = this;
        me.un('expand', me.onCmpExpand, me);
        me.un('collapse', me.onCmpCollapse, me);

        if (collapsed) {
            me.collapse();
        } else {
            me.expand();
        }

        Ext.defer(function () {
            me.on('expand', me.onCmpExpand, me);
            me.on('collapse', me.onCmpCollapse, me);
        }, 1000);
    },

    onCmpExpand: function (pnl) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'collapsed', 'false', true);
    },

    onCmpCollapse: function (pnl) {
        var me = this;
        Ext.defer(function () {
            UGRJS.Desktop.setComponent(me, 'collapsed', 'true', true);
        }, 500);
    },

    renderLegendItems: function () {
        var me = this;
        output = [];
        if (me.initialConfig.legendItems != null) {
            for (var k = 0; k < me.initialConfig.legendItems.length; k++) {
                var legendItem = me.initialConfig.legendItems[k];
                output.push('<div style="width:16px; height:16px; float: left; margin-right:5px; border-width:1px; border-style:solid; background-color: #' + legendItem.color + '"></div><div style="float: left">' + legendItem.title + '</div><div style="height:4px; clear:both;"></div>');
            }
        }

        return output.join('');
    },


    onCmpEdit: function (editor, e) {
        var me = this;
        // alert(e.record.get(e.record.get('@id')) + ' :' + e.field + ' changed from ' + e.originalValue + ' to ' + e.value);

        var displayValue = e.value;
        if (e.column.initialConfig.editor.xtype == 'combobox') {
            var store = e.column.initialConfig.editor.store;
            for (var k = 0; k < store.length; k++) {
                if (store[k][0] == e.value) {
                    displayValue = store[k][1];
                    e.record.set(e.field, displayValue);

                    //set changeRecord;
                    var listener = me.gListeners.afterrowedit;
                    if (listener != null) {
                        if (listener.length > 0) {
                            me.setLoading(true);
                        }
                    }

                    UGRJS.Desktop.setComponentCallBack(
                        this,
                        'changed',
                        e.record.get(e.record.get('@id')) + ';' + e.field + ';' + e.value,
                        function () {
                            me.fireEvent('afterrowedit', me)
                        }
                    );
                }
            }
        } else if (e.column.initialConfig.editor.xtype == "mcellsearchbox") {
            var store = e.column.initialConfig.editor.store
            displayValue = store.relatedSearchBox.displayTplData[0][store.idField];
            /*var items = store.data.items;
            for ( var k = 0; k < items.length; k ++ ){
                if (items[k].data[displayedField] == e.value){
                    displayValue = items[k].data[items[k]["@id"]];*/
            //e.record.set(e.field, displayValue);

            //set changeRecord; bug optimisation for editing
            if (displayValue != null) {
                var listener = me.gListeners.afterrowedit;
                if (listener != null) {
                    if (listener.length > 0) {
                        me.setLoading(true);
                    }
                }

                UGRJS.Desktop.setComponentCallBack(
                    this,
                    'changed',
                    e.record.get(e.record.get('@id')) + ';' + e.field + ';' + displayValue,
                    function () {
                        me.fireEvent('afterrowedit', me)
                    }
                );
            }
        } else if (e.column.initialConfig.editor.xtype == 'datefield') {
            displayValue = Ext.Date.format(displayValue, e.column.initialConfig.editor.format);
            e.record.set(e.field, displayValue);
            UGRJS.Desktop.setComponentCallBack(
                this,
                'changed',
                e.record.get(e.record.get('@id')) + ';' + e.field + ';' + displayValue,
                function () {
                    me.fireEvent('afterrowedit', me)
                }
            );
            //UGRJS.Desktop.setComponent(this, 'changed', e.record.get(e.record.get('@id')) + ';' + e.field + ';' + displayValue);
        } else {
            UGRJS.Desktop.setComponentCallBack(
                this,
                'changed',
                e.record.get(e.record.get('@id')) + ';' + e.field + ';' + e.value,
                function () {
                    me.fireEvent('afterrowedit', me)
                }
            );
            //UGRJS.Desktop.setComponent(this, 'changed', e.record.get(e.record.get('@id')) + ';' + e.field + ';' + e.value);
        }


    },

    changeRecord: function (changes) {

        var store = this.getStore();
        if (store.getCount() > 0) {
            var sampleRecord = this.getStore().getAt(0);
            var primaryKey = sampleRecord.get('@id');

            for (var k = 0; k < changes.length; k++) {
                var change = changes[k];

                var row = store.findRecord(primaryKey, change.pk);
                if (row != null) {
                    row.set(change.field, change.value);
                }
            }
        }
        isRowEdited = false;
    },

    setHidden: function (val) {
        this.setVisible(!val);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTImage', {
    extend: 'Ext.Img',
    alias: 'widget.mimage',

    initComponent: function () {

        var me = this;

        /*
        me.icon = '../icons/'  + me.iconFolder + '/16/' + me.iconFile;
        */

        me.callParent(arguments);
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (val) {
        this.setVisible(!val);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.mcombo',

    translateables: [],

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        if (c.comboData != null) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['key', 'value', 'parent'],
                data: c.comboData
            });
            //alert('setComboData' + c.comboData.length);
            //alert(JSON.stringify(c.comboData));
            /*  console.log(JSON.stringify(c.comboData))
              console.log(c)

              if(c.argumentName == "bedFK"){
                  for (var k = 0; k < c.comboData.length; k++) {
                      if(c.comboData[k].key == "00000000000000000000000000000063" && c.comboData[k].value == "Tamamı") {
                          c.comboData[k].key = "99"
                      }else{
                          c.comboData[k].key = c.comboData[k].value
                      }
                      if(c.value == c.comboData[k].key){
                          c.selectedValue = c.comboData[k].value
                          c.selectedIndex = k
                          console.log("c.selectedValue: " + c.selectedValue)
                      }
                  }
              }*/

            /*  console.log(JSON.stringify(c.comboData))
              console.log(c)*/

            c.store = store;
            c.displayField = 'value';
            c.valueField = 'key';
            c.queryMode = 'local';
            if ((c.value == null || c.value == 'null') && (c.comboData.length > 0)) {
                c.value = c.comboData[0].key;
            }

            for (var k = 0; k < c.comboData.length; k++) {
                if (c.comboData[k].translateable) {
                    var trb = {
                        gtype: 'translateable',
                        id: c.id,
                        key: c.comboData[k].translateableKey,
                        pName: 'cmb-' + c.comboData[k].key,
                        value: c.comboData[k].value
                    };

                    UGRJS.Desktop.registerTranslateable(trb);
                    me.translateables.push(trb);
                }
            }
        }

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on('select', me.onCmpChangeValue, me);
        me.on('destroy', me.onCmpDestroy, me);

        me.callParent(arguments);
    },

    onCmpChangeValue: function () {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'value', this.getValue(), true);
        Ext.defer(function () {
            me.fireEvent('afterselect', me);
        }, 100, me);

        // alert('setComboData' +  this.getValue() + ' ' + this.getRawValue() + ' ' + this.getDisplayValue() + ' ' + this.getId());
        this.callParent(arguments);
    },

    onCmpDestroy: function () {
        var me = this;
        for (var k = 0; k < me.translateables.length; k++) {
            UGRJS.Desktop.unregisterTranslateable(me.translateables[k]);
        }

        return true;
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setComboData: function (data) {

        var me = this;

        var newStore = Ext.create('Ext.data.Store', {
            fields: ['key', 'value', 'parent'],
            data: []
        });

        for (var k = 0; k < data.length; k++) {
            newStore.add(data[k]);

            if (data.translateable) {
                var trb = {
                    gtype: 'translateable',
                    id: me.getId(),
                    key: data.translateableKey,
                    pName: 'cmb-' + data.key,
                    value: data.value
                };

                UGRJS.Desktop.registerTranslateable(trb);
                me.translateables.push(trb);
            }
        }

        this.store.loadData(newStore.getRange(), false);
    },

    setHidden: function (hidden) {
        var me = this;
        me.setVisible(!hidden);
    },

    /*
    setComboData: function(cData){
        var me = this;
    	
        me.getStore().removeAll();
        me.getStore().add(cData);
    },
    */

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTSearchBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.msearchbox',

    translateables: [],

    constructor: function (c) {
        var me = this;

        me.addEvents({
            'afterselect': true
        });

        if (c.service != null) {
            c.store = Ext.create('UGRFrontend.data.store.GTStore', {
                // Dynamic data model is used for manipulation and
                // generating model dynamically using the service defiend
                model: 'UGRFrontend.data.model.Dynamic',
                service: c.service,
                // Add searchbox reference to store
                relatedSearchBox: me,
                listeners: {
                    beforeload: function () {
                        return true;
                    },
                    load: function () {

                    }
                }
            });
        }


        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.displayField == null) {
            c.displayField = "title";
        }

        c.typeAhead = false;
        c.hideTrigger = true;
        c.value = '';

        c.listConfig = {
            loadingText: c.loadingText,
            emptyText: c.emptyText,

            // Custom rendering template for each item
            getInnerTpl: function () {
                return '{' + c.displayField + '}';
            }
        };
        c.pageSize = 10;

        me.gParameters = {};
        Ext.applyIf(me.gParameters, c.gParameters);

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.on('select', me.onCmpChangeValue, me);
        me.on('destroy', me.onCmpDestroy, me);

        me.callParent(arguments);
    },

    onCmpChangeValue: function (combo, records) {
        var me = this;

        if (records.length > 0) {
            var value = records[0].data[me.getStore().idField];
            UGRJS.Desktop.setComponent(this, 'value', value, true);
        } else {
            UGRJS.Desktop.setComponent(this, 'value', '', true);
        }

        Ext.defer(function () {
            me.fireEvent('afterselect', me);
        }, 100, me);


        this.callParent(arguments);
    },

    onCmpDestroy: function () {
        var me = this;
        for (var k = 0; k < me.translateables.length; k++) {
            UGRJS.Desktop.unregisterTranslateable(me.translateables[k]);
        }

        return true;
    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);
    },

    setHidden: function (hidden) {
        var me = this;
        me.setVisible(!hidden);
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    }
});

/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTWindow', {
    extend: 'Ext.window.Window',

    initComponent: function () {
        var me = this;

        me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;

        me.callParent(arguments);
        me.on('move', me.changePosition, me);
        me.on('resize', me.changeSize, me);
        me.on('maximize', me.onMaximized, me);
        me.on('restore', me.onRestored, me);


    },

    constructor: function (c) {
        var me = this;


        me.addEvents({
            'clickhelp': true,
            'onClose': true
        });

        /*
        if ( ! myDesktopApp.gtWindowInitialized ){
            $.getScript( "../UGRJS/plugin/jquery-print.js");
        
            myDesktopApp.gtWindowInitialized = true;
        }
        */


        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.uuid
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.styleSheets != null) {
            for (var name in c.styleSheets) {
                this.createCSSClass(name, c.styleSheets[name]);
            }
        }

        if (Ext.isArray(c.tools)) {
            for (var tool in c.tools) {
                if (tool.type == 'help') {
                    alert('help found');
                }
            }

        }

        if (c.tools != null) {
            var helpTool = null;
            for (var k = 0; k < c.tools.length; k++) {
                if (c.tools[k].type == "help") {
                    helpTool = c.tools[k];
                }
            }

            if (helpTool != null) {
                helpTool.handler = function (event, toolEl, panel) {
                    me.fireEvent('clickhelp', me);
                }
            }
        }

        this.callParent(arguments);
    },

    changePosition: function (win, x, y) {
        var me = this;
        if (!me.maximized) {
            if (x) {
                UGRJS.Desktop.setComponent(me, 'x', x, true);
            }

            if (y) {
                Ext.defer(function () {
                    UGRJS.Desktop.setComponent(me, 'y', y, true);
                }, 200);
            }
        }
    },

    changeSize: function (win, width, height) {
        var me = this;
        if (!me.maximized) {
            if (width) {
                UGRJS.Desktop.setComponent(me, 'width', width, true);
            }

            if (height) {
                Ext.defer(function () {
                    UGRJS.Desktop.setComponent(me, 'height', height, true);
                }, 200);
            }
        }
    },

    onMaximized: function (win) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'maximized', 'true', true);
    },

    onRestored: function (win) {
        var me = this;
        UGRJS.Desktop.setComponent(me, 'maximized', 'false', true);
    },

    setClosed: function (closed) {
        var me = this;
        if (closed) {
            me.close();
        }
    },

    createCSSClass: function (selector, style) {
        if (!document.styleSheets) {
            return;
        }

        if (document.getElementsByTagName("head").length == 0) {
            return;
        }

        var stylesheet;
        var mediaType;
        if (document.styleSheets.length > 0) {
            for (i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].disabled) {
                    continue;
                }
                var media = document.styleSheets[i].media;
                mediaType = typeof media;

                if (mediaType == "string") {
                    if (media == "" || (media.indexOf("screen") != -1)) {
                        styleSheet = document.styleSheets[i];
                    }
                } else if (mediaType == "object") {
                    try {
                        if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                            styleSheet = document.styleSheets[i];
                        }
                    } catch (e) {

                    }
                }

                if (typeof styleSheet != "undefined") {
                    break;
                }
            }
        }

        if (typeof styleSheet == "undefined") {
            var styleSheetElement = document.createElement("style");
            styleSheetElement.type = "text/css";

            document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

            for (i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].disabled) {
                    continue;
                }
                styleSheet = document.styleSheets[i];
            }

            var media = styleSheet.media;
            mediaType = typeof media;
        }

        if (mediaType == "string") {
            for (i = 0; i < styleSheet.rules.length; i++) {
                try {
                    if (styleSheet.rules[i].selectorText != null) {
                        if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                            styleSheet.rules[i].style.cssText = style;
                            return;
                        }
                    }
                } catch (ex) {
                }
            }

            styleSheet.addRule(selector, style);
        } else if (mediaType == "object") {
            for (i = 0; i < styleSheet.cssRules.length; i++) {
                try {
                    if (styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                        styleSheet.cssRules[i].style.cssText = style;
                        return;
                    }
                } catch (ex) {
                }
            }

            styleSheet.insertRule(selector + "{" + style + "}", 0);
        }
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition()[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition()[0], y);
        me.on('move', me.changePosition, me);
    },

    setMaximized: function (v) {
        var me = this;
        me.un('maximize', me.onMaximized, me);
        me.un('restore', me.onRestored, me);
        if (v) {
            me.maximize();
        } else {
            me.restore();
        }
        me.on('restore', me.onRestored, me);
        me.on('maximize', me.onMaximized, me);
    },

    setCmpWidth: function (w) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setWidth(w);
        me.on('resize', me.changeSize, me);
    },

    setCmpHeight: function (h) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setHeight(h);
        me.on('resize', me.changeSize, me);
    },

    openUrl: function (url) {
        window.open(url, '_blank');
    },

    printComponent: function (elId) {
        var me = this;

        var cmp = Ext.getCmp(elId);
        if (cmp != null) {
            var targetElement = cmp;
            var frames = $('iframe', targetElement.body.dom);

            var myWindow = window.open('', '', 'scrollbars=1,width=700,height=400');
            myWindow.document.write('<html><head>');
            myWindow.document.write('<title>' + 'Yazdırma' + '</title>');


            if (frames.length > 0) {
                var iFrameHead = frames[0].contentDocument || frames[0].contentWindow.document;
                var contentHead = iFrameHead.getElementsByTagName('head')[0].innerHTML;
                myWindow.document.write(contentHead);
            } else {
                myWindow.document.write('<link rel="Stylesheet" type="text/css" href="http://dev.sencha.com/deploy/ext-4.0.1/resources/css/ext-all.css" />');
                myWindow.document.write('<script type="text/javascript" src="http://dev.sencha.com/deploy/ext-4.0.1/bootstrap.js"></script>');
                myWindow.document.write(targetElement.body.dom.innerHTML);
            }

            myWindow.document.write('</head><body>');


            if (frames.length > 0) {
                var iFrameBody = frames[0].contentDocument || frames[0].contentWindow.document;
                var content = iFrameBody.getElementsByTagName('body')[0].innerHTML;
                myWindow.document.write(content);
            } else {
                myWindow.document.write(targetElement.body.dom.innerHTML);
            }
            myWindow.document.write('</body></html>');


            if (frames.length > 0) {
                Ext.defer(function () {
                    frames[0].contentWindow.focus();
                    frames[0].contentWindow.print();
                }, 500);
            } else {

            }


        } else {
            alert('Yazdırılacak bileşen bulunamadı. Bileşen ID:' + elId);
        }

    }

    /*,
    
    enableAll: function(){
        var me = this;
        Ext.defer(
            function() {
                this.enable();
            },
            1000,
            me
        );
    } */
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTTextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.mtextareafield',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'startedit': true,
            'stopedit': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.height == null) {
            c.height = 60;
        }

        this.initConfig(c);

        this.callParent(arguments);
    },

    onBlur: function () {
        if (this.codeMirror != null) {
            UGRJS.Desktop.setComponent(this, 'value', this.codeMirror.getValue());
        } else {
            UGRJS.Desktop.setComponent(this, 'value', this.getValue());
        }

        this.callParent(arguments);
    },

    onRender: function () {
        var me = this;
        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);

        if (this.initialConfig.codeMirror != null) {
            me.codeMirror = CodeMirror.fromTextArea(this.inputEl.dom, {
                lineNumbers: true
            });

            CodeMirror.on(me.codeMirror, 'blur', function () {
                me.onBlur();
            });
        }
    },

    canFireEdit: true,

    onKeyPress: function (e) {
        var me = this;

        if (me.canFireEdit) {
            me.fireEvent('startedit', me);
            me.canFireEdit = false;
            Ext.defer(me.setFireEdit, 5000, me);
        }
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    setFireEdit: function () {
        var me = this;
        me.canFireEdit = true;
        me.fireEvent('stopedit', me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTTextField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.mtextfield',

    constructor: function (c) {
        var me = this;

        this.addEvents({
            'startedit': true,
            'stopedit': true,
            'enterkey': true,
            'altkey': true
        });

        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    if (name == 'startedit' || name == 'stopedit') {
                        c.enableKeyEvents = true;
                    }

                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        if (c.maskRe != null) {
            c.maskRe = new RegExp(c.maskRe);
        }

        if (c.currencyFormat != null) {
            c.maskRe = /^[0-9,.]$/;

            me.dSeparator = c.currencyFormat.dSeparator;
            me.tSeparator = c.currencyFormat.tSeparator;

            me.acceptsCurrencyInput = true;

            if (c.currencyFormat.tSeparator == '.') {
                me.replaceRegExp = /\./g;
            } else if (c.currencyFormat.tSeparator == ',') {
                me.replaceRegExp = /,/g;
            }

            me.currencyPrefix = c.currencyFormat.currencyPrefix;
            me.currencySuffix = c.currencyFormat.currencySuffix;

            if (me.currencyPrefix) {
                me.currencyPrefixRx = new RegExp(me.currencyPrefix, "g");
            }

            if (me.currencySuffix) {
                me.currencySuffixRx = new RegExp(me.currencySuffix, "g");
            }
        }

        me.callParent(arguments);
    },

    initComponent: function () {

        var me = this;

        me.on('specialkey', me.onSpecialKeyPress);
        me.on('afterrender', me.afterCmpRender);

        me.callParent(arguments);
    },

    onSpecialKeyPress: function (f, e) {
        var me = this;
        if (e.getKey() == e.ENTER) {
            UGRJS.Desktop.setComponent(this, 'value', this.getValue());
            Ext.defer(
                function () {
                    if (me.id == 'login-text-password' || me.id == 'login-text-userName') {
                        UGRJS.Desktop.runMethod({
                            cls: 'alba.system.projects.sys.services.auth.LoginService',
                            method: 'login',
                            processResponse: true,
                            onSuccess: function (msg) {
                                Ext.getCmp('login').close();
                                UGRJS.Desktop.onLogin(msg);
                            },
                            onFail: function (msg) {
                                Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
                            }
                        });
                    } else {
                        me.fireEvent('enterkey', me);
                    }
                },
                100,
                me
            );
        } else if (e.altKey == true) {
            me.fireEvent('altkey', me);
        }
    },

    onBlur: function () {
        var me = this;

        UGRJS.Desktop.setComponent(this, 'value', this.getValue(), true);

        Ext.defer(function () {
            me.fireEvent('stopedit', me);
        }, 300, me);

        this.callParent(arguments);
    },

    onRender: function () {
        var me = this;

        var owner = this.ownerCt;
        while (owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        this.ownerUuid = owner.uuid;

        this.callParent(arguments);


    },

    afterCmpRender: function (cmp, opts) {
        var me = this;

        if (me.initialConfig.background != null) {
            me.setBackground(me.initialConfig.background);
        }
    },

    setHidden: function (val) {
        this.setVisible(!val);
    },

    canFireEdit: true,

    onKeyPress: function (e) {
        var me = this;

        if (me.canFireEdit) {
            me.fireEvent('startedit', me);
            me.canFireEdit = false;
            Ext.defer(me.setFireEdit, 5000, me);
        }
    },

    setFireEdit: function () {
        var me = this;
        me.canFireEdit = true;

        UGRJS.Desktop.setComponent(this, 'value', this.getValue());
        Ext.defer(function () {
            me.fireEvent('stopedit', me);
        }, 300, me);
    },

    // private
    filterKeys: function (e) {
        /*
         * On European keyboards, the right alt key, Alt Gr, is used to type certain special characters.
         * JS detects a keypress of this as ctrlKey & altKey. As such, we check that alt isn't pressed
         * so we can still process these special characters.
         */
        if (e.ctrlKey && !e.altKey) {
            return;
        }
        var key = e.getKey(),
            charCode = String.fromCharCode(e.getCharCode());

        if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))) {
            return;
        }

        if ((!Ext.isGecko && !Ext.isOpera) && e.isSpecialKey() && !charCode) {
            return;
        }

        if (!this.acceptsCurrencyInput) {
            if (!this.maskRe.test(this.getValue() + charCode)) {
                if (this.inputEl.dom.selectionStart < this.inputEl.dom.selectionEnd) {
                    if (!this.maskRe.test(charCode)) {
                        e.stopEvent();
                    }
                } else {
                    e.stopEvent();
                }
            }
        }
    },

    setX: function (x) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(x, me.getPosition(true)[1]);
        me.on('move', me.changePosition, me);
    },

    setY: function (y) {
        var me = this;
        me.un('move', me.changePosition, me);
        me.setPosition(me.getPosition(true)[0], y);
        me.on('move', me.changePosition, me);
    },

    setBackground: function (color) {
        var me = this;

        me.inputEl.dom.style.backgroundImage = 'none';
        me.inputEl.dom.style.backgroundColor = color;

    },

    getErrors: function (value) {
        var me = this;

        var valueLength = value.length;

        if (me.acceptsCurrencyInput) {
            var intPart = "";
            var decPart = "";

            var hasDecimal = false;

            if ((me.currencyPrefix != null) || (me.currencySuffix != null)) {
                value = value.replace(/[^0-9,.]/gi, '');
            }

            if (value.indexOf(me.dSeparator) != -1) {
                var decimalParts = value.split(me.dSeparator);
                intPart = decimalParts[0];
                decPart = decimalParts[1];
                hasDecimal = true;
            } else {
                intPart = value;
            }

            intPart = intPart.replace(me.replaceRegExp, '');

            var newIntPart = "";
            for (var k = 1; k <= intPart.length; k++) {
                newIntPart = intPart.substr(intPart.length - k, 1) + newIntPart;

                if (((k) % 3) == 0 && k != intPart.length) {
                    newIntPart = me.tSeparator + newIntPart;
                }
            }

            if (hasDecimal) {
                value = newIntPart + me.dSeparator + decPart;
            } else {
                value = newIntPart;
            }

            if (me.previousValue) {
                if ((valueLength < me.previousValue.length) && valueLength > 1) {
                    value = value.substring(0, value.length - 1);
                }
            }

            value = (me.currencyPrefix || '') + value + (me.currencySuffix || '');

            me.setRawValue(value);

            me.previousValue = value;
        }

        return me.callParent(arguments);
    },

    setCmpWidth: function (w) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setWidth(w);
        me.on('resize', me.changeSize, me);
    },

    setCmpHeight: function (h) {
        var me = this;
        me.un('resize', me.changeSize, me);
        me.setHeight(h);
        me.on('resize', me.changeSize, me);
    }
});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GTButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.mbutton',

    constructor: function (c) {
        var me = this;


        if (c.listeners == null) {
            c.listeners = {};
        }

        if (c.gListeners != null) {
            for (var name in c.gListeners) {
                if (name != 'hasTarget') {
                    c.listeners[name] = function (arg) {
                        UGRJS.Desktop.runMethod({
                            cls: c.service,
                            method: c.gListeners[arguments.callee.listenerName],
                            args: [{
                                key: '@form',
                                value: me.ownerUuid
                            }, {
                                key: (c.gListeners.hasTarget ? '@target' : '@notarget'),
                                value: (c.gListeners.hasTarget ? me.getId() : "")
                            }],
                            processResponse: true
                        });
                    }

                    c.listeners[name].listenerName = name;
                }
            }
        }

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        if (me.iconFolder != null && me.iconFile != null) {
            me.icon = '../icons/' + me.iconFolder + '/16/' + me.iconFile;
        }

        me.callParent(arguments);
    },


    onClick: function () {
        var me = this;
        if (!me.disabled) {
            if (me.initialConfig.lockUntilResponse) {
                var mask = Ext.getBody().mask(me.initialConfig.lockMessage || 'İşlem yapılıyor, lütfen bekleyiniz!', 'loading x-mask-msg-lock');
                mask.dom.style.zIndex = 99999;
            }

            if (this.method != null) {
                UGRJS.Desktop.runMethod({
                    cls: this.service,
                    method: this.method.name,
                    processResponse: true,
                    onSuccess: function (msg) {
                        if (me.method.name == 'login') {
                            Ext.getCmp('login').close();
                            UGRJS.Desktop.onLogin(msg);
                        }
                    },
                    onFail: function (msg) {
                        Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
                    }
                });
            } else if (this.formMethod != null) {
                if (this.confirmMessage != null) {
                    if (me.initialConfig.lockUntilResponse) {
                        Ext.getBody().unmask();
                    }

                    Ext.MessageBox.confirm('', this.confirmMessage, function (btn) {
                        if (me.initialConfig.lockUntilResponse) {
                            var mask = Ext.getBody().mask(me.initialConfig.lockMessage || 'İşlem yapılıyor, lütfen bekleyiniz!', 'loading x-mask-msg-lock');
                            mask.dom.style.zIndex = 99999;
                        }

                        if (btn === 'yes') {
                            UGRJS.Desktop.runMethod({
                                cls: me.service,
                                method: me.formMethod,
                                args: [{
                                    key: '@form',
                                    value: me.ownerUuid
                                }],
                                processResponse: true,
                                onSuccess: function (msg) {
                                    if (me.initialConfig.lockUntilResponse) {
                                        Ext.getBody().unmask();
                                    }
                                }
                            });
                        } else {
                            Ext.getBody().unmask();
                        }
                    });
                } else {
                    UGRJS.Desktop.runMethod({
                        cls: me.service,
                        method: me.formMethod,
                        args: [{
                            key: '@form',
                            value: me.ownerUuid
                        }],
                        processResponse: true,
                        onSuccess: function (msg) {
                            if (me.initialConfig.lockUntilResponse) {
                                Ext.getBody().unmask();
                            }
                        }
                    });
                }
            } else if (this.action != null) {
                // alert('calling action: ' + this.service + ' : ' + this.action );
                UGRJS.Desktop.runAction({
                    cls: this.service,
                    action: this.action,
                    args: [{
                        key: '@form',
                        value: this.ownerUuid
                    }],
                    processResponse: true
                });
            }
        }

        this.callParent(arguments);

    },

    onRender: function () {
        var owner = this.ownerCt;
        while (owner != null && owner.xtype != 'window') {
            owner = owner.ownerCt;
        }

        if (owner != null) {
            this.ownerUuid = owner.uuid;
            this.ownerWindow = owner;
        }

        this.callParent(arguments);
    },

    setPressed: function (pressed) {
        this.toggle(pressed, true);
    },

    setHidden: function (value) {
        this.setVisible(!value);
    }

});


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.GenericModule', {
    extend: 'Ext.ux.desktop.Module',

    id: 'UGRJS-module-',
    title: 'Generic Module',

    requires: [
        'UGRFrontend.desktop.GTButton',
        'UGRFrontend.desktop.GTTextField',
        'UGRFrontend.desktop.GTTextArea',
        'UGRFrontend.desktop.GTWindow',
        'UGRFrontend.desktop.GTComboBox',
        'UGRFrontend.desktop.GTSearchBox',
        'UGRFrontend.desktop.GTPanel',
        'UGRFrontend.desktop.GTCall',
        'UGRFrontend.desktop.GTImage',
        'UGRFrontend.desktop.GTGrid',
        'UGRFrontend.desktop.GTGridColumn',
        'UGRFrontend.desktop.view.GTChatView',
        'UGRFrontend.desktop.view.GTShortcutView',
        'UGRFrontend.desktop.view.GTFileManager',
        'UGRFrontend.desktop.GTTree',
        'UGRFrontend.desktop.GTDateField',
        'UGRFrontend.desktop.GTTrigger',
        'UGRFrontend.desktop.GTHiddenField',
        'UGRFrontend.desktop.GTChart',
        'UGRFrontend.desktop.GTToolbar',
        'UGRFrontend.desktop.GTLabel',
        'UGRFrontend.desktop.GTRadio',
        'UGRFrontend.desktop.GTColorPicker',
        'UGRFrontend.desktop.GTMap',
        'UGRFrontend.desktop.GTPolygon',
        'UGRFrontend.desktop.GTPolyline',
        'UGRFrontend.desktop.GTMapMarker',
        'UGRFrontend.desktop.GTSlider',
        'UGRFrontend.desktop.GTFieldset',
        'UGRFrontend.desktop.GTRegionSchedule',
        'UGRFrontend.desktop.GTDrawing',
        'UGRFrontend.desktop.GTSplit',
        'UGRFrontend.desktop.GTFileField',
        'UGRFrontend.desktop.GTHtmlEditor',
        'UGRFrontend.desktop.GTDisplay',
        'Ext.toolbar.Spacer',
        'UGRFrontend.desktop.GTCalendar',
        'UGRFrontend.desktop.GTNumberField',
        'UGRFrontend.desktop.GTCellTextField',
        'UGRFrontend.desktop.GTCellNumberField',
        'UGRFrontend.desktop.GTFlow',
        'UGRFrontend.desktop.GTTab',
        'UGRFrontend.desktop.GTCheckBox',
        'UGRFrontend.desktop.GTCellSearchBox'
    ],

    init: function () {
        this.launcher = {
            text: this.title,
            iconCls: 'icon-grid'
        };
    },

    constructor: function (c) {
        var me = this;

        me.translateables = [];

        this.registerTranslateables(c);

        c.listeners = {
            activate: function (win) {
                if (!UGRJS.Desktop.inSync) {
                    UGRJS.Desktop.activateForm(win);
                }
            },
            beforeclose: function (win) {
                me.unregisterTranslateables();

                return true;
            }
        };

        this.callParent();
        this.initConfig(c);
        this.id = c.id;
        this.title = c.title;
    },

    registerTranslateables: function (config) {
        var me = this;

        for (var pName in config) {
            var prop = config[pName];
            if (Ext.isObject(prop)) {
                if (prop.gtype == "translateable") {
                    prop.id = config.id;
                    prop.pName = pName;
                    me.translateables.push(prop);
                    UGRJS.Desktop.registerTranslateable(prop);
                    /*
                    prop.toString = function(){
                        return this.value;
                    } */
                    config[pName] = prop.value;
                } else {
                    me.registerTranslateables(prop);
                }
            } else if (Ext.isArray(prop)) {
                for (var k = 0; k < prop.length; k++) {
                    me.registerTranslateables(prop[k]);
                }
            }
        }
    },

    unregisterTranslateables: function () {
        var me = this;
        for (var k = 0; k < me.translateables.length; k++) {
            UGRJS.Desktop.unregisterTranslateable(me.translateables[k]);
        }
    },

    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(this.id);
        if (!win) {
            win = desktop.createWindow(
                this.config,
                UGRFrontend.desktop.GTWindow
            );
        }
        return win;
    },

    statics: {}
});


/*!
 * UGRJS Library v.0.9
 * Copyright(c) 2024 ALBATROS
 * ugur.isik@alarmsansavunma.com.tr
  
 */

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Ext.define('UGRFrontend.net.WsConnector', {
    extend: 'Ext.util.Observable',

    config: {
        port: '1445',
        host: 'self',
        application: 'ugur'
    },

    statics: {
        TOKEN_REPLY: ">",
        TOKEN_ACK: "+",
        TOKEN_REQ_ID: "MID:",
        TOKEN_END: " ",
        GOAHEAD: "GoAhead.",
        OK: "OK.",
        ACTIVATED: "Activated.",
        SET: "Set.",
        SENT: "Sent."
    },

    uri: '',

    socket: null,

    constructor: function (c) {
        this.addEvents({
            'connect': true,
            'receive': true,
            'close': true,
            'serverresponse': true,
            'error': true
        });

        this.listeners = c.listeners;
        this.initConfig(c);

        if (this.config.host == 'self') {
            var loc = window.location,
                new_uri;
            if (loc.protocol === "https:") {
                new_uri = "wss:";
            } else {
                new_uri = "ws:";
            }
            new_uri += "//" + loc.host + "/" + this.config.application;
            this.uri = new_uri;
        } else {
            this.uri = 'ws://' + this.config.host + ':' + this.config.port + '/' + this.config.application;
        }

        this.callParent(arguments);

        this.initialize();

        this.docCookies = {
            getItem: function (sKey) {
                if (!sKey || !this.hasItem(sKey)) {
                    return null;
                }
                return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },
            setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                    return;
                }
                var sExpires = "";
                if (vEnd) {
                    switch (vEnd.constructor) {
                        case Number:
                            sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
                            break;
                        case String:
                            sExpires = "; expires=" + vEnd;
                            break;
                        case Date:
                            sExpires = "; expires=" + vEnd.toGMTString();
                            break;
                    }
                }
                document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            },
            removeItem: function (sKey) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            },
            hasItem: function (sKey) {
                return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            },
            keys: /* optional method: you can safely remove it! */ function () {
                var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
                    aKeys[nIdx] = unescape(aKeys[nIdx]);
                }
                return aKeys;
            }
        };
    },

    initialize: function () {
        var me = this;
        me.messageId = 1;
        me.waitQueue = new Array();
        me.waitQueueIndex = 0;
        me.memoryQueue = new Array();
        me.memoryQueueIndex = 0;
        me.parameterQueue = new Array();
        me.parameterQueueIndex = 0;

        me.pingIntervalHandler = setInterval(function () {
            me.pingWait++;

            if (me.pingWait > 60) {
                me.socket.close();

                clearInterval(me.pingIntervalHandler);
            }

        }, 1000);
    },

    messageId: 1,

    pingWait: 0,

    pingIntervalHandler: 0,

    connect: function () {
        var me = this;
        Ext.getBody().mask('Başlatılıyor, lütfen bekleyiniz!', 'loading');


        if ("WebSocket" in window) {
            this.socket = new WebSocket(this.uri);
            this.socket.onopen = function () {
                me.changeContext();
            };

            this.socket.onmessage = function (evt) {
                me.pingWait = 0;
                var received_msg = evt.data;
                if (received_msg == 'sa') {
                    me.request(
                        "sa.", {
                            onResponse: function (msg) {

                            }
                        }
                    );
                } else {
                    me.fireEvent('receive', received_msg);

                    for (var k = 0; k < me.waitQueue.length; k++) {
                        var wait = me.waitQueue[k];
                        if (received_msg.indexOf(wait.token) == 0) {
                            wait.request.onResponse(received_msg.substr(wait.token.length));
                            me.waitQueue.remove(k);
                        }
                    }
                }

                me.isBusy = false;
            };

            /*
            this.socket.onerror = function(evt){
                me.fireEvent('error');
            }
            */
            this.socket.onclose = function () {
                me.fireEvent('close');
            };

            /*
            Ext.defer(function(){
                var me = this;
                if( me.socket.readyState == me.socket.CLOSED ){
                    me.fireEvent('error');
                    Ext.getBody().unmask();
                }
            }, 10000, me );
            */

        }


    },

    isBusy: false,

    send: function (msg) {
        var me = this;
        //if ( me.isBusy ){
        //	Ext.defer(me.send, 50, me, [msg]);
        //} else {
        //	me.isBusy = true;
        // alert('sending: ' + msg);
        me.socket.send(msg);
        //}
    },

    waitQueue: new Array(),

    wait: function (str, request) {
        var me = this;

        me.waitQueue.push({
            token: str,
            request: request
        });
    },

    memoryQueue: new Array(),
    memoryQueueIndex: 0,

    setMemory: function (pairs, callBack) {
        // pairs: 
        // [
        //		{ key: string, value: string }
        // ]

        var me = this;

        if (Ext.isArray(pairs)) {
            for (var k = 0; k < pairs.length; k++) {
                var pair = pairs[k];

                if ((k == (pairs.length - 1)) && (callBack != null)) {
                    pair.callBack = callBack;
                }

                me.memoryQueue.push(pair);
            }

            me.processMemoryQueue();
        } else {
            return false;
        }
    },

    processMemoryQueue: function () {
        var me = this;
        if (me.memoryQueueIndex < me.memoryQueue.length) {
            var cPair = me.memoryQueue[me.memoryQueueIndex];
            me.request(
                "memory set " + cPair.key + " \"" + (cPair.value + '').replace(/"/g, '&quot;') + "\"", {
                    onResponse: function (msg) {
                        if (msg == UGRFrontend.net.WsConnector.GOAHEAD) {
                            if (me.memoryQueue.length > me.memoryQueueIndex) {
                                me.memoryQueueIndex++;
                            }

                            me.processMemoryQueue();

                            if (cPair.callBack != null) {
                                cPair.callBack();
                            }
                        }
                    }
                }
            );
        }
    },

    parameterQueue: new Array(),
    parameterQueueIndex: 0,

    setParameter: function (pairs, callBack, scope) {
        // pairs: 
        // [
        //		{ key: string, value: string }
        // ]

        var me = this;

        if (Ext.isArray(pairs)) {
            for (var k = 0; k < pairs.length; k++) {
                var pair = pairs[k];

                if ((k == (pairs.length - 1)) && (callBack != null)) {
                    pair.callBack = callBack;
                    pair.scope = scope;
                }

                me.parameterQueue.push(pair);
            }

            me.processParameterQueue();
        } else {
            return false;
        }
    },

    processParameterQueue: function () {
        var me = this;
        if (me.parameterQueueIndex < me.parameterQueue.length) {
            var cPair = me.parameterQueue[me.parameterQueueIndex];
            me.request(
                "parameter set " + cPair.key + " \"" + (cPair.value + '').replace(/"/g, '&quot;') + "\"", {
                    onResponse: function (msg) {
                        if (msg == UGRFrontend.net.WsConnector.OK) {
                            if (me.parameterQueue.length > me.parameterQueueIndex) {
                                me.parameterQueueIndex++;
                            }
                            me.processParameterQueue();

                            if (cPair.callBack != null) {
                                if (cPair.scope != null) {
                                    cPair.scope.sm_05 = cPair.callBack;
                                    cPair.scope.sm_05();
                                } else {
                                    cPair.callBack();
                                }
                            }
                        }
                    }
                }
            );
        }
    },

    request: function (msg, req) {
        // request = Ext.apply(request, {
        //    token: '',
        //	onResponse: Ext.emptyFn,
        //    onFail: Ext.emptyFn,
        //});

        var me = this;
        if (req.token == null) {
            req.token = '';
        }

        // alert(msg);

        me.wait(
            UGRFrontend.net.WsConnector.TOKEN_REPLY +
            UGRFrontend.net.WsConnector.TOKEN_REQ_ID +
            me.messageId +
            UGRFrontend.net.WsConnector.TOKEN_END +
            req.token,
            req);

        me.send(
            UGRFrontend.net.WsConnector.TOKEN_REQ_ID +
            me.messageId +
            UGRFrontend.net.WsConnector.TOKEN_END +
            msg);

        me.messageId++;
    },

    invoke: function (params) {
        var me = this;
        // params:
        // {
        // 		cls: string,
        //      method: string,
        //      args: { key: value },
        //      onResponse : function,
        //      onFail : function,
        //      scope: object,
        //      processResponse: boolean
        // }

        var requestParams = {
            cls: params.cls,
            action: 'invoke',
            args: params.args || []
        };

        requestParams.args.push({
            key: '@method',
            value: params.method
        });

        var jsonRequest = Ext.encode(requestParams);

        me.request(
            jsonRequest, {
                onResponse: function (msg) {
                    var serverResponse;
                    try {
                        serverResponse = Ext.decode(msg);
                        if (params.processResponse == true) {
                            me.fireEvent('serverresponse', serverResponse);
                        }

                        Ext.callback(params.onResponse, params.scope, [serverResponse]);

                        //if ( params.scope != null ){
                        //	params.scope.sm_01 = params.onResponse;
                        //	params.scope.sm_01(serverResponse);
                        //} else {
                        //	params.onResponse(serverResponse);
                        //}
                    } catch (ex) {
                        // alert(ex);
                        Ext.callback(params.onFail, params.scope, [msg]);

                        //if ( params.scope != null ){
                        //	params.scope.sm_02 = params.onFail;
                        //	params.scope.sm_02(msg);
                        //} else {
                        //	params.onFail(msg);
                        //}
                    }
                },
                onFail: function (msg) {
                    Ext.callback(params.onFail, params.scope, [msg]);

                    //if ( params.scope != null ){
                    //	params.scope.sm_02 = params.onFail;
                    //	params.scope.sm_02(msg);
                    //} else {
                    //	params.onFail(msg);
                    //}
                }
            }
        );

        /*
        var requestFunction =  function() {
            me.setMemory([
                    { 'key' : '@method', 'value' : params.method }
                ], 
                function() {
                    me.request(
                        "service " + params.cls + " invoke",
                        {
                            onResponse: function(msg){
                                var serverResponse;
                                try {
                                    serverResponse = Ext.decode(msg);
                                    if ( params.processResponse == true ){
                                        me.fireEvent('serverresponse', serverResponse);
                                    }
                                	
                                    Ext.callback(params.onResponse, params.scope, [serverResponse]);
                                	
                                    //if ( params.scope != null ){
                                    //	params.scope.sm_01 = params.onResponse;
                                    //	params.scope.sm_01(serverResponse);
                                    //} else {
                                    //	params.onResponse(serverResponse);
                                    //} 
                                } catch (ex) {
                                    // alert(ex);
                                    Ext.callback(params.onFail, params.scope, [msg]);
                                	
                                    //if ( params.scope != null ){
                                    //	params.scope.sm_02 = params.onFail;
                                    //	params.scope.sm_02(msg);
                                    //} else {
                                    //	params.onFail(msg);
                                    //} 
                                }
                            },
                            onFail: function(msg){
                                Ext.callback(params.onFail, params.scope, [msg]);
                            	
                                //if ( params.scope != null ){
                                //	params.scope.sm_02 = params.onFail;
                                //	params.scope.sm_02(msg);
                                //} else {
                                //	params.onFail(msg);
                                //} 
                            }
                        }
                    );
                }
            );
        };
        
        if ( Ext.isArray(params.args)){
            me.setMemory(
                params.args,
                requestFunction
            );
        } else {
            requestFunction();
        }
        */
    },

    call: function (params) {
        var me = this;
        // params:
        // {
        // 		cls: string,
        //      action: string,
        //      args: { key: value },
        //      onResponse : function,
        //      onFail : function,
        //      scope: object,
        //      processResponse: boolean
        // }

        var requestParams = {
            cls: params.cls,
            action: params.action,
            args: params.args || []
        };

        var jsonRequest = Ext.encode(requestParams);

        var requestFunction = function () {
            me.request(
                jsonRequest, {
                    onResponse: function (msg) {
                        var serverResponse;
                        try {
                            serverResponse = Ext.decode(msg);
                            if (params.processResponse == true) {
                                me.fireEvent('serverresponse', serverResponse);
                            }

                            if (params.scope != null) {
                                params.scope.sm_10 = params.onResponse;
                                params.scope.sm_10(serverResponse);
                            } else {
                                params.onResponse(serverResponse);
                            }
                        } catch (ex) {
                            // alert(ex);
                            if (params.scope != null) {
                                params.scope.sm_11 = params.onFail;
                                params.scope.sm_11(msg);
                            } else {
                                params.onFail(msg);
                            }
                        }
                    },
                    onFail: function (msg) {
                        if (params.scope != null) {
                            params.scope.sm_12 = params.onFail;
                            params.scope.sm_12(msg);
                        } else {
                            params.onFail(msg);
                        }
                    }
                }
            );
        };

        requestFunction();

    },

    getForm: function (params) {
        var me = this;
        // params:
        // {
        // 		cls: string,
        //      form: string,
        //      args: { key: value },
        //      onResponse : function,
        //      onFail : function,
        //      scope: object
        // }

        var requestParams = {
            cls: params.cls.value || params.cls,
            action: 'form',
            args: params.args || []
        };

        requestParams.args.push({
            key: '@form',
            value: params.form
        });

        var jsonRequest = Ext.encode(requestParams);

        var requestFunction = function () {
            me.request(
                jsonRequest, {
                    onResponse: function (msg) {
                        var serverResponse;
                        try {
                            serverResponse = Ext.decode(msg);
                            if (params.processResponse == true) {
                                me.fireEvent('serverresponse', serverResponse);
                            }

                            if (params.scope != null) {
                                params.scope.sm_03 = params.onResponse;
                                params.scope.sm_03(serverResponse);
                            } else {
                                params.onResponse(serverResponse);
                            }
                        } catch (ex) {
                            // alert(ex);
                            if (params.scope != null) {
                                params.scope.sm_03 = params.onFail;
                                params.scope.sm_03(msg);
                            } else {
                                params.onFail(serverResponse);
                            }
                        }
                    },
                    onFail: function (msg) {
                        if (params.scope != null) {
                            params.scope.sm_03 = params.onFail;
                            params.scope.sm_03(msg);
                        } else {
                            params.onFail(msg);
                        }
                    }
                }
            );
        };

        requestFunction();

    },

    activateForm: function (params) {
        var me = this;
        // params: 
        // {
        //     callBack: function,
        //     uuid: string,
        //     scpoe: object
        // }
        me.request(
            "form activate \"" + params.uuid + "\"", {
                onResponse: function (msg) {
                    if (msg == UGRFrontend.net.WsConnector.ACTIVATED) {
                        if (params.scope != null) {
                            params.scope.sm_008 = params.callBack;
                            params.scope.sm_008();
                        } else {
                            params.callBack();
                        }
                    }
                }
            }
        );
    },

    setComponent: function (params) {
        var me = this;
        // params:
        // {
        //     componentId: string,
        //     propertyName: string,
        //     value : string,
        //     callBack: function,
        //     scope: object
        // }
        me.request(
            "form set \"" + params.componentId + "\" \"" + params.propertyName + "\" \"" + (params.value + '').replace(/"/g, '&quot;') + "\"", {
                onResponse: function (msg) {
                    if (msg == UGRFrontend.net.WsConnector.SET) {
                        if (params.scope != null) {
                            params.scope.sm_009 = params.callBack;
                            params.scope.sm_009();
                        } else {
                            params.callBack();
                        }
                    }
                }
            }
        );
    },

    pumpToChannel: function (params) {
        // params:
        // {
        //     channel: string,
        //     message: string,
        //	   callBack: function,
        //     scope: object
        // }

        var me = this;

        me.request(
            "channel push \"" + params.channel + "\" \"" + params.message.replace(/"/g, '&quot;') + "\"", {
                onResponse: function (msg) {
                    if (msg == UGRFrontend.net.WsConnector.SENT) {
                        if (params.scope != null) {
                            params.scope.sm_009 = params.callBack;
                            params.scope.sm_009();
                        } else {
                            params.callBack();
                        }
                    }
                }
            }
        );

    },

    changeContext: function () {
        var me = this;

        var cookie = me.getCookie('ARKS');
        if (cookie != null) {
            var params = {
                cls: 'alba.system.projects.sys.services.auth.LoginService',
                method: 'changeContext',
                args: [{
                    key: 'sid',
                    value: cookie
                }],
                onResponse: function (response) {
                    me.fireEvent('connect');
                    Ext.getBody().unmask();
                },
                onFail: function (response) {
                    me.socket.close();
                },
                scope: me,
                processResponse: false
            };

            me.invoke(params);
        } else {
            me.fireEvent('connect');
            Ext.getBody().unmask();
        }
    },

    setCookie: function (cookieName, cookieValue, nDays) {
        var today = new Date();
        var expire = new Date();
        if (nDays == null || nDays == 0) {
            nDays = 1;
        }
        expire.setTime(today.getTime() + 3600000 * 24 * nDays);
        this.docCookies.removeItem(cookieName);
        this.docCookies.setItem(cookieName, cookieValue, expire);
        // document.cookie = cookieName + "=" + escape(cookieValue)
        // 	+ ";expires=" + expire.toGMTString();
    },

    getCookie: function (cookieName) {
        return this.docCookies.getItem(cookieName);
    }
})


/*!
 * UGRJS Library v.0.9
 * Copyright(c) 2020 STK
 * info@stkbilisim.com
  
 */

var NULL_HEX = '00000000000000000000000000000000';

Ext.define('UGRFrontend.desktop.Desktop', {
    extend: 'Ext.util.Observable',

    config: {
        wsocket: null
    },

    statics: {
        MANIPULATION_INSERT: 'INSERT',
        MANIPULATION_UPDATE: 'UPDATE',
        MANIPULATION_DELETE: 'DELETE'
    },

    requires: [
        'UGRFrontend.net.WsConnector',
        'UGRFrontend.desktop.GenericModule'
    ],

    staticLanguage: null,

    constructor: function (c) {
        Ext.require('UGRFrontend.desktop.GenericModule');

        this.addEvents({
            'loadshortcuts': true,
            'loadstartmenu': true
        });

        this.listeners = c.listeners;
        this.initConfig(c);

        this.callParent();

        this.initialize();

        this.config.wsocket.on('receive', this.onReceive, this);
        this.config.wsocket.on('close', this.onDisconnect, this);
        this.config.wsocket.on('connect', this.onConnect, this);
        this.config.wsocket.on('serverresponse', this.onServerResponse, this);
        this.config.wsocket.on('error', this.onSocketError, this);

        this.inSync = false;
    },

    initialize: function () {
        //Prevents backspace except in the case of textareas and text inputs to prevent user navigation.
        $(document).keydown(function (e) {
            var preventKeyPress;
            if (e.keyCode == 8) {
                var d = e.srcElement || e.target;
                switch (d.tagName.toUpperCase()) {
                    case 'TEXTAREA':
                        preventKeyPress = d.readOnly || d.disabled;
                        break;
                    case 'INPUT':
                        preventKeyPress = d.readOnly || d.disabled ||
                            (d.attributes["type"] && $.inArray(d.attributes["type"].value.toLowerCase(), ["radio", "checkbox", "submit", "button"]) >= 0);
                        break;
                    case 'DIV':
                        preventKeyPress = d.readOnly || d.disabled || !(d.attributes["contentEditable"] && d.attributes["contentEditable"].value == "true");
                        break;
                    default:
                        preventKeyPress = true;
                        break;
                }
            } else
                preventKeyPress = false;

            if (preventKeyPress)
                e.preventDefault();
        });
    },

    disconnected: false,

    disconnectRetryCount: 0,

    onDisconnect: function () {
        var me = this;

        me.config.wsocket.un('receive', me.onReceive);
        me.config.wsocket.un('close', me.onDisconnect);
        me.config.wsocket.un('connect', me.onConnect);
        me.config.wsocket.un('serverresponse', me.onServerResponse);

        me.disconnectRetryCount++;

        // Ext.Msg.confirm('Disconnected!', 'Would you like to try to reconnect?', me.retryConnection);
        // Ext.getBody().mask('Ağ bağlantısı problemi! ' +
        //     ((me.disconnectRetryCount == 0) ? 'Şimdi ' : (me.disconnectRetryCount * 3) + ' saniye içinde ') +
        //     ' bağlanılacak...', 'loading'); 

        // Ext.defer(function() {
        //     me.retryConnection('yes');
        // }, (me.disconnectRetryCount * 3000), me);

        me.connectAgain();

        me.disconnected = true;
    },

    connectAgain: function () {
        UGRJS.net.wsConnector = Ext.create('UGRFrontend.net.WsConnector', {});
        UGRJS.Desktop.config.wsocket = UGRJS.net.wsConnector;
        UGRJS.Desktop.config.wsocket.on('receive', UGRJS.Desktop.onReceive, UGRJS.Desktop);
        UGRJS.Desktop.config.wsocket.on('close', UGRJS.Desktop.onDisconnect, UGRJS.Desktop);
        UGRJS.Desktop.config.wsocket.on('connect', UGRJS.Desktop.onConnect, UGRJS.Desktop);
        UGRJS.Desktop.config.wsocket.on('serverresponse', UGRJS.Desktop.onServerResponse, UGRJS.Desktop);
        UGRJS.net.wsConnector.connect();
    },

    onSocketError: function () {
        this.onDisconnect();
    },

    retryConnection: function (btn) {
        if (btn == 'yes') {
            Ext.getBody().unmask();
            UGRJS.net.wsConnector = Ext.create('UGRFrontend.net.WsConnector', {});
            UGRJS.Desktop.config.wsocket = UGRJS.net.wsConnector;
            UGRJS.Desktop.config.wsocket.on('receive', UGRJS.Desktop.onReceive, UGRJS.Desktop);
            UGRJS.Desktop.config.wsocket.on('close', UGRJS.Desktop.onDisconnect, UGRJS.Desktop);
            UGRJS.Desktop.config.wsocket.on('connect', UGRJS.Desktop.onConnect, UGRJS.Desktop);
            UGRJS.Desktop.config.wsocket.on('serverresponse', UGRJS.Desktop.onServerResponse, UGRJS.Desktop);

            UGRJS.net.wsConnector.connect();

            /*
            if ( UGRJS.Desktop.disconnected ){
                Ext.defer(UGRJS.Desktop.retryConnection, 10000, UGRJS.Desktop)
            }
            */
        }
    },

    onConnect: function () {
        var me = this;
        me.disconnectRetryCount = 0;

        if (this.disconnected) {
            this.disconnected = false;

            this.checkLogin();
        }
    },

    onReceive: function (msg) {
        var me = this;
        if (msg.substring(0, 1) == '+') {
            var messages = Ext.decode(msg.substring(1));
            if (Ext.isArray(messages)) {
                for (var m = 0; m < messages.length; m++) {
                    var message = messages[m];
                    var channel = message.origin.channel;
                    if (me.channelSubscriptions[channel] != null) {
                        for (var k = 0; k < me.channelSubscriptions[channel].length; k++) {
                            var channelSubscription = me.channelSubscriptions[channel][k];
                            if (channelSubscription != null) {
                                try {
                                    Ext.callback(channelSubscription.callBack, channelSubscription.scope, [message]);
                                } catch (err) {
                                    alert('Dynamic update callback error: ' + err);
                                }
                            }
                        }
                    }

                    if (message.changes != null) {
                        me.processChanges(message.changes);
                    }

                    if (message.moduleInitiator != null) {
                        me.initiateModule(message.moduleInitiator);
                    }
                }
            } else {
                var response = messages;

                var box = response['synchronousBox'];
                if (box != null) {

                    var buttons = {};
                    for (var k = 0; k < box.choices.length; k++) {
                        buttons[box.choices[k].name] = box.choices[k].value;
                    }

                    me.inSync = true;
                    if (box.type == "confirm") {
                        Ext.MessageBox.confirm({
                            title: box.title,
                            msg: box.message,
                            buttonText: buttons,
                            fn: function (btn) {
                                me.config.wsocket.send("select " + btn);

                                me.inSync = false;
                            }
                        });
                    } else if (box.type == "prompt") {
                        Ext.MessageBox.prompt(
                            box.title,
                            box.message,
                            function (btn, txt) {
                                if (btn == "ok") {
                                    me.config.wsocket.send("input " + txt);
                                } else {
                                    me.config.wsocket.send("cancel");
                                }

                                me.inSync = false;
                            }
                        );
                    }
                }


            }
        }
    },

    channelSubscriptions: {},
    subscriptionId: 1,

    subscribe: function (params) {
        var me = this;
        // params:
        // {
        //     name: string
        //     callBack: function
        //     scope: object
        // }

        if (me.channelSubscriptions[params.name] == null) {
            me.channelSubscriptions[params.name] = [];
        }

        params.subscriptionId = me.subscriptionId;
        me.subscriptionId++;

        me.channelSubscriptions[params.name].push(params);

        return params.subscriptionId;
    },

    unsubscribe: function (sId) {
        var me = this;
        for (var name in me.channelSubscriptions) {
            var channel = me.channelSubscriptions[name];
            for (var id in channel) {
                var subs = channel[id];
                if (subs != null) {
                    if (subs.subscriptionId == sId) {
                        channel[id] = null;
                    }
                }
            }
        }
    },

    onServerResponse: function (response) {
        var me = this;
        // If server response does not have any error code
        // process it
        if (response.statusCode == '100') {
            // If response has a module initiator, initiate the module
            if (response.moduleInitiator != null) {
                me.initiateModule(response.moduleInitiator);
            }

            // If response has form changes
            if (Ext.isArray(response.changes)) {
                if (response.changes.length > 0) {
                    me.processChanges(response.changes);
                }
            }

            // Process cookies
            if (Ext.isArray(response.cookies)) {
                for (var k = 0; k < response.cookies.length; k++) {
                    var cookie = response.cookies[k];
                    me.config.wsocket.setCookie(cookie.name, cookie.value, cookie.days);
                }
            }

            // Process manupilations
            if (Ext.isArray(response.manipulations)) {
                for (var k = 0; k < response.manipulations.length; k++) {
                    var manipulation = response.manipulations[k];
                    var channel = manipulation['class'];
                    if (me.channelSubscriptions[channel] != null) {
                        for (var k = 0; k < me.channelSubscriptions[channel].length; k++) {
                            var channelSubscription = me.channelSubscriptions[channel][k];
                            if (channelSubscription != null) {
                                Ext.callback(channelSubscription.callBack, channelSubscription.scope, [manipulation]);
                            }
                        }
                    }
                }
            }

            if (Ext.isArray(response.messages)) {
                if (response.messages.length > 0) {
                    for (var k = 0; k < response.messages.length; k++) {
                        var message = response.messages[k];
                        if (message.ignore == false) {
                            Ext.getBody().unmask();
                            Ext.Msg.alert(message.title, message.message);
                        }
                    }

                }
            }

            if (Ext.isArray(response.toolTips)) {
                if (response.toolTips.length > 0) {
                    for (var k = 0; k < response.toolTips.length; k++) {
                        var ttip = response.toolTips[k];

                        var target = null;
                        if (ttip.target.indexOf('|') > -1) {
                            var tabParts = ttip.target.split('|');
                            var tab = Ext.get(tabParts[0]);
                            if (tab != null) {
                                var buttons = $('#' + tabParts[0] + ' .x-tab-bar button');
                                var button = buttons[parseInt(tabParts[1])];
                                target = Ext.get(button.id);
                            }

                        } else {
                            target = Ext.get(ttip.target);
                        }


                        var tip = Ext.create('Ext.tip.ToolTip', {
                            trackMouse: false,
                            renderTo: document.body,
                            html: '<b><p style="color: #FFFFFF">' + ttip.message + '</p></b>',
                            title: ttip.title,
                            anchor: 'left',
                            bodyStyle: 'background-color: #AA0000',
                            anchorToTarget: true,
                            target: target,
                            listeners: {
                                hide: function (cmp) {
                                    cmp.destroy();
                                }
                            }
                        });

                        tip.show();
                    }
                }
            }
        } else {
            // Show error
        }
    },

    processChanges: function (changes) {
        var me = this;

        for (var k = 0; k < changes.length; k++) {
            var change = changes[k];
            if (change.jValue != null && change.jValue != 'null') {
                change.value = change.jValue;
            }

            if (change.frameId == null || change.frameId == 'null') {
                // var win = me.findWindowByUuid(change.formUuid);
                // if ( win ){
                var cmp = Ext.getCmp(change.id);
                if (cmp) {
                    if (change.isNew) {
                        cmp.add(change.value);
                    } else if (change.isFunction) {
                        // var scope = { component: cmp, key: change.key, value: change.value };
                        // Ext.defer(function(){
                        // this.component[this.key](this.value);
                        cmp[change.key](change.value);
                        // }, 500, scope);
                    } else {
                        if (cmp[me.propertyAccessors[change.key]] != null) {
                            cmp[me.propertyAccessors[change.key]](change.value);
                        }
                        // }
                    }
                }
            } else {
                me.changeIframeElement(change);
            }
        }
    },

    changeIframeElement: function (change) {
        var me = this;
        var iframe = document.getElementById(change.frameId);
        if (iframe != null) {
            if (change.id == 'url') {
                iframe.src = change.value;
            } else {
                var element = iframe.contentWindow.document.getElementById(change.id);
                if (element != null) {
                    element.innerHTML = change.value;
                } else {
                    Ext.defer(me.changeIframeElement, 1000, me, [change]);
                }
            }
        }
    },

    findWindowByUuid: function (uuid) {
        var result = null;
        myDesktopApp.desktop.windows.each(function (item) {
            if (item.uuid == uuid) {
                result = item;
            }
        });

        return result;
    },

    initiateModule: function (params) {
        // params:
        // {
        //    cls: string
        //    form: string
        //    args: [ { key: string, value: string } ]
        // }

        var me = this;

        var mask = Ext.getBody().mask('Yükleniyor...', 'loading x-mask-msg-lock');
        mask.dom.style.zIndex = 99999;


        me.config.wsocket.getForm({
            cls: params.cls,
            form: params.form || 'default',
            args: params.params,
            processResponse: false,
            onResponse: function (msg) {
                if (Ext.isArray(msg.messages)) {
                    Ext.getBody().unmask();
                    me.onServerResponse(msg);
                } else {
                    var newModule = new UGRFrontend.desktop.GenericModule(msg);
                    newModule.app = myDesktopApp;
                    var win = newModule.createWindow();
                    win.show();
                    Ext.getBody().unmask();
                }

            },
            onFail: function (msg) {
                if (Ext.isArray(msg.messages)) {
                    me.onServerResponse(msg);
                } else {
                    console.log(msg)
                    alert('Modül açılırken hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
                    Ext.getBody().unmask();
                }
            },
            scope: me
        });
    },

    start: function () {
        var me = this;
        me.config.wsocket.setParameter([{
            key: 'iconPack',
            value: UGRJS.Config.ICONPACK
        }]);

        if (me.initialConfig.params != null) {
            me.config.wsocket.setParameter(me.initialConfig.params);
        }

        me.checkLogin();
    },

    isReady: false,

    userName: '',
    userRealName: '',

    checkLogin: function () {
        var me = this;

        var invokeParams = {
            cls: 'alba.system.projects.sys.services.auth.LoginService',
            method: 'checkLogin',
            processResponse: true,
            onResponse: function (msg) {
                me.isReady = true;
                if (Ext.isArray(msg.customData)) {
                    var userData = me.normalize(msg.customData);
                    me.userName = userData['userName'].value;
                    me.userRealName = userData['userRealName'].value;

                    myDesktopApp.desktop.taskbar.startMenu.setTitle("Kullanıcı: " + me.userRealName);

                    me.loadShortcuts();
                    me.registerChannels();
                    me.configureWidgets();
                }
            },
            onFail: function () {
                alert('failed checkLogin');
            },
            scope: me
        };

        // { key: 'lang', value: lang }
        var langCookie = me.config.wsocket.getCookie('ARKL');
        if (langCookie != null && langCookie != 'undefined') {
            me.language = langCookie;
            Ext.getCmp('tray-language-menu').setActiveItem(Ext.getCmp('tray-language-menu-' + langCookie), true);
            me.config.wsocket.setParameter(
                [{
                    key: 'lang',
                    value: langCookie
                }],
                function () {
                    me.onChangeLanguage(function () {
                        me.config.wsocket.invoke(invokeParams);
                    });

                }, me
            );
        } else {
            me.config.wsocket.invoke(invokeParams);
        }


    },

    // Will be invoked from GTButton if method name is login
    onLogin: function (msg) {
        var me = this;

        var userData = me.normalize(msg.customData);
        me.userName = userData['userName'].value;
        me.userRealName = userData['userRealName'].value;

        me.registerChannels();
        me.loadShortcuts();
        me.configureWidgets();

        //clear all window
        myDesktopApp.desktop.closeAllWindows();

        myDesktopApp.desktop.taskbar.startMenu.setTitle(me.userRealName);
    },

    configureWidgets: function () {
        var me = this;

    },

    logout: function () {
        var me = this;

        UGRJS.Desktop.runMethod({
            cls: 'alba.system.projects.sys.services.auth.LoginService',
            method: 'logout',
            onSuccess: function (result) {
                me.onLogout(result);
            },
            onFail: Ext.emptyFn,
            scope: this,
            processResponse: false
        });
    },

    onLogout: function (result) {
        var me = this;

        var shortcutView = Ext.getCmp('desktop-shortcut-dataview');
        var shortcutStore = shortcutView.getStore();
        shortcutStore.removeAll();
        shortcutStore.add(myDesktopApp.loginShortcutData);

        myDesktopApp.desktop.taskbar.startMenu.clearMenus();
        myDesktopApp.desktop.closeAllWindows();

        if (Ext.isArray(result.cookies)) {
            for (var k = 0; k < result.cookies.length; k++) {
                var cookie = result.cookies[k];
                me.config.wsocket.setCookie(cookie.name, cookie.value, cookie.days);
            }
        }

        function clearFormDirtyState() {
            Ext.ComponentQuery.query('form').forEach(function (form) {
                form.getForm().getFields().each(function (field) {
                    field.resetOriginalValue(); // Bu, field'ın dirty durumunu temizler
                });
            });
        }

        function reloadPageWithoutWarning() {
            clearFormDirtyState();
            window.location.reload(true);
        }


        UGRJS.Desktop.checkLogin();
    },

    registerChannels: function () {
        var me = this;

        me.subscribe({
            name: 'private.user.' + me.userName,
            callBack: function (msg) {
                if (msg.fn == "newCommunicatorMessage") {
                    // If user has communicator shortcut on desktop
                    var communicatorShortcut = Ext.get('communicator-shortcut');
                    if (communicatorShortcut != null) {
                        // If communicator window is not open with the sender
                        var comWin = Ext.getCmp('communicator.friendchat.' + me.userName + '.' + msg.customData.senderId);
                        if (comWin == null) {
                            if (me.communicatorTip != null) {
                                me.communicatorTip.destroy();
                            }

                            me.communicatorTip = Ext.create('Ext.tip.ToolTip', Ext.apply(me.getCommunicatorTipCfg(), {
                                target: communicatorShortcut.getAttribute("id"),
                                html: 'New message from ' + msg.customData.sender + '.'
                            }));

                            me.communicatorTip.showAt([
                                communicatorShortcut.getX() + communicatorShortcut.getWidth(),
                                communicatorShortcut.getY() + 15
                            ]);
                        } else {
                            comWin.show();
                        }
                    }
                }
            },
            scope: me
        });

        me.subscribe({
            name: 'private.session.' + me.config.wsocket.getCookie('ARKS'),
            callBack: function (msg) {
                if (msg.fn == "logout") {
                    me.onLogout({});
                }
            },
            scope: me
        });
    },

    loadShortcuts: function () {
        var me = this;

        me.config.wsocket.invoke({
            cls: 'alba.system.projects.sys.services.auth.LoginService',
            method: 'getShortcuts',
            processResponse: false,
            onResponse: function (msg) {
                if (Ext.isArray(msg.rows)) {
                    var shortcutView = Ext.getCmp('desktop-shortcut-dataview');
                    var shortcutStore = shortcutView.getStore();
                    shortcutStore.removeAll();
                    if (shortcutView != null) {
                        for (var k = 0; k < msg.rows.length; k++) {
                            var row = me.normalize(msg.rows[k].columns);
                            shortcutStore.add(row);
                        }
                    }

                    Ext.callback(me.configureCommunicator, me);

                    Ext.defer(me.loadStartmenu, 500, me);
                }
            },
            onFail: function () {
                alert('failed loading shortcuts');
            },
            scope: me
        });
    },

    loadStartmenu: function () {
        var me = this;

        me.config.wsocket.invoke({
            cls: 'alba.system.projects.sys.services.auth.LoginService',
            method: 'getStartmenu',
            processResponse: false,
            onResponse: function (msg) {
                if (Ext.isArray(msg.rows)) {
                    var menus = me.getRowData(msg.rows);
                    var modules = [];
                    for (var k in menus) {
                        var menu = menus[k],
                            module;
                        if (menu.applicationModuleClass == '') {
                            module = Ext.create('UGRFrontend.desktop.ApplicationMenu', {
                                id: 'taskbar-startmenu-' + menu.startMenuPK,
                                title: menu.startMenuTitle,
                                parentMenu: menu.startMenuFK,
                                self: menu.startMenuPK,
                                menus: menus
                            });

                            if (module.launcher != null) {
                                modules.push(module);
                            }
                        } else {
                            module = Ext.create('UGRFrontend.desktop.ApplicationModule', {
                                id: 'taskbar-startmenu-' + menu.startMenuPK,
                                title: menu.startMenuTitle,
                                cls: menu.applicationModuleClass,
                                name: menu.applicationModuleName,
                                parentMenu: menu.startMenuFK,
                                self: menu.startMenuPK,
                                apFK: menu.applicationModuleFK,
                                typeFK: menu.applicationModuleTypeFK_
                            });

                            modules.push(module);
                        }

                        if (menu.startMenuTitle_trb != null) {
                            var prop = menu.startMenuTitle_trb;
                            prop.id = 'taskbar-startmenu-' + menu.startMenuPK + '-launcher';
                            prop.pName = 'text';
                            me.translateables.push(prop);
                            UGRJS.Desktop.registerTranslateable(prop);
                        }
                    }

                    myDesktopApp.setModules(modules);
                    me.generateStartmenu();

                }
            },
            onFail: function () {
                alert('failed loading start menu');
            },
            scope: me
        });
    },

    generateStartmenu: function () {
        var me = this;

        myDesktopApp.desktop.taskbar.startMenu.clearMenus();

        var modules = myDesktopApp.getModules();
        for (var k in modules) {
            var module = modules[k];
            if (module.parentMenu == NULL_HEX) {
                if (module.launcher) {
                    if (module.launcher.menu.items.length > 0) {
                        myDesktopApp.desktop.taskbar.startMenu.addMenuItem(module.launcher);
                    }
                }
            }
        }
    },

    getCommunicatorTipCfg: function () {
        var me = this;

        return {
            trackMouse: false,
            renderTo: document.body,
            html: '',
            title: 'New Message',
            anchor: 'left',
            listeners: {
                afterrender: function (ttip) {
                    ttip.getEl().on('click', function (tt) {
                        me.runMethod({
                            cls: 'com.ark.server.probe.common.ServiceCommunicator',
                            method: 'openNewMessages',
                            onSuccess: Ext.emptyFn,
                            onFail: Ext.emptyFn,
                            scope: me,
                            processResponse: true
                        });
                    });
                }
            }
        }
    },

    configureCommunicator: function () {
        var me = this;
        var communicatorShortcut = Ext.get('communicator-shortcut');
        if (communicatorShortcut != null) {
            me.runAction({
                cls: 'com.ark.server.probe.common.ServiceCommunicatormessage',
                action: 'list',
                // args: [ {key: string, value: string} ],
                onSuccess: function (msg) {
                    if (msg.rows.length > 0) {
                        var rows = me.getRowData(msg.rows);
                        var senders = [];
                        var lastSender = "";
                        for (var index in rows) {
                            if (rows[index].sender != lastSender) {
                                senders.push(rows[index].sender);
                                lastSender = rows[index].sender;
                            }
                        }

                        me.communicatorTip = Ext.create('Ext.tip.ToolTip', Ext.apply(me.getCommunicatorTipCfg(), {
                            target: communicatorShortcut.getAttribute("id"),
                            html: 'You have received ' + msg.rows.length + ' new messages from ' + senders.join(', ') + '.'
                        }));

                        me.communicatorTip.showAt([
                            communicatorShortcut.getX() + communicatorShortcut.getWidth(),
                            communicatorShortcut.getY() + 15
                        ]);
                    }
                },
                onFail: function (msg) {

                },
                scope: me,
                processResponse: false
            });
        }
    },

    translateables: new Array(),

    registerTranslateable: function (trb) {
        var me = this;
        me.translateables.push(trb);
    },

    unregisterTranslateable: function (trb) {
        var me = this;
        var index = me.translateables.indexOf(trb);
        if (index > -1) {
            me.translateables.remove(index);
        }
    },

    changeLanguage: function (lang) {
        Ext.getBody().mask('Yükleniyor, lütfen bekleyiniz!', 'loading');
        var me = this;
        me.config.wsocket.setParameter([{
            key: 'lang',
            value: lang
        }], me.onChangeLanguage, me);

        me.language = lang;

        me.config.wsocket.setCookie('ARKL', lang, 10);

    },

    normalize: function (arr) {
        var output = {};
        if (Ext.isArray(arr)) {
            for (var k = 0; k < arr.length; k++) {
                var item = arr[k];
                output[item.name] = {
                    key: name,
                    value: item.value,
                    actualValue: item.actualValue
                };
                output[item.name].toString = function () {
                    return this.value;
                }
            }
        }

        return output;
    },

    propertyAccessors: {
        'text': 'setText',
        'title': 'setTitle',
        'value': 'setValue',
        'fieldStyle': 'setFieldStyle',
        'blankText': 'setBlankText',
        'fieldLabel': 'setFieldLabel',
        'minLengthText': 'setMinLengthText',
        'maxLengthText': 'setMaxLengthText',
        'disabled': 'setDisabled',
        'comboData': 'setComboData',
        'activeTab': 'changeActiveTab',
        'src': 'setSrc',
        'hidden': 'setHidden',
        'background': 'setBackground',
        'closed': 'setClosed',
        'refreshed': 'doRefresh',
        'reloadPageRefresh': 'doRefresh2',
        'expanded': 'changeExpanded',
        'collapsed': 'changeCollapsed',
        'x': 'setX',
        'y': 'setY',
        'maximized': 'setMaximized',
        'minimized': 'setMinimized',
        'width': 'setCmpWidth',
        'height': 'setCmpHeight',
        'selected': 'setSelected',
        'selectedNode': 'setSelectedNode',
        'pressed': 'setPressed',
        'editable': 'setEditable',
        'center': 'setCenter',
        'zoom': 'setZoom',
        'height': 'setHeight',
        'draggable': 'setDraggable',
        'comboData': 'setComboData',
        'folder': 'setFolder',
        'cls': 'setCls',
        'html': 'setHtml'
    },

    onChangeLanguage: function (callback) {
        var me = this;
        var keys = new Array();
        for (var k = 0; k < me.translateables.length; k++) {
            keys.push(me.translateables[k].key);
        }
        var pTranslateables = keys.join(';');

        me.config.wsocket.invoke({
            cls: 'alba.system.projects.sys.services.auth.LoginService',
            method: 'getTranslateables',
            args: [{
                key: 'translateables',
                value: pTranslateables
            }],
            processResponse: false,
            onResponse: function (msg) {
                if (Ext.isArray(msg.translateables)) {
                    for (var k = 0; k < msg.translateables.length; k++) {
                        var sTranslateable = msg.translateables[k];
                        me.setTranslateable(sTranslateable);
                    }
                }

                Ext.getBody().unmask();
                if (callback != null) {
                    Ext.callback(callback, me);
                }

            },
            onFail: function () {
                alert('failed getTranslateables');
            },
            scope: me
        });

        UGRJS.Language.changeLanguage(me.language);

        me.config.wsocket.setCookie("ARKL", me.language, 1);
    },

    setTranslateable: function (sTranslateable) {
        var me = this;
        var trbs = this.findTranslateable(sTranslateable.key);
        if (trbs.length > 0) {
            for (var m = 0; m < trbs.length; m++) {
                var translateable = trbs[m];
                var cmp = Ext.getCmp(translateable.id);
                if (cmp != null) {
                    if (cmp.xtype == "window" && translateable.pName == "title") {
                        cmp.setTitle(sTranslateable.value);
                        var btnCmp = Ext.getCmp('taskbar-windowbar-' + translateable.id);
                        if (btnCmp != null) {
                            btnCmp.setText(sTranslateable.value);
                        }
                    }
                        // else if ( cmp.xtype == "mgrid" && translateable.pName == "toolTipHint" ){
                        //	Ext.get(cmp.id + '-help-toolEl' ).set({"data-qtip": sTranslateable.value});
                    // } 
                    else if (cmp.xtype == "mcombo" && (translateable.pName.indexOf('cmb-') == 0)) {
                        var val = cmp.getValue();
                        var store = cmp.getStore();
                        var index = store.find('key', translateable.pName.substr(4));
                        if (index > -1) {
                            store.getAt(index).set('value', sTranslateable.value);
                        }

                        cmp.setValue(val);
                    } else {
                        if (Ext.isFunction(cmp[me.propertyAccessors[translateable.pName]])) {
                            cmp[me.propertyAccessors[translateable.pName]](sTranslateable.value);
                        } else {
                            cmp[translateable.pName] = sTranslateable.value;
                        }
                    }
                }
            }
        }
    },

    activateForm: function (win) {
        var me = this;
        if (win.uuid != null) {
            // win.setDisabled(true);
            me.config.wsocket.activateForm({
                uuid: win.uuid,
                callBack: function () {
                    // win.setDisabled(false);
                },
                scope: me
            });
        }
    },

    setComponentCallBack: function (cmp, property, value, _callBack) {
        // Disable component during the operation
        var me = this;
        var componentId = cmp.id;
        if (cmp.xtype == 'window') {
            componentId = '@self';
        }
        me.config.wsocket.setComponent({
            componentId: componentId,
            propertyName: property,
            value: value,
            callBack: function () {
                _callBack();
            },
            scope: me
        });
    },

    setComponent: function (cmp, property, value, enabled) {
        // Disable component during the operation
        if (!enabled) {
            cmp.setDisabled(true);
        }
        var me = this;
        var componentId = cmp.id;
        if (cmp.xtype == 'window') {
            componentId = '@self';
        }
        me.config.wsocket.setComponent({
            componentId: componentId,
            propertyName: property,
            value: value,
            callBack: function () {
                if (!enabled) {
                    cmp.setDisabled(false);
                }
            },
            scope: me
        });
    },

    pumpToChannel: function (channelName, message) {
        var me = this;

        me.config.wsocket.pumpToChannel({
            channel: channelName,
            message: message,
            callBack: function () {

            },
            scope: me
        });
    },

    findTranslateable: function (key) {
        var me = this;
        var output = [];
        for (var k = 0; k < me.translateables.length; k++) {
            if (me.translateables[k].key == key) {
                output.push(me.translateables[k]);
            }
        }

        return output;
    },

    runMethod: function (params) {
        // params:
        // {
        //     cls: string,
        //     method: string,
        //     args: [ {key: string, value: string} ],
        //	   onSuccess : function
        //     onFail: function
        //     scope: object,
        //     processResponse: boolean
        // }

        params.onResponse = function (msg) {
            if (msg.statusCode == '100') {
                if (msg.messages.length > 0) {
                    if (msg.messages[0].type == 'SUCCESS') {
                        Ext.callback(params.onSuccess, params.scope, [msg]);
                    } else {
                        Ext.callback(params.onFail, params.scope, [msg]);
                    }
                } else {
                    Ext.callback(params.onSuccess, params.scope, [msg]);
                }
            } else {
                Ext.callback(params.onFail, params.scope, [msg]);
            }
        }

        var me = this;
        me.config.wsocket.invoke(params);
    },

    runAction: function (params) {
        // params:
        // {
        //     cls: string,
        //     action: string,
        //     args: [ {key: string, value: string} ],
        //	   onSuccess : function
        //     onFail: function
        //     scope: object,
        //     processResponse: boolean
        // }

        params.onResponse = function (msg) {
            if (msg.statusCode == '100') {
                if (msg.messages.length > 0) {
                    if (msg.messages[0].type == 'SUCCESS') {
                        Ext.callback(params.onSuccess, params.scope, [msg]);
                    } else {
                        Ext.callback(params.onFail, params.scope, [msg]);
                    }
                } else {
                    Ext.callback(params.onSuccess, params.scope, [msg]);
                }
            } else {
                Ext.callback(params.onFail, params.scope, [msg]);
            }
        }

        var me = this;
        me.config.wsocket.call(params);
    },

    getRecordData: function (record) {
        var output = {};
        for (var k = 0; k < record.values.length; k++) {
            var field = record.values[k].field;
            output[field.name] = record.values[k].value;
            output['_' + field.name] = record.values[k].rawValue;
        }

        return output;
    },

    getRowData: function (rows) {
        var output = [];

        for (var k = 0; k < rows.length; k++) {
            var row = rows[k];
            var normalized = {};
            for (var m = 0; m < row.columns.length; m++) {
                var column = row.columns[m];
                if (column.isInteger) {
                    normalized[column.name] = parseInt(column.value);
                } else {
                    normalized[column.name] = column.value;
                }

                if (column.translateable != null) {
                    normalized[column.name + '_trb'] = column.translateable;
                }

                normalized[column.name + '_'] = column.actualValue;
            }

            output.push(normalized);
        }

        return output;
    }

})


/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('UGRFrontend.desktop.view.GTDesktopView', {
    extend: 'Ext.view.View',
    alias: 'widget.desktopview',

    mixins: {
        dragSelector: 'Ext.ux.DataView.DragSelector',
        draggable: 'Ext.ux.DataView.Draggable'
    },

    constructor: function (c) {
        var me = this;

        this.callParent(arguments);
    },

    initComponent: function () {
        this.mixins.dragSelector.init(this);
        this.mixins.draggable.init(this, {
            ddConfig: {
                ddGroup: 'organizerDD'
            },
            ghostTpl: [
                '<tpl for=".">',
                '<img src="../view/chooser/icons/{thumb}" />',
                '<tpl if="xindex % 4 == 0"><br /></tpl>',
                '</tpl>',
                '<div class="count">',
                '{[values.length]} images selected',
                '<div>'
            ]
        });

        this.on('render', this.initializeDDZones, this);

        this.on('resize', this.onViewResize, this);

        this.callParent();
    },

    onViewResize: function (v, width, height, eOps) {
        var m = 0;
        var store = v.getStore();

        width = width - 80;
        height = height - 120;

        var numShortCuts = store.getCount();

        for (var k = 0; k < numShortCuts; k++) {
            var shortcut = store.getAt(k);
            var sc = Ext.get(shortcut.data.applicationModuleName + '-shortcut');

            if (sc != null) {
                var pos = [shortcut.data.userShortcutPosX, shortcut.data.userShortcutPosY];

                if ((pos[0] > width) || (pos[1] > height) || sc.flawed) {

                    if (pos[0] > width) {
                        pos[0] = width;
                    }

                    if (pos[1] > height) {
                        pos[1] = height;
                    }

                    if (sc.flawed) {
                        sc.setXY(pos, false);
                    } else {
                        sc.setXY(pos, true);
                    }

                    sc.flawed = true;
                }
            }
        }
    },

    initializeDDZones: function (v) {
        v.dropZone = Ext.create('Ext.dd.DropZone', v.getEl(), {
            ddGroup: 'organizerDD',
            getTargetFromEvent: function (e) {
                return v.getEl();
            },
            onNodeOver: function (target, dd, e, data) {
                if (!this.trashCan.isVisible()) {
                    this.trashCan.show(true);
                }

                if (v.checkZone(this.trashCan, e.xy)) {
                    return 'x-dd-drop-trash';
                } else {
                    return Ext.dd.DropZone.prototype.dropAllowed;
                }
            },
            onNodeDrop: function (target, dd, e, data) {
                if (v.checkZone(this.trashCan, e.xy)) {
                    var pos = e.xy;
                    pos[0] = pos[0] - 20;
                    pos[1] = pos[1] - 25;
                    var sc = Ext.get(data.records[0].data.applicationModuleName + '-shortcut');
                    sc.setXY(pos, true);
                    sc.hide(true);

                    UGRJS.Desktop.runMethod({
                        cls: 'com.ark.server.probe.desktop.ServiceUsershortcut',
                        method: 'deleteFromDesktop',
                        args: [{
                            key: 'userShortcutPK',
                            value: data.records[0].data.userShortcutPK
                        }],
                        onSuccess: Ext.emptyFn,
                        onFail: Ext.emptyFn,
                        scope: this,
                        processResponse: false
                    });

                    Ext.defer(function () {
                        Ext.get('desktop-shortcut-dataview-trashcan').hide(true)
                        var store = v.getStore();
                        var index = store.find('applicationModuleName', data.records[0].data.applicationModuleName);
                        if (index >= 0) {
                            store.removeAt(index);
                        }
                    }, 500);
                } else {
                    Ext.get('desktop-shortcut-dataview-trashcan').hide(true);
                    // If dragged from desktop
                    if (data.records != null) {
                        //change position temprorary disabled!!!
                        /* var pos = e.xy;
                         pos[0] = pos[0] - 20;
                         pos[1] = pos[1] - 25;
                         //Ext.get(data.records[0].data.applicationModuleName + '-shortcut').setXY(pos, true);
 
                         UGRJS.Desktop.runMethod({
                             cls: 'com.ark.server.probe.desktop.ServiceUsershortcut',
                             method: 'changePos',
                             args: [{
                                     key: 'userShortcutPK',
                                     value: data.records[0].data.userShortcutPK
                                 },
                                 {
                                     key: 'userShortcutPosX',
                                     value: pos[0]
                                 },
                                 {
                                     key: 'userShortcutPosY',
                                     value: pos[1]
                                 }
                             ],
                             onSuccess: Ext.emptyFn,
                             onFail: Ext.emptyFn,
                             scope: this,
                             processResponse: false
                         });*/
                    } else {
                        dd.getDragEl().hide();
                        // usershortcut automatically order optimisation
                        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                        var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

                        UGRJS.Desktop.runMethod({
                            cls: 'com.ark.server.probe.desktop.ServiceUsershortcut',
                            method: 'addNew',
                            args: [{
                                key: 'applicationModuleName',
                                value: data.applicationModuleName
                            },
                                {
                                    key: 'userShortcutTitle',
                                    value: data.userShortcutTitle
                                },
                                {
                                    key: 'userShortcutPosX',
                                    value: width
                                },
                                {
                                    key: 'userShortcutPosY',
                                    value: height
                                }
                            ],
                            onSuccess: function (msg) {
                                if (msg.rows.length > 0) {
                                    var x = msg.rows[0].columns[5].value;
                                    var y = msg.rows[0].columns[6].value;
                                    var shortcutView = Ext.getCmp('desktop-shortcut-dataview');
                                    var shortcutStore = shortcutView.getStore();
                                    data.userShortcutPosX = x;
                                    data.userShortcutPosY = y;
                                    shortcutStore.add(data);
                                } else {
                                    Ext.Msg.alert(msg.messages[0].title, msg.messages[0].message);
                                }


                            },
                            onFail: Ext.emptyFn,
                            scope: this,
                            processResponse: false
                        });
                    }
                }

                return true;
            }
        });

        v.dropZone.trashCan = Ext.core.DomHelper.append(
            'desktop-shortcut-dataview',
            '<div class="x-desktop-trashcan" id="desktop-shortcut-dataview-trashcan"><img src="' +
            'sources/assets/icons/48/trash.png' +
            '"/></div>',
            true
        );

        v.dropZone.trashCan.hide();
    },

    checkZone: function (el, xy) {
        if ((xy[0] < (el.getX() + el.getWidth())) && xy[0] > el.getX() &&
            (xy[1] < (el.getY() + el.getHeight())) && xy[1] > el.getY()
        ) {
            return true;
        } else {
            return false;
        }
    }
});

// fix hide submenu (in chrome 43)
Ext.override(Ext.menu.Menu, {
    onMouseLeave: function (e) {
        var me = this;


        // BEGIN FIX
        var visibleSubmenu = false;
        me.items.each(function (item) {
            if (item.menu && item.menu.isVisible()) {
                visibleSubmenu = true;
            }
        })
        if (visibleSubmenu) {
            //console.log('apply fix hide submenu');
            return;
        }
        // END FIX


        me.deactivateActiveItem();


        if (me.disabled) {
            return;
        }


        me.fireEvent('mouseleave', me, e);
    }
});