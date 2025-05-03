package defsu.system.server.components;

import defsu.system.server.core.MapService;

import java.util.ArrayList;
import java.util.List;

public class Text extends Component{
    private static final long serialVersionUID = 2700613114439530211L;
    private List<Component> _components;
    private String _service;

    public Text(){
        this._initialize();
    }

    public Text(String id){
        super(id);
        this._initialize();
    }

    public Text(Conf... confs){
        super(confs);
        for (Conf c : confs) {
            if (c instanceof Component) {
                this._components.add((Component) c);
            }
        }
        this._initialize();
    }

    private void _initialize(){
        this._components = new ArrayList<>();
    }

    public List<Component> getComponents(){
        return this._components;
    }

    @Override
    public String getXType() {
        return "mtextfield";
    }

    public String getInputValue(){
        return this.getConfigs().containsKey("value") ? (String) ((Conf) this.getConfigs().get("value")).getValue() : "";
    }

    public String getValueProperty(){
        return "value";
    }

    public String getIcon(){
        return "../icons/components/textbox.png";
    }

    public String getTitle(){
        return this.getConfigs().containsKey("title") ? (String) ((Conf) this.getConfigs().get("title")).getValue() : "";
    }

    public Text addService(Class<? extends MapService> cls){
        this._service = cls.getName();
        this.addConfig(new Component.CP("service", this._service));
        return this;
    }

    public Text addListener(Component.ComponentListener listener){
        return (Text) super.addListener(listener);
    }

    public static class Configs{
        public static final String BACKGROUND = "background";
    }
    public static class Events {
        public static final String START_EDIT = "startedit";
        public static final String STOP_EDIT = "stopedit";
        public static final String ENTER_KEY = "enterkey";
        public static final String ALT_KEY = "altkey";
    }
}
