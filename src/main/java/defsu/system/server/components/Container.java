package defsu.system.server.components;

import defsu.system.server.core.MapService;
import defsu.system.server.core.StringDictionary;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Container extends Component{
    @Serial
    private static final long serialVersionUID = -8000394019195645585L;
    private List<Component> components_ = new ArrayList();
    private String service_;

    public Container() {
        this.initialize();
    }

    public Container(String id) {
        super(id);
        this.initialize();
    }

    public Container(Conf... configs) {
        super(configs);
        this.initialize();
        for (Conf c : configs) {
            _registerComponents(c);
        }
    }

    public Container absolute(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "absolute")}));
        return this;
    }

    public Container fit(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "fit")}));
        return this;
    }

    public Container border(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "border")}));
        return this;
    }

    public Container accordion(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "accordion")}));
        return this;
    }

    public Container anchor(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "anchor")}));
        return this;
    }

    public Container hbox(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "hbox")}));
        return this;
    }

    public Container vbox(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "vbox")}));
        return this;
    }

    public Container form(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "form")}));
        return this;
    }

    public Container column(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "column")}));
        return this;
    }

    public Container table(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "table")}));
        return this;
    }

    public Container card(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "card")}));
        return this;
    }

    public Container tabpanel(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "tabpanel")}));
        return this;
    }

    public Container regionCenter(){
        this.addConfig(new Component.CP("region", "center"));
        return this;
    }

    public Container regionWest(){
        this.addConfig(new Component.CP("region", "west"));
        return this;
    }

    public Container regionEast(){
        this.addConfig(new Component.CP("region", "east"));
        return this;
    }

    public Container regionNorth(){
        this.addConfig(new Component.CP("region", "north"));
        return this;
    }

    public Container regionSouth(){
        this.addConfig(new Component.CP("region", "south"));
        return this;
    }




    public Container id(String dName){
        this.addConfig(new Component.CP("id", dName));
        return this;
    }

    public Container x(int xVal){
        this.addConfig(new Component.CPI("x", xVal));
        return this;
    }

    public Container y(int yVal){
        this.addConfig(new Component.CPI("y", yVal));
        return this;
    }

    public Container width(int width){
        this.addConfig(new Component.CPI("width", width));
        return this;
    }

    public Container height(int width){
        this.addConfig(new Component.CPI("height", width));
        return this;
    }



    public List<Component> getComponents() {
        return getComponents_();
    }

    private void _registerComponents(Conf c) {
        Object o = c.getValue();

        if (!(c instanceof Component.CA)) {
            if (o instanceof List) {
                for (Conf cc : (List<Conf>) o) {
                    _registerComponents(cc);
                }
            } else if (o instanceof StringDictionary) {
                for (Conf cc : ((StringDictionary<Conf>) o).values()) {
                    _registerComponents(cc);
                }
            }
        }

        if (c instanceof Component) {
            getComponents_().add((Component) c);
        }
    }
    public void registerComponents() {
        for (Conf c : this.getConfigs()
                .values()) {
            this._registerComponents(c);
        }
    }
    private void initialize() {
        components_ = new ArrayList();
    }
    public String getXType() {
        return "container";
    }

    public Container addItem(Component component) {
        StringDictionary<Conf> configs = this.getConfigs();
        Component.CPA items;
        if (configs.containsKey("items")) {
            items = (Component.CPA)configs.get("items");
        } else {
            items = new Component.CPA("items", new Conf[0]);
            addConfig(items);
        }
        items.add(component);
        return this;
    }
    
    public Component addService(Class<? extends MapService> cls) {
        setService_(cls.getName());
        addConfig(new CP("service", getService_()));
        return this;
    }

    public void addDockedItem(Component component) {
        StringDictionary<Conf> configs = this.getConfigs();
        Component.CPA dockedItems;
        if (configs.containsKey("dockedItems")) {
            dockedItems = (Component.CPA)configs.get("dockedItems");
        } else {
            dockedItems = new Component.CPA("dockedItems", new Conf[0]);
            addConfig(dockedItems);
        }
        dockedItems.add(component);
    }
}
