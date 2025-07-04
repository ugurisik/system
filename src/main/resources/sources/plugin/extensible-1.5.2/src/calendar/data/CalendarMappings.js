/*!
 * Extensible 1.5.2
 * Copyright(c) 2010-2013 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
/**
 * @class Extensible.calendar.data.CalendarMappings
 * @extends Object
 * A simple object that provides the field definitions for
 * {@link Extensible.calendar.data.CalendarModel CalendarRecord}s so that they can be easily overridden.
 *
 * <p>There are several ways of overriding the default Calendar record mappings to customize how
 * Ext records are mapped to your back-end data model. If you only need to change a handful
 * of field properties you can directly modify the CalendarMappings object as needed and then
 * reconfigure it. The simplest approach is to only override specific field attributes:</p>
 * <pre><code>
 var M = Extensible.calendar.data.CalendarMappings;
 M.Title.mapping = 'cal_title';
 M.Title.name = 'CalTitle';
 Extensible.calendar.data.CalendarModel.reconfigure();
 </code></pre>
 *
 * <p>You can alternately override an entire field definition using object-literal syntax, or
 * provide your own custom field definitions (as in the following example). Note that if you do
 * this, you <b>MUST</b> include a complete field definition, including the <tt>type</tt> attribute
 * if the field is not the default type of <tt>string</tt>.</p>
 * <pre><code>
 // Add a new field that does not exist in the default CalendarMappings:
 Extensible.calendar.data.CalendarMappings.Owner = {
 name: 'Owner',
 mapping: 'owner',
 type: 'string'
 };
 Extensible.calendar.data.CalendarModel.reconfigure();
 </code></pre>
 *
 * <p>If you are overriding a significant number of field definitions it may be more convenient
 * to simply redefine the entire CalendarMappings object from scratch. The following example
 * redefines the same fields that exist in the standard CalendarRecord object but the names and
 * mappings have all been customized. Note that the name of each field definition object
 * (e.g., 'CalendarId') should <b>NOT</b> be changed for the default CalendarMappings fields as it
 * is the key used to access the field data programmatically.</p>
 * <pre><code>
 Extensible.calendar.data.CalendarMappings = {
 CalendarId:   {name:'ID', mapping: 'id', type: 'int'},
 Title:        {name:'CalTitle', mapping: 'title', type: 'string'},
 Description:  {name:'Desc', mapping: 'desc', type: 'string'},
 ColorId:      {name:'Color', mapping: 'color', type: 'int'},
 IsHidden:     {name:'Hidden', mapping: 'hidden', type: 'boolean'},

 // We can also add some new fields that do not exist in the standard CalendarRecord:
 Owner:        {name: 'Owner', mapping: 'owner'}
 };
 // Don't forget to reconfigure!
 Extensible.calendar.data.CalendarModel.reconfigure();
 </code></pre>
 *
 * <p><b>NOTE:</b> Any record reconfiguration you want to perform must be done <b>PRIOR to</b>
 * initializing your data store, otherwise the changes will not be reflected in the store's records.</p>
 *
 * <p>Another important note is that if you alter the default mapping for <tt>CalendarId</tt>, make sure to add
 * that mapping as the <tt>idProperty</tt> of your data reader, otherwise it won't recognize how to
 * access the data correctly and will treat existing records as phantoms. Here's an easy way to make sure
 * your mapping is always valid:</p>
 * <pre><code>
 var reader = new Ext.data.JsonReader({
 totalProperty: 'total',
 successProperty: 'success',
 root: 'data',
 messageProperty: 'message',

 // read the id property generically, regardless of the mapping:
 idProperty: Extensible.calendar.data.CalendarMappings.CalendarId.mapping  || 'id',

 // this is also a handy way to configure your reader's fields generically:
 fields: Extensible.calendar.data.CalendarModel.prototype.fields.getRange()
 });
 </code></pre>
 */
Ext.ns('Extensible.calendar.data');

Extensible.calendar.data.CalendarMappings = {
    CalendarId: {
        name: 'CalendarId',
        mapping: 'id',
        type: 'int'
    },
    Title: {
        name: 'Title',
        mapping: 'title',
        type: 'string'
    },
    Description: {
        name: 'Description',
        mapping: 'desc',
        type: 'string'
    },
    ColorId: {
        name: 'ColorId',
        mapping: 'color',
        type: 'int'
    },
    IsHidden: {
        name: 'IsHidden',
        mapping: 'hidden',
        type: 'boolean'
    }
};