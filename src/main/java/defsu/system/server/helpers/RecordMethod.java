package defsu.system.server.helpers;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;

public class RecordMethod implements Serializable {
    @Serial
    private static final long serialVersionUID = 3495617079514708679L;
    @Expose
    @SerializedName("name")
    public String name = "";
    public String title = "";
    public Class<? extends defsu.system.server.components.WindowForm> WindowForm;
    @Expose
    @SerializedName("arguments")
    public RecordArgument.RecordArgumentList argumentList = new RecordArgument.RecordArgumentList();
    @Expose
    @SerializedName("title")
    private String _titleTranslated = "";

    public static class RecordMethodList implements Serializable {
        private static final long serialVersionUID = -8021913718705816661L;
        private ArrayList<RecordMethod> _methods;
        private ArrayList<String> _methodNames;

        public RecordMethodList() {
            this._methods = new ArrayList<>();
            this._methodNames = new ArrayList<>();
        }

        public RecordMethodList(int count) {
            this._methods = new ArrayList<>(count);
            this._methodNames = new ArrayList<>(count);
        }

        public int getCount() {
            return this._methods.size();
        }

        public RecordMethod get(int index) {
            return (RecordMethod) this._methods.get(index);
        }

        public RecordMethod get(String name) {
            for (int k = 0; k < this._methodNames.size(); ++k) {
                if (((String) this._methodNames.get(k)).equals(name)) {
                    return (RecordMethod) this._methods.get(k);
                }
            }
            return null;
        }

        public void set(int index, RecordMethod method) {
            this._methods.set(index, method);
            this._methodNames.set(index, method.name);
        }

        public void add(RecordMethod method) {
            this._methods.add(method);
            this._methodNames.add(method.name);
        }
    }
}
