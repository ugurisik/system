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

    public Text x(int xVal){
        this.addConfig(new Component.CPI("x", xVal));
        return this;
    }

    public Text y(int yVal){
        this.addConfig(new Component.CPI("y", yVal));
        return this;
    }

    public Text width(int width){
        this.addConfig(new Component.CPI("width", width));
        return this;
    }

    public Text height(int width){
        this.addConfig(new Component.CPI("height", width));
        return this;
    }

    public Text maxLength(int width){
        this.addConfig(new Component.CPI("maxLength", width));
        return this;
    }

    public Text maxLengthText(String text){
        this.addConfig(new Component.CPT("maxLengthText", text));
        return this;
    }

    public Text minLength(int width){
        this.addConfig(new Component.CPI("minLength", width));
        return this;
    }

    public Text minLengthText(String text){
        this.addConfig(new Component.CPT("minLengthText", text));
        return this;
    }

    public Text emptyText(String text){
        this.addConfig(new Component.CPT("emptyText", text));
        return this;
    }

    public Text blankText(String text){
        this.addConfig(new Component.CPT("blankText", text));
        return this;
    }

    public Text dataName(String dName){
        this.addConfig(new Component.CP("argumentName", dName));
        return this;
    }

    public Text id(String dName){
        this.addConfig(new Component.CP("id", dName));
        return this;
    }

    public Text inputType(InputType type){
        this.addConfig(new Component.CP("inputType", type.toString()));
        return this;
    }

    public Text label(String label){
        this.addConfig(new Component.CPT("fieldLabel", label));
        return this;
    }

    public Text labelWidth(int labelW){
        this.addConfig(new Component.CPI("labelWidth", labelW));
        return this;
    }

    public Text allowBlank(boolean ab){
        this.addConfig(new Component.CPB("allowBlank", ab));
        return this;
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

    public static enum InputType{
        TEXT("text"),
        PASSWORD("password"),
        NUMBER("number"),
        EMAIL("email"),
        URL("url"),
        DATE("date"),
        TIME("time"),
        DATETIME("datetime"),
        MONTH("month"),
        YEAR("year"),
        SEARCH("search"),
        TEL("tel"),
        COLOR("color"),
        FILE("file"),
        RANGE("range"),
        DATETIMELOCAL("datetime-local"),
        WEEK("week"),
        TIMELOCAL("time-local");

        public String toString(){
            return this._value;
        }

        private String _value;
        InputType(String value){
            this._value = value;
        }
    }
}
