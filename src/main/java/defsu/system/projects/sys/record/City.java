package defsu.system.projects.sys.record;

import defsu.system.server.core.ObjectCore;
import defsu.system.server.core.RecordCore;
import defsu.system.server.core.SuRecord;
import defsu.system.server.helpers.RecordManipulation;
import defsu.system.server.helpers.SuField;
import defsu.system.server.maps.MapCity;

import java.util.Date;

public class City extends MapCity implements SuRecord {
    public boolean empty = true;
    private static SuField.SuFieldList _fields;
    private String PRIMARY_KEY = "cityPK";

    public City(){
        this._initialize();
    }

    @Override
    public RecordProperties getField() {
        RecordProperties rp = new RecordProperties();
        rp.fields = _fields;
        rp.primaryKey = PRIMARY_KEY;
        rp.title = "Şehir";
        return rp;
    }

    @Override
    public void process() {

    }

    @Override
    public void _initialize() {
        if(_fields == null){
            _fields = new SuField.SuFieldList();
            SuField f = new SuField();
            f.name = PRIMARY_KEY;
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);

            f = new SuField();
            f.name = "cityName";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "cityPlateCode";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "cityPhoneCode";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "createdDate";
            f.defaultValue = new Date();
            f.fieldType = SuField.FT.DATE;
            _fields.add(f);

            f = new SuField();
            f.name = "updatedDate";
            f.defaultValue = new Date();
            f.fieldType = SuField.FT.DATE;
            _fields.add(f);

            f = new SuField();
            f.name = "visible";
            f.defaultValue = true;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);

            f = new SuField();
            f.name = "creatorFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);

            f = new SuField();
            f.name = "updaterFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);


        }
        ObjectCore.setFieldsToDefaults(this);
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
