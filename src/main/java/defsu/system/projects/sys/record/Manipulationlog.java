package defsu.system.projects.sys.record;

import defsu.system.server.components.SimpleComboAdapter;
import defsu.system.server.core.*;
import defsu.system.server.core.*;
import defsu.system.server.helpers.RecordMethod;
import defsu.system.server.helpers.SuField;
import defsu.system.server.maps.MapUserlog;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Manipulationlog extends MapUserlog implements SuRecord {
    private boolean empty = true;
    public static final String PRIMARY_KEY = "manipulationLogPK";
    private static SuField.SuFieldList _fields;
    private static RecordMethod.RecordMethodList _methods;

    public Manipulationlog(){
        setEmpty(true);
        _initialize();
    }

    public Manipulationlog(Object pk){
        _initialize();
        Object o = null;
        if(pk instanceof byte[]){
            o = ObjectCore.load(this.getClass(), (byte[])pk);
        }else if(pk instanceof String){
            o = ObjectCore.load(this.getClass(), RecordCore.h2B((String)pk));
        }
        if(o == null){
            setEmpty(true);
        }else{
            this.setEmpty(false);
            ObjectCore.copyPojoToRecord(o,this);
        }
    }


    public static byte[] getLastLog(byte[] targetFK) {
        CriteriaBuilder builder = HibernateCore.getMainSessionFactory().getCriteriaBuilder();
        CriteriaQuery<MapUserlog> criteria = builder.createQuery(MapUserlog.class);
        Root<MapUserlog> root = criteria.from(MapUserlog.class);
        criteria.select(root).where(
                builder.equal(root.get("visible"),true),
                builder.equal(root.get("manipulationLogTargetFK"), targetFK)
        ).orderBy(builder.desc(root.get("createdDate")));
        ObjectCore.ListResult result = ObjectCore.list(Manipulationlog.class, criteria);
        if(result.records.size()>0){
            Manipulationlog ml = (Manipulationlog) result.records.get(0);
            return ml.getManipulationLogData();
        }else{
            return RecordCore.i2B(0);
        }
    }

    private void _initialize() {
        if (_fields == null) {
            _fields = new SuField.SuFieldList();
            SuField f = new SuField();
            f.name = "manipulationLogPK";
            f.defaultValue = null;
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "userFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.relation = new SuField.FieldRelation(User.class, SuField.FieldRelationType.MANY_TO_ONE);
            f.relation.displayFields = new String[]{"userName", "userRealName"};
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogClass";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogClassTitle";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogTypeFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("1|Insert~2|Update~3|Delete");
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogDT";
            f.defaultValue = ServerUtility.now();
            f.fieldType = SuField.FT.DATETIME;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogStatusFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("1|Log~2|Rolled back");
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogData";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "manipulationLogTargetFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "createdDate";
            f.defaultValue = ServerUtility.now();
            f.fieldType = SuField.FT.DATETIME;
            f.displayAs = SuField.DT.DATETIMEPICKER;
            f.sortable = true;
            f.searchable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "visible";
            f.defaultValue = true;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);
        }

        if (_methods == null) {
            _methods = new RecordMethod.RecordMethodList();
        }

        ObjectCore.setFieldsToDefaults(this);
    }

    @Override
    public RecordProperties getField() {
        RecordProperties props = new RecordProperties();
        props.fields = _fields;
        props.primaryKey = PRIMARY_KEY;
        props.methods = _methods;
        return props;
    }

    @Override
    public void procces() {

    }

    @Override
    public boolean disableLog() {
        return true;
    }
}
