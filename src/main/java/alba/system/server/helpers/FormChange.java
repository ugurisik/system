package alba.system.server.helpers;

import com.google.gson.JsonElement;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

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
        this.formUuid = formUuid;
        this.key = key;
        this.value = value;
        this.id = id;
        if (value instanceof JsonElement) {
            this.jValue = (JsonElement) value;
        }

    }
}
