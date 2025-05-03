package defsu.system.server.helpers;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class NameValuePair implements Serializable {
    private static final long serialVersionUID = -6784457871910554184L;
    @Expose
    @SerializedName("name")
    public String name;
    @Expose
    @SerializedName("value")
    public String value;

    public NameValuePair(String name, String value) {
        this.name = name;
        this.value = value;
    }
}
