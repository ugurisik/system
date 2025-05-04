package defsu.system.projects.main.record.account;

import defsu.system.projects.main.maps.MapAccount;
import defsu.system.projects.sys.record.City;
import defsu.system.projects.sys.record.TaxOffice;
import defsu.system.server.components.DynamicComboAdapter;
import defsu.system.server.components.SimpleComboAdapter;
import defsu.system.server.core.ObjectCore;
import defsu.system.server.core.RecordCore;
import defsu.system.server.core.SuRecord;
import defsu.system.server.helpers.RecordManipulation;
import defsu.system.server.helpers.SuField;

import java.util.Date;

public class Account extends MapAccount implements SuRecord {
    public boolean empty = true;
    private static SuField.SuFieldList _fields;
    private String PRIMARY_KEY = "accountPK";


    @Override
    public RecordProperties getField() {
        RecordProperties rp = new RecordProperties();
        rp.fields = _fields;
        rp.primaryKey = PRIMARY_KEY;
        rp.title = "Hesap";
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
            f.name = "accountName";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "accountCode";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "address1";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "address2";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "tel1";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "tel2";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "fax";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);


            f = new SuField();
            f.name = "email";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "authorizedPerson";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "authorizedPersonTel";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "taxNo";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "note";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);

            f = new SuField();
            f.name = "usableFK";
            f.defaultValue = RecordCore.i2B(1);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("1|Kullanımda~2|Kullanım Dışı");
            _fields.add(f);

            f = new SuField();
            f.name = "typeFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("0|Standart~1|Depo~2|Banka~3|Firma");
            _fields.add(f);

            f = new SuField();
            f.name = "taxofficeFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new DynamicComboAdapter(TaxOffice.class, "taxOfficeName") {
            };
            _fields.add(f);

            f = new SuField();
            f.name = "cityFK";
            f.defaultValue = RecordCore.i2B(0);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new DynamicComboAdapter(City.class, "cityName") {
            };
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
        return empty;
    }

    @Override
    public void setEmpty(boolean empty) {
        this.empty = empty;
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
