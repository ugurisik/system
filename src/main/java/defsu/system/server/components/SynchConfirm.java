package defsu.system.server.components;

import defsu.system.server.core.SuResponse;
import defsu.system.server.helpers.NameValuePair;
import defsu.system.server.helpers.SynchInteraction;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

public class SynchConfirm extends SynchInteraction {
    public static final String TOKEN_SELECT = "select";
    private boolean result;
    private String title;
    private String message;

    public SynchConfirm(String title, String message) {
        this.title = title;
        this.message = message;
    }

    public SynchConfirm(String message) {
        this.title = "ONAY";
        this.message = message;
    }


    protected SuResponse start() {
        SuResponse response = new SuResponse();
        SynchConfirm.SynchronousConfirmMessage confirmMessage = new SynchConfirm.SynchronousConfirmMessage();
        confirmMessage.setTitle(this.title.toString());
        confirmMessage.setMessage(this.message.toString());


        confirmMessage.addChoice(new NameValuePair("yes", "Evet"));
        confirmMessage.addChoice(new NameValuePair("no", "Hayır"));
        response.setSynchronousBox(confirmMessage);
        return response;
    }

    protected SuResponse process(String message) {
        if (message.startsWith("select")) {
            String response = message.substring(7);
            if (response.equals("yes")) {
                this.result = true;
            }
        }
        return null;
    }

    protected Boolean end() {
        return this.result;
    }

    public Boolean interact() {
        return (Boolean) super.interact();
    }

    public static class SynchronousConfirmMessage extends SynchInteraction.SynchronousBox {
        @Expose
        @SerializedName("choices")
        private List<NameValuePair> choices = new ArrayList();
        @Expose
        @SerializedName("title")
        private String title = "";
        @Expose
        @SerializedName("message")
        private String message = "";
        @Expose
        @SerializedName("type")
        private String type = "confirm";

        public void addChoice(NameValuePair pair) {
            this.choices.add(pair);
        }

        public String getTitle() {
            return this.title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return this.message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getType() {
            return this.type;
        }
    }
}
