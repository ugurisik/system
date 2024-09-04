package alba.system.server.core;

import java.io.Serializable;

public interface SuRecord extends Serializable {
    SuRecord.RecordProperties getField();

    void procces();

    boolean disableLog();

    public static class RecordProperties implements Serializable {
        public String primaryKey;
    }
}
