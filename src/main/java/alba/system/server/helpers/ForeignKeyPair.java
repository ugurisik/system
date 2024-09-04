package alba.system.server.helpers;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;

public class ForeignKeyPair implements Serializable {
    @Serial
    private static final long serialVersionUID = -6234807821339748490L;
    @Expose
    @SerializedName("key")
    public byte[] key;
    @Expose
    @SerializedName("value")
    public String value;
    @Expose
    @SerializedName("parent")
    public byte[] parent;

    public ForeignKeyPair(byte[] key, String value) {
        value = value.length() > 150 ? value.substring(0, 149) + "..." : value;
        this.key = key;
        this.value = value;
        this.parent = new byte[16];
    }

    public ForeignKeyPair(byte[] key, String value, byte[] parent) {
        this.key = key;
        this.value = value;
        this.parent = parent;
    }
}
