package alba.system.server.components;

import alba.system.server.core.MapService;
import alba.system.server.core.StringDictionary;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.util.ArrayList;
import java.util.Iterator;
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
