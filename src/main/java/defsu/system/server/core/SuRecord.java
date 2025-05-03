package defsu.system.server.core;

import defsu.system.server.helpers.RecordMethod;
import defsu.system.server.helpers.SuField;

import java.io.Serializable;

public interface SuRecord extends Serializable {
    SuRecord.RecordProperties getField();

    void procces();

    boolean disableLog();

    public static class RecordProperties implements Serializable {
        public String title="";
        public String primaryKey;
        public String style = "ugrgrid-row-default";
        public SuField.SuFieldList fields;
        public RecordMethod.RecordMethodList methods;
    }
}
