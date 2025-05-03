package defsu.system.server.helpers;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

public class RecordValue implements Serializable {
    @Serial
    private static final long serialVersionUID = -1313311932062658548L;
    @Expose
    @SerializedName("value")
    private String _value;
    @Expose
    @SerializedName("rawValue")
    private String _rawValue;
    @Expose
    @SerializedName("field")
    private SuField _field;
    @Expose
    @SerializedName("adapter")
    private List<ForeignKeyPair> _pairs;

    public RecordValue() {
        this._value = "";
        this._rawValue = "";
    }

    public RecordValue(SuField field) {
        if (field.defaultValue != null) {
            this._value = field.defaultValue.toString();
        }

        this._field = field;
        this._rawValue = "";
    }

    public String getValue() {
        return this._value;
    }

    public String rawValue() {
        return this._rawValue;
    }

    public SuField getField() {
        return this._field;
    }

    public void setValue(String value) {
        this._value = value;
    }

    public void setRawValue(String rawValue) {
        this._rawValue = rawValue;
    }

    public void setField(SuField field) {
        this._field = field;
    }
}
