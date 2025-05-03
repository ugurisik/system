package defsu.system.server.helpers;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Record implements Serializable {
    @Serial
    private static final long serialVersionUID = -4767682419644204013L;

    @Expose
    @SerializedName("values")
    private List<RecordValue> _values = new ArrayList<>();

    public List<RecordValue> getValues() {
        return this._values;
    }

    public void setValues(List<RecordValue> values) {
        this._values = values;
    }
    public RecordValue getRecordValue(String fieldName) {
        try{
            for (RecordValue value : this._values) {
                if (fieldName.equals(value.getField().name)) {
                    return value;
                }
            }
            return null;
        }catch (Exception e){
            return null;
        }
    }
}
