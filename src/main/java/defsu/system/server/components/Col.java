package defsu.system.server.components;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Col extends Component{
    @Serial
    private static final long serialVersionUID = 111111111111111111L;
    private List<Component> components_;
    private boolean editable = false;

    public Col() {
        this.initialize();
    }

    public Col(String id) {
        super(id);
        this.initialize();
    }

    public Col(Conf... configs) {
        super(configs);
        for (Conf c : configs) {
            if (c instanceof Component) {
                getComponents_().add((Component) c);
            }
        }
        this.initialize();
    }

    public Col width(int width){
        this.addConfig(new Component.CPI("width", width));
        return this;
    }

    public Col text(String text){
        this.addConfig(new Component.CP("text", text));
        return this;
    }

    public Col dataIndex(String index){
        this.addConfig(new Component.CP("dataIndex", index));
        return this;
    }

    public Col setEditable(boolean editable) {
        if (editable) {
            if (!getConfigs().containsKey("editor")) {
                addConfig(new Conf[]{new Component.CPL("editor", new Conf[]{new Component.CP("xtype", "textfield"), new Component.CPB("allowBlank", false)})});
            }
        } else{
            getConfigs().remove("editor");
        }
        this.editable = editable;
        return this;
    }
    private void initialize() {
        components_ = new ArrayList();
    }

    public List<Component> getComponents() {
        return components_;
    }

    public String getXType() {
        return "mgridcolumn";
    }

    public String getTitle() {
        return getConfigs().containsKey("text") ? (getConfigs().get("text")).getValue().toString() : "BAŞLIKSIZ";
    }

}
