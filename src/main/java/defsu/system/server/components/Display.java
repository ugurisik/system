package defsu.system.server.components;

import defsu.system.server.core.MapService;

import java.util.ArrayList;
import java.util.List;

public class Display extends Component{
    private static final long serialVersionUID = -5128929649829319532L;
    private List<Component> _components;
    private String _service;

    public Display() {
        this._initialize();
    }

    public Display(String id) {
        super(id);
        this._initialize();
    }

    public Display(Conf... configs) {
        super(configs);
        Conf[] var5 = configs;
        int var4 = configs.length;

        for (int var3 = 0; var3 < var4; ++var3) {
            Conf c = var5[var3];
            if (c instanceof Component) {
                this._components.add((Component) c);
            }
        }

        this._initialize();
    }

    private void _initialize() {
        this._components = new ArrayList();
    }

    public List<Component> getComponents() {
        return this._components;
    }

    public String getXType() {
        return "mdisplay";
    }

    public String getInputValue() {
        return this.getConfigs().containsKey("value") ? (String) ((Conf) this.getConfigs().get("value")).getValue() : "";
    }

    public String getValueProperty() {
        return "value";
    }

    public String getIcon() {
        return "../icons/components/display.png";
    }

    public String getTitle() {
        return this.getConfigs().containsKey("fieldLabel") ? ((Conf) this.getConfigs().get("fieldLabel")).getValue().toString() : "BAŞLIKSIZ";
    }

    public Display addService(Class<? extends MapService> cls) {
        this._service = cls.getName();
        this.addConfig(new Conf[]{new Component.CP("service", this._service)});
        return this;
    }

    public Display addListener(Component.ComponentListener listener) {
        return (Display) super.addListener(listener);
    }
}
