package defsu.system.server.core;

import defsu.system.server.helpers.*;
import defsu.system.server.helpers.*;
import defsu.system.server.utils.Enums;
import com.google.gson.*;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.lang.Record;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SuResponse {
    public static final String STATUS_CODE_OK = "100";
    public static final String STATUS_CODE_FAIL = "500";
    private static Gson gson;
    private static JsonParser parser;
    private static boolean initialized = false;
    public static InteractionMessage MSG_FIELDSMISSING;
    public static InteractionMessage MSG_SAVEERROR;
    public static InteractionMessage MSG_DELETEERROR;
    public static InteractionMessage MSG_NOTFOUND;
    public static InteractionMessage MSG_NOTSELECTED;
    public static InteractionMessage MSG_SUCCESS;
    public static InteractionMessage MSG_SAVEDUBLICATEERROR;

    @Expose
    @SerializedName("statusCode")
    private String _statusCode = "100";
    @Expose
    @SerializedName("id")
    private String _id;
    @Expose
    @SerializedName("date")
    private Date _date;
    @Expose
    @SerializedName("records")
    private List<Record> _records = new ArrayList();

    private String _session;
    private String _user;
    @Expose
    @SerializedName("messages")
    private List<InteractionMessage> _messages = new ArrayList();
    @Expose
    @SerializedName("manipulations")
    private List<RecordManipulation> _manipulations = new ArrayList();
    @Expose
    @SerializedName("rows")
    private List<RecordRow> _rows = new ArrayList();
    private JsonElement _form;
    @Expose
    @SerializedName("moduleInitiator")
    private SuResponse.ModuleInitiator _moduleInitiator;
    @Expose
    @SerializedName("translateables")
    private List<String> _translateables;
    @Expose
    @SerializedName("changes")
    private List<FormChange> _changes;
    @Expose
    @SerializedName("customData")
    private Object _customData;
    @Expose
    @SerializedName("cookies")
    private List<DynamicCookie> _cookies;
    @Expose
    @SerializedName("totalRows")
    private int _totalRows;
    @Expose
    @SerializedName("dateFormat")
    private String _dateFormat;
    @Expose
    @SerializedName("toolTips")
    private List<SuResponse.ToolTip> _toolTips = new ArrayList();
    @Expose
    @SerializedName("synchronousBox")
    private SynchInteraction.SynchronousBox _synchronousBox;

    public SuResponse(){
        if(!initialized){
            this.initialize();
        }
    }
    public static Gson getGSON() {
        if (gson == null) {
            GsonBuilder builder = new GsonBuilder();
            builder.excludeFieldsWithoutExposeAnnotation();
            builder.registerTypeAdapter(byte[].class, (new SuResponse.ByteArrayAdapter()).nullSafe());
            gson = builder.create();
        }
        return gson;
    }
    public static JsonParser getGSONParser() {
        if (parser == null) {
            parser = new JsonParser();
        }
        return parser;
    }
    private void initialize() {
        MSG_FIELDSMISSING = new InteractionMessage();
        MSG_FIELDSMISSING.title = "GENERAL_ERROR";
        MSG_FIELDSMISSING.message = "RESPONSE_FIELDSMISSING";
        MSG_FIELDSMISSING.type = Enums.InteractionMessageType.ERROR;
        MSG_SAVEERROR = new InteractionMessage();
        MSG_SAVEERROR.title = "GENERAL_SAVEERROR_TITLE";
        MSG_SAVEERROR.message = "GENERAL_SAVEERROR";
        MSG_SAVEERROR.type = Enums.InteractionMessageType.ERROR;
        MSG_DELETEERROR = new InteractionMessage();
        MSG_DELETEERROR.title = "GENERAL_DELETEERROR_TITLE";
        MSG_DELETEERROR.message = "GENERAL_DELETEERROR";
        MSG_DELETEERROR.type = Enums.InteractionMessageType.ERROR;
        MSG_NOTSELECTED = new InteractionMessage();
        MSG_NOTSELECTED.title = "GENERAL_ERROR";
        MSG_NOTSELECTED.message = "GENERAL_NOTSELECTED";
        MSG_NOTSELECTED.type = Enums.InteractionMessageType.ERROR;
        MSG_NOTFOUND = new InteractionMessage();
        MSG_NOTFOUND.title = "GENERAL_ERROR";
        MSG_NOTFOUND.message = "GENERAL_NOTFOUND";
        MSG_NOTFOUND.type = Enums.InteractionMessageType.ERROR;
        MSG_SUCCESS = new InteractionMessage();
        MSG_SUCCESS.title = "GENERAL_SUCCESS";
        MSG_SUCCESS.message = "GENERAL_SUCCESS_MESSAGE";
        MSG_SUCCESS.type = Enums.InteractionMessageType.SUCCESS;
        MSG_SAVEDUBLICATEERROR = new InteractionMessage();
        MSG_SAVEDUBLICATEERROR.title = "GENERAL_ERROR";
        MSG_SAVEDUBLICATEERROR.message = "GENERAL_DUBLICATE_ERROR";
        MSG_SAVEDUBLICATEERROR.type = Enums.InteractionMessageType.ERROR;
    }
    public static InteractionMessage createErrorMessage(String message) {
        InteractionMessage msg = new InteractionMessage();
        msg.title = "GENERAL_ERROR";
        msg.message = message;
        return msg;
    }

    public void setStatusCode(String statusCode) {
        this._statusCode = statusCode;
    }

    public String getStatusCode() {
        return this._statusCode;
    }

    public void setId(String id) {
        this._id = id;
    }

    public String getId() {
        return this._id;
    }

    public void setDate(Date date) {
        this._date = date;
    }

    public Date getDate() {
        return this._date;
    }

    public void setMessages(List<InteractionMessage> messages) {
        this._messages = messages;
    }

    public List<InteractionMessage> getMessages() {
        return this._messages;
    }

    public void setManipulations(List<RecordManipulation> manipulations) {
        this._manipulations = manipulations;
    }

    public List<RecordManipulation> getManipulations() {
        return this._manipulations;
    }

    public void setRecords(List<Record> records) {
        this._records = records;
    }

    public List<Record> getRecords() {
        return this._records;
    }

    public void setRows(List<RecordRow> rows) {
        this._rows = rows;
    }

    public List<RecordRow> getRows() {
        return this._rows;
    }

    public String getSession() {
        return this._session;
    }

    public void setSession(String session) {
        this._session = session;
    }

    public String getUser() {
        return this._user;
    }

    public void setUser(String user) {
        this._user = user;
    }

    public void setForm(JsonElement form) {
        this._form = form;
    }

    public JsonElement getForm() {
        return this._form;
    }

    public SuResponse.ModuleInitiator getModuleInitiator() {
        return this._moduleInitiator;
    }

    public void setModuleInitiator(SuResponse.ModuleInitiator mInitiator) {
        this._moduleInitiator = mInitiator;
    }

    public List<String> getTranslateables() {
        return this._translateables;
    }

    public void setTranslateables(List<String> trbs) {
        this._translateables = trbs;
    }

    public List<FormChange> getChanges() {
        if (this._changes == null) {
            this._changes = new ArrayList();
        }

        return this._changes;
    }

    public void setChanges(List<FormChange> changes) {
        this._changes = changes;
    }

    public Object getCustomData() {
        return this._customData;
    }

    public void setCustomData(Object customData) {
        this._customData = customData;
    }

    public List<DynamicCookie> getCookies() {
        if (this._cookies == null) {
            this._cookies = new ArrayList();
        }

        return this._cookies;
    }

    public void setCookies(List<DynamicCookie> cookies) {
        this._cookies = cookies;
    }

    public void setListResult(ObjectCore.ListResult result) {
        this._rows = result.rows;
        this._totalRows = result.numTotal;
        this._dateFormat = result.dateFormat;
    }

    public List<SuResponse.ToolTip> getToolTips() {
        return this._toolTips;
    }

    public void setToolTips(List<SuResponse.ToolTip> toolTips) {
        this._toolTips = toolTips;
    }

    public String toString() {
        return this._statusCode;
    }

    public SynchInteraction.SynchronousBox getSynchronousBox() {
        return this._synchronousBox;
    }

    public void setSynchronousBox(SynchInteraction.SynchronousBox synchronousBox) {
        this._synchronousBox = synchronousBox;
    }

    public static class ByteArrayAdapter extends TypeAdapter<byte[]> {
        public byte[] read(JsonReader reader) throws IOException {
            if (reader.peek() == JsonToken.NULL) {
                reader.nextNull();
                return null;
            } else {
                String sByte = reader.nextString();
                return RecordCore.h2B(sByte);
            }
        }

        public void write(JsonWriter writer, byte[] bytes) throws IOException {
            if (bytes == null) {
                writer.nullValue();
            } else {
                String output = RecordCore.b2H(bytes);
                writer.value(output);
            }
        }
    }
    public static class ModuleInitiator {
        private static final String DEFAULT_FORM = "default";
        @Expose
        @SerializedName("cls")
        public String className;
        @Expose
        @SerializedName("params")
        public List<SuResponse.ModuleInitiatorParam> params;
        @Expose
        @SerializedName("form")
        public String form;

        public ModuleInitiator() {
            this.className = "";
            this.form = "default";
            this.params = new ArrayList();
        }

        public ModuleInitiator(String className, SuResponse.ModuleInitiatorParam... params) {
            this.className = className;
            this.form = "default";
            this.params = new ArrayList();
            SuResponse.ModuleInitiatorParam[] var6 = params;
            int var5 = params.length;

            for(int var4 = 0; var4 < var5; ++var4) {
                SuResponse.ModuleInitiatorParam p = var6[var4];
                this.params.add(p);
            }

        }
    }

    public static class ModuleInitiatorParam {
        @Expose
        @SerializedName("key")
        public String key;
        @Expose
        @SerializedName("value")
        public String value;

        public ModuleInitiatorParam(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    public static class ToolTip {
        @Expose
        @SerializedName("target")
        public String target;
        @Expose
        @SerializedName("message")
        private String _messageTranslated;
        public String message;
    }
}
