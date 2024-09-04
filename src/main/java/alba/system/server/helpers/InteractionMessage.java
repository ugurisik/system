package alba.system.server.helpers;

import alba.system.server.utils.Enums;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;

public class InteractionMessage implements Serializable {
    @Serial
    private static final long serialVersionUID = 3202216389445789604L;
    @Expose
    @SerializedName("type")
    public Enums.InteractionMessageType type;
    @Expose
    @SerializedName("title")
    public String title;
    @Expose
    @SerializedName("message")
    public String message;
    @Expose
    @SerializedName("ignore")
    public boolean ignore;

    @Expose
    @SerializedName("buttons")
    public InteractionMessage.InteractionButtonList buttons;
    public boolean translated;

    public InteractionMessage() {
        this.type = Enums.InteractionMessageType.NEUTRAL;
        this.title = "GENEL";
        this.message = "GENEL";
        this.buttons = new InteractionMessage.InteractionButtonList();
        this.translated = false;
        this.ignore = false;
    }

    public InteractionMessage setType(Enums.InteractionMessageType type) {
        this.type = type;
        return this;
    }

    public InteractionMessage setTitle(String title) {
        this.title = title;
        return this;
    }

    public InteractionMessage setMessage(String message) {
        this.message = message;
        return this;
    }

    public class InteractionButton {
        public String label = "";
        public Enums.InteractionButtonType type;
        public String keyboardShortcut;
        public RecordMethod method;

        public InteractionButton() {
            this.type = Enums.InteractionButtonType.BRIGHT;
            this.keyboardShortcut = "";
        }
    }

    public class InteractionButtonList {
        private ArrayList<InteractionButton> _buttonList;

        public int getCount() {
            return this._buttonList.size();
        }

        public InteractionButtonList() {
            this._buttonList = new ArrayList();
        }

        public InteractionButtonList(int count) {
            this._buttonList = new ArrayList(count);
        }

        public InteractionMessage.InteractionButton get(int index) {
            return (InteractionMessage.InteractionButton)this._buttonList.get(index);
        }

        public void set(int index, InteractionMessage.InteractionButton button) {
            this._buttonList.set(index, button);
        }

        public void add(InteractionMessage.InteractionButton button) {
            this._buttonList.add(button);
        }
    }
}
