package alba.system.server.helpers;

import alba.system.server.utils.Logger;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class RecordRow implements Serializable {
    @Serial
    private static final long serialVersionUID = 1462121730244272882L;
    @Expose
    @SerializedName("columns")
    private List<RecordColumnData> _columns = new ArrayList();

    public List<RecordRow.RecordColumnData> getColumns() {
        return this._columns;
    }

    public void setColumns(List<RecordRow.RecordColumnData> values) {
        this._columns = values;
    }

    public RecordRow.RecordColumnData findColumn(String columnName) {

        try {
            for (RecordColumnData cData : this._columns) {
                if (cData._name.equals(columnName)) {
                    return cData;
                }
            }
        }catch (Exception e){
            Logger.Error(e,true);
            return null;
        }
        return null;
    }

    public static class RecordColumnData implements Serializable {
        @Serial
        private static final long serialVersionUID = 6416848689173830268L;
        @Expose
        @SerializedName("name")
        private String _name;
        @Expose
        @SerializedName("value")
        private String _value;
        @Expose
        @SerializedName("actualValue")
        private String _actualValue;
        @Expose
        @SerializedName("isInteger")
        public boolean isInteger = false;
        public boolean isDouble = false;
        @Expose
        @SerializedName("translateable")
        public String translateable;

        public RecordColumnData() {
            this._name = "";
            this._value = "";
            this._actualValue = "";
        }

        public RecordColumnData(String name, String value) {
            this._name = name;
            this._value = value;
            this._actualValue = "";
        }

        public String getName() {
            return this._name;
        }

        public String getValue() {
            return this._value;
        }

        public String getActualValue() {
            return this._actualValue;
        }

        public void setName(String name) {
            this._name = name;
        }

        public void setValue(String value) {
            this._value = value;
        }

        public void setActualValue(String actualValue) {
            this._actualValue = actualValue;
        }
    }
}
