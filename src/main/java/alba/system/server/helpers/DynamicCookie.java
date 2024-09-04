package alba.system.server.helpers;

import alba.system.server.core.SessionCore;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class DynamicCookie {
    @Expose
    @SerializedName("name")
    public String name;
    @Expose
    @SerializedName("value")
    public String value;
    @Expose
    @SerializedName("days")
    public int days;

    public DynamicCookie() {
        this.name = "ALBAN";
        this.value = SessionCore.getCurrentContext().getSessionID();
        this.days = 1;
    }

    public DynamicCookie(String name, String value, int days) {
        this.name = name;
        this.value = value;
        this.days = days;
    }
}
