package alba.system.server.components;

import alba.system.server.core.MapService;
import alba.system.server.core.RecordCore;
import alba.system.server.core.SuRecord;
import alba.system.server.helpers.ForeignKeyPair;
import alba.system.server.helpers.SuField;

import java.util.ArrayList;
import java.util.List;



public class Combo extends Component {
    private static final long serialVersionUID = 4747400492150320627L;
    private List<Component> _components = new ArrayList<>();
    private SuField _field;
    private static final List<ComboRegister> _registers = new ArrayList<>();
    private static boolean isWatchingChanges = false;

    public static void watchChanges() {
        isWatchingChanges = true;
    }

    public Combo() {
        _initialize();
    }

    public Combo(String id) {
        super(id);
        _initialize();
    }

    public Combo(Conf... configs) {
        super(configs);
        for (Conf c : configs) {
            if (c instanceof Component) {
                this._components.add((Component) c);
            }
        }
        _initialize();
    }

    public Combo addListener(Component.ComponentListener listener) {
        super.addListener(listener);
        return this;
    }

    private void _initialize() {
        this.addConfig(new Conf[]{new Component.CPB("forceSelection", true)});
    }

    public List<Component> getComponents() {
        return this._components;
    }

    public String getXType() {
        return "mcombo";
    }

    public String getInputValue() {
        return this.getConfigs().containsKey("value") ? (String) this.getConfigs().get("value").getValue() : "";
    }

    public Combo fromField(SuField field, boolean isHidden) {
        if (!isHidden) {
            this._field = field;
            if (field.comboAdapter != null) {
                this.addConfig(new Conf[]{this.getPairs()});
                if (isWatchingChanges && field.comboAdapter instanceof DynamicComboAdapter) {
                    ComboRegister reg = new ComboRegister();
                    reg.combo = this;
                    reg.target = ((DynamicComboAdapter) field.comboAdapter).getTargetClass();
                    _registers.add(reg);
                }
            }
        }
        return this;
    }

    public Combo fromField(SuField field) {
        return fromField(field, false);
    }

    public Combo resetPairs() {
        if (this._field != null && this._field.comboAdapter instanceof DynamicComboAdapter) {
            ((DynamicComboAdapter) this._field.comboAdapter).resetPairs();
            this.addConfig(new Conf[]{this.getPairs()});
        }
        return this;
    }

    public ComboAdapter getComboAdapter() {
        return this._field != null ? this._field.comboAdapter : null;
    }

    public static Component.CPA proccesPair(List<ForeignKeyPair> pairs) {
        Component.CPA data = new Component.CPA("comboData");

        for (ForeignKeyPair pair : pairs) {
            boolean translateable = false;
            String value = pair.value;
            String translateableKey = "";

          /*  if (pair.value.startsWith("??") && pair.value.endsWith("??")) {
                translateableKey = pair.value.substring(2, pair.value.length() - 2);
                value = Definitions.getLiteral(translateableKey);
                translateable = true;
            }*/

            data.add(new Component.CPL("data",
                    new Conf[]{new Component.CP("key", RecordCore.b2H(pair.key)),
                            new Component.CP("value", value),
                            new Component.CP("parent", RecordCore.b2H(pair.parent)),
                            new Component.CPB("translateable", translateable),
                            new Component.CP("translateableKey", translateableKey)}
            ));
        }

        return data;
    }

    public Component.CPA getPairs() {
        return this.getComboAdapter() != null
                ? proccesPair(this.getComboAdapter().getPairs())
                : new Component.CPA("comboData");
    }

    public Combo addService(Class<? extends MapService> cls) {
        this.addConfig(new Conf[]{new Component.CP("service", cls.getName())});
        return this;
    }

    public static void updateRegisters(Class<? extends SuRecord> cls) {
        if (isWatchingChanges) {
            for (ComboRegister reg : _registers) {
                if (reg.target.equals(cls)) {
                    ComboAdapter adapter = reg.combo.getComboAdapter();
                    if (adapter instanceof DynamicComboAdapter) {
                        ((DynamicComboAdapter) adapter).resetPairs();
                    }
                    reg.combo.addConfig(new Conf[]{reg.combo.getPairs()});
                }
            }
        }
    }

    public static class ComboRegister {
        public Combo combo;
        public Class<? extends SuRecord> target;
    }

    public static class Events {
        public static final String AFTER_SELECT = "afterselect";
    }
}
