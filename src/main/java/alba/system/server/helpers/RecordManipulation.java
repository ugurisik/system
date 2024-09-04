package alba.system.server.helpers;

import alba.system.server.core.RecordCore;
import alba.system.server.utils.Enums;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class RecordManipulation  implements Serializable {
    private static final long serialVersionUID = 6271112525497921631L;
    @Expose
    @SerializedName("class")
    public String targetClass = "";
    @Expose
    @SerializedName("targetView")
    public String targetView;
    @Expose
    @SerializedName("pk")
    public String targetPK = RecordCore.b2H(new byte[16]);
    @Expose
    @SerializedName("type")
    public Enums.ManipulationType type;
    @Expose
    @SerializedName("status")
    public Enums.StatusType status;
    @Expose
    @SerializedName("record")
    public Record record;
    @Expose
    @SerializedName("row")
    public RecordRow row;
    @Expose
    @SerializedName("owner")
    public String owner;
    public String errorMessage = "GENERAL_ERROR";

    public RecordManipulation() {
        this.type = Enums.ManipulationType.NONE;
        this.status = Enums.StatusType.NONE;
        this.owner = "";
    }

    public RecordManipulation copy() {
        RecordManipulation output = new RecordManipulation();
        output.record = this.record;
        output.row = this.row;
        output.status = this.status;
        output.targetClass = this.targetClass;
        output.targetPK = this.targetPK;
        output.type = this.type;
        output.owner = this.owner;
        if (this.targetView != null) {
            output.targetView = new String(this.targetView);
        }

        return output;
    }
}
