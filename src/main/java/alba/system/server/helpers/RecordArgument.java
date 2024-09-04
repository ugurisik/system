package alba.system.server.helpers;

import alba.system.server.utils.Enums;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.ArrayList;

public class RecordArgument {
    @Expose
    @SerializedName("name")
    public String name = "";
    public Object defaultValue = "";
    public String title;
    @Expose
    @SerializedName("title")
    private String _titleTranslated;
    @Expose
    @SerializedName("type")
    public Enums.ArgumentType argumentType;
    public ComboAdapter comboAdapter;
    @Expose
    @SerializedName("displayAs")
    public Enums.DisplayType displayAs;

    public RecordArgument() {
        this.argumentType = Enums.ArgumentType.STRING;
        this.displayAs = Enums.DisplayType.TEXTBOX;
    }

    public static class RecordArgumentList implements Serializable {
        private static final long serialVersionUID = -6972974658590763601L;
        private ArrayList<RecordArgument> _arguments;
        private ArrayList<String> _argumentNames;

        public int getCount() {
            return this._arguments.size();
        }

        public RecordArgumentList() {
            this._arguments = new ArrayList();
            this._argumentNames = new ArrayList();
        }

        public RecordArgumentList(int count) {
            this._arguments = new ArrayList(count);
            this._argumentNames = new ArrayList(count);
        }

        public RecordArgument get(int index) {
            return (RecordArgument)this._arguments.get(index);
        }

        public RecordArgument get(String name) {
            for(int k = 0; k < this._argumentNames.size(); ++k) {
                if (((String)this._argumentNames.get(k)).equals(name)) {
                    return (RecordArgument)this._arguments.get(k);
                }
            }

            return null;
        }

        public void set(int index, RecordArgument argument) {
            this._arguments.set(index, argument);
            this._argumentNames.set(index, argument.name);
        }

        public void add(RecordArgument argument) {
            this._arguments.add(argument);
            this._argumentNames.add(argument.name);
        }
    }
}
