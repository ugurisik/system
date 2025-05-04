package defsu.system.projects.sys.record;

import defsu.system.server.core.*;
import defsu.system.server.core.*;
import defsu.system.server.helpers.RecordManipulation;
import defsu.system.server.helpers.RecordMethod;
import defsu.system.server.helpers.SuField;
import defsu.system.server.maps.MapComponentstate;
import defsu.system.server.maps.MapUser;
import defsu.system.server.utils.Enums;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.Getter;
import lombok.Setter;


public class UserPreference extends MapComponentstate implements SuRecord {
    public static final long serialVersionUID = 1L;
    private boolean empty = true;
    public static final String PRIMARY_KEY = "componentStatePK";
    private static RecordMethod.RecordMethodList _methods;
    private static SuField.SuFieldList _fields;
    private static StringDictionary<byte[]> _valueTypes;

    public UserPreference() {
        setEmpty(true);
        initialize();
    }

    @Override
    public RecordManipulation delete() {
        return null;
    }



    public UserPreference(Object pk) {
        Object o = null;
        initialize();
        if (pk instanceof byte[]) {
            o = ObjectCore.load(this.getClass(), (byte[]) pk);
        } else if (pk instanceof String) {
            o = ObjectCore.load(this.getClass(), RecordCore.h2B((String) pk));
        }
        if (o == null) {
            setEmpty(true);
        } else {
            this.setEmpty(false);
            ObjectCore.copyPojoToRecord(o, this);
        }
    }

    private void initialize() {

    }

    public static UserPreference find(String form, String componentId, String property) {
        CriteriaBuilder builder = HibernateCore.getMainSessionFactory().getCriteriaBuilder();
        CriteriaQuery<MapComponentstate> criteria = builder.createQuery(MapComponentstate.class);
        Root<MapComponentstate> root = criteria.from(MapComponentstate.class);
        criteria.select(root).where(
                builder.equal(root.get("componentStateFormId"), form),
                builder.equal(root.get("componentStateCmpId"), componentId),
                builder.equal(root.get("componentStateProperty"), property),
                builder.equal(root.get("userFK"), ServerUtility.getUser().getUserPK())
        );
        ObjectCore.ListResult result = ObjectCore.list(UserPreference.class,criteria);
        if(result.records.size()>0){
            return (UserPreference) result.records.get(0);
        }else{
            return null;
        }


    }

    public static byte[] getStateType(String configParam) {
        if (_valueTypes == null) {
            _valueTypes = new StringDictionary();
            _valueTypes.put((String) "x", RecordCore.i2B(2));
            _valueTypes.put((String) "y", RecordCore.i2B(2));
            _valueTypes.put((String) "width", RecordCore.i2B(2));
            _valueTypes.put((String) "height", RecordCore.i2B(2));
            _valueTypes.put((String) "value", RecordCore.i2B(1));
            _valueTypes.put((String) "maximized", RecordCore.i2B(3));
            _valueTypes.put((String) "hidden", RecordCore.i2B(3));
            _valueTypes.put((String) "selected", RecordCore.i2B(1));
            _valueTypes.put((String) "selectedNode", RecordCore.i2B(1));
            _valueTypes.put((String) "collapsed", RecordCore.i2B(3));
            _valueTypes.put((String) "pressed", RecordCore.i2B(3));
            _valueTypes.put((String) "encodedPath", RecordCore.i2B(1));
            _valueTypes.put((String) "encodedPosition", RecordCore.i2B(1));
            _valueTypes.put((String) "clickPosition", RecordCore.i2B(1));
            _valueTypes.put((String) "location", RecordCore.i2B(1));
            _valueTypes.put((String) "visibleArea", RecordCore.i2B(1));
            _valueTypes.put((String) "file", RecordCore.i2B(1));
            _valueTypes.put((String) "folder", RecordCore.i2B(1));
            _valueTypes.put((String) "activeTab", RecordCore.i2B(2));
            _valueTypes.put((String) "dateselection", RecordCore.i2B(1));
        }

        return (byte[]) _valueTypes.get(configParam);
    }

    public RecordManipulation save() {
        RecordManipulation manipulation = new RecordManipulation();
        if (this.getComponentStatePK() == null) {
            manipulation.type = Enums.ManipulationType.INSERT;
        } else {
            manipulation.type = Enums.ManipulationType.UPDATE;
        }

        boolean result = ObjectCore.save(this, false, false);
        if (result) {
            User fetched = new User();
            if (ObjectCore.load(fetched.getClass(), this.getUserFK()) != null) {
                this.setUser((MapUser) ObjectCore.getPojo(fetched));
            }

            manipulation.targetClass = this.getClass().getName();
            manipulation.targetPK = RecordCore.b2H(this.getComponentStatePK());
            manipulation.status = Enums.StatusType.SUCCESS;
            manipulation.row = ObjectCore.getRecordRow(this);
            this.setEmpty(false);
        } else {
            manipulation.status = Enums.StatusType.FAIL;
        }

        return manipulation;
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
    public void process() {

    }

    @Override
    public void _initialize() {

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
        this.empty = empty;
    }


}
