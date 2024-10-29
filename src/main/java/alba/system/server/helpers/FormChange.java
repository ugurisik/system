package alba.system.server.helpers;

import com.google.gson.JsonElement;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class FormChange {
    private static final long serialVersionUID = -8901341665970050178L;
    @Expose
    @SerializedName("formUuid")
    public String formUuid;
    @Expose
    @SerializedName("id")
    public String id;
    @Expose
    @SerializedName("isNew")
    public boolean isNew = false;
    @Expose
    @SerializedName("isFunction")
    public boolean isFunction = false;
    @Expose
    @SerializedName("key")
    public String key;
    @Expose
    @SerializedName("value")
    public Object value;
    @Expose
    @SerializedName("jValue")
    public JsonElement jValue;
    @Expose
    @SerializedName("frameId")
    public String frameId;

    public FormChange() {
    }

    public FormChange(String formUuid, String id, String key, Object value) {
        setFormUuid(formUuid);
        setKey(key);
        setValue(value);
        setId(id);
        if (value instanceof JsonElement) {
            setJValue((JsonElement) value);
        }

    }
}
