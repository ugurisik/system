package defsu.system.projects.sys.record;


import defsu.system.server.components.SimpleComboAdapter;
import defsu.system.server.core.ObjectCore;
import defsu.system.server.core.RecordCore;
import defsu.system.server.core.ServerUtility;
import defsu.system.server.core.SuRecord;
import defsu.system.server.helpers.RecordManipulation;
import defsu.system.server.helpers.SuField;

import java.util.Date;

public class StartMenu implements SuRecord {
    private static SuField.SuFieldList _fields;


    public byte[] startMenuPK;
    public byte[] applicationModuleFK;
    public byte[] startMenuFK;
    public String startMenuTitle;
    public int startMenuOrder;
    public byte[] startMenuTypeFK;
    public Date createdDate;
    public boolean visible;
    public byte[] applicationModuleTypeFK;
    public String applicationModuleName;
    public String applicationModuleClass;
    public String applicationModuleForm;
    public String applicationModuleIcon;
    public String applicationModuleIconFolder;
    public boolean _empty = true;
    public byte[] id;
    public String text;
    public boolean leaf;
    public byte[] parent;
    public String icon;


    public StartMenu(){
        this._initialize();
    }
    
    @Override
    public void _initialize() {
        if (_fields == null) {
            _fields = new SuField.SuFieldList();
            SuField f = new SuField();
            f.name = "startMenuPK";
            f.defaultValue = null;
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "id";
            f.defaultValue = null;
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "text";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "leaf";
            f.defaultValue = false;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);
            f = new SuField();
            f.name = "parent";
            f.defaultValue = null;
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "icon";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "applicationModuleClass";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "applicationModuleName";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "applicationModuleIconFolder";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "applicationModuleIcon";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "applicationModuleTypeFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "startMenuTitle";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.translateable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "startMenuFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "startMenuTypeFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("0|Yetkili~1|Yetkisiz");
            f.sortable = true;
            f.searchable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "createdDate";
            f.defaultValue = ServerUtility.now();
            f.fieldType = SuField.FT.DATETIME;
            f.displayAs = SuField.DT.DATETIMEPICKER;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "visible";
            f.defaultValue = true;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);
        }
        ObjectCore.setFieldsToDefaults(this);
    }
    
    
    
    public byte[] getStartMenuPK() {
        return startMenuPK;
    }

    public void setStartMenuPK(byte[] startMenuPK) {
        this.startMenuPK = startMenuPK;
    }

    public byte[] getApplicationModuleFK() {
        return applicationModuleFK;
    }

    public void setApplicationModuleFK(byte[] applicationModuleFK) {
        this.applicationModuleFK = applicationModuleFK;
    }

    public byte[] getStartMenuFK() {
        return startMenuFK;
    }

    public void setStartMenuFK(byte[] startMenuFK) {
        this.startMenuFK = startMenuFK;
    }

    public String getStartMenuTitle() {
        return startMenuTitle;
    }

    public void setStartMenuTitle(String startMenuTitle) {
        this.startMenuTitle = startMenuTitle;
    }

    public int getStartMenuOrder() {
        return startMenuOrder;
    }

    public void setStartMenuOrder(int startMenuOrder) {
        this.startMenuOrder = startMenuOrder;
    }

    public byte[] getStartMenuTypeFK() {
        return startMenuTypeFK;
    }

    public void setStartMenuTypeFK(byte[] startMenuTypeFK) {
        this.startMenuTypeFK = startMenuTypeFK;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public boolean getVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public byte[] getApplicationModuleTypeFK() {
        return applicationModuleTypeFK;
    }

    public void setApplicationModuleTypeFK(byte[] applicationModuleTypeFK) {
        this.applicationModuleTypeFK = applicationModuleTypeFK;
    }

    public String getApplicationModuleName() {
        return applicationModuleName;
    }

    public void setApplicationModuleName(String applicationModuleName) {
        this.applicationModuleName = applicationModuleName;
    }

    public String getApplicationModuleClass() {
        return applicationModuleClass;
    }

    public void setApplicationModuleClass(String applicationModuleClass) {
        this.applicationModuleClass = applicationModuleClass;
    }

    public String getApplicationModuleForm() {
        return applicationModuleForm;
    }

    public void setApplicationModuleForm(String applicationModuleForm) {
        this.applicationModuleForm = applicationModuleForm;
    }

    public String getApplicationModuleIcon() {
        return applicationModuleIcon;
    }

    public void setApplicationModuleIcon(String applicationModuleIcon) {
        this.applicationModuleIcon = applicationModuleIcon;
    }

    public String getApplicationModuleIconFolder() {
        return applicationModuleIconFolder;
    }

    public void setApplicationModuleIconFolder(String applicationModuleIconFolder) {
        this.applicationModuleIconFolder = applicationModuleIconFolder;
    }

    public boolean is_empty() {
        return _empty;
    }

    public void set_empty(boolean _empty) {
        this._empty = _empty;
    }

    public byte[] getId() {
        return id;
    }

    public void setId(byte[] id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean getLeaf() {
        return leaf;
    }

    public void setLeaf(boolean leaf) {
        this.leaf = leaf;
    }

    public byte[] getParent() {
        return parent;
    }

    public void setParent(byte[] parent) {
        this.parent = parent;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }


    @Override
    public RecordProperties getField() {
        SuRecord.RecordProperties props = new SuRecord.RecordProperties();
        props.fields = _fields;
        props.primaryKey = "startMenuPK";
        props.title = "MENÜ";
        return props;
    }

    @Override
    public void process() {

    }

    @Override
    public boolean disableLog() {
        return false;
    }

    @Override
    public boolean getEmpty() {
        return false;
    }

    @Override
    public void setEmpty(boolean empty) {
        this._empty = empty;
    }

    @Override
    public RecordManipulation save() {
        return null;
    }

    @Override
    public RecordManipulation delete() {
        return null;
    }


}
