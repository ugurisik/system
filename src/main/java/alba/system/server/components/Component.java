package alba.system.server.components;

import alba.system.server.core.RecordCore;
import alba.system.server.core.StringDictionary;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Getter
@Setter
public abstract class Component implements Conf, Serializable {
    @Serial
    private static final long serialVersionUID = -4338706178283645146L;
    private static final String LOG_UNIT_ = "Component";
    private static final String XTYPE_ = "xtype";
    private static final String ID_ = "id";
    public static int LABEL_WIDTH = 100;
    private String id_;
    private String cls_;
    private String xtype;
    private String key;
    private StringDictionary<Conf> configs;
    private List<Component.ComponentListener> listeners = new ArrayList();

    public Component() {
       setId_(genId());
        applyDefaultConfig();
    }

    public Component(String id) {
        setId_(id);
        applyDefaultConfig();
    }
    public Component(Conf... configs) {
        this.applyDefaultConfig();
        for (Conf config : configs) {
            getConfigs().put((String) config.getKey(), config);
            if (config.getKey().equals("id")) {
                setId_(config.getValue().toString());
            } else if (config.getKey().equals("cls")) {
                setCls_(config.getValue().toString());
            }
        }
    }
    public static String genId() {
        return "ugr-id-" + RecordCore.b2H(RecordCore.guid());
    }
    public String getValueProperty() {
        return "value";
    }
    public void setId(String id) {
        this.addConfig(new Component.CP("id", id));
        setId_(id);
    }
    public String getId(){return getId_();}
    public String getCls(){return getCls_();}
    public void setCls(String cls) {
        this.addConfig(new Component.CP("cls", cls));
        setCls_(cls);
    }

    public void applyDefaultConfig() {
        setConfigs(new StringDictionary());
        setId_(genId());
        getConfigs().put("id", new Component.CP("id", getId_()));
        getConfigs().put("cls", new Component.CP("cls", getCls_()));
        getConfigs().put("xtype", new Component.CP("xtype", this.getXType()));
        getConfigs().put("labelWidth", C.labelWidth(LABEL_WIDTH));
    }

    public abstract String getXType();

    public Component addConfig(Conf... configs) {
        for (Conf config : configs) {
            getConfigs().put(config.getKey(), config);
            if (config.getKey().equals("id")) {
                setId_(config.getValue().toString());
            } else if (config.getKey().equals("cls")) {
                setCls_(config.getValue().toString());
            }
        }
        return this;
    }
    public Object getInputValue() {
        return "";
    }
    public void setInputValue(String input) {
        getConfigs().put((String) "value", new Component.CP("value", input));
    }

    public Object getValue() {
        return getConfigs();
    }
    public void setValue(Object val) {
        if (val instanceof StringDictionary) {
            setConfigs((StringDictionary) val);
        }
    }
    public Component addListener(Component.ComponentListener listener) {
        getListeners().add(listener);
        Conf config = getConfigs().get("gListeners");
        if (config == null) {
            config = new Component.CPL("gListeners", new Component.CP(listener.name, listener.fn), new Component.CPB("hasTarget", listener.hasTarget));
            addConfig(config);
        } else {
            ((StringDictionary) config.getValue()).put((String) listener.name, new Component.CP(listener.name, listener.fn));
        }
        return this;
    }

    public String getTitle() {
        return getConfigs().containsKey("title") ? (getConfigs().get("title")).getValue().toString() : "BAŞLIKSIZ";
    }

    public String getIcon() {
        return "sources/assets/icons/component.png";
    }

    public boolean isContainsTitle() {
        return getConfigs().containsKey("title");
    }

    public static JsonElement getJson(Object o) {
        if (o instanceof WindowForm) {
            WindowForm form = (WindowForm) o;
            Conf yPos = (Conf) form.getConfigs().get("y");
            if (yPos != null && (Integer) yPos.getValue() < 0) {
                form.addConfig(C.y(0));
            }
        }

        if (o instanceof Component) {
            o = ((Component) o).getValue();
        } else if (o instanceof Component.CPL || o instanceof Component.CPA) {
            o = ((Conf) o).getValue();
        } else if (o instanceof Component.CA) {
            o = ((Component.CA) o).getValue();
        }

        if (o instanceof List<?> lc) {
            JsonArray ret = new JsonArray();
            if (!lc.isEmpty() && lc.getFirst() instanceof String) {
                for (Object item : lc) {
                    ret.add(new JsonPrimitive((String) item));
                }
            } else {
                for (Object item : lc) {
                    ret.add(getJson(((Conf) item)));
                }
            }
            return ret;
        }

        if (o instanceof StringDictionary) {
            JsonObject output = new JsonObject();
            StringDictionary<?> sd = (StringDictionary) o;
            for (Object oo : sd.values()) {
                Conf conf = (Conf) oo;
                Object value = conf.getValue();
                if (value instanceof String) {
                    output.addProperty(conf.getKey(), (String) value);
                } else if (value instanceof Boolean) {
                    output.addProperty(conf.getKey(), (Boolean) value);
                } else if (value instanceof Integer) {
                    output.addProperty(conf.getKey(), (Integer) value);
                } else if (value instanceof Double) {
                    output.addProperty(conf.getKey(), (Double) value);
                } else {
                    output.add(conf.getKey(), getJson(value));
                }
            }
            return output;
        }
        return new JsonObject();
    }


    @Getter
    @Setter
    public static class CA implements Conf {
        @Serial
        private static final long serialVersionUID = 3021631266862880040L;
        private List<String> list = new ArrayList<>();
        private String key_;
        public CA(String key, String... list) {
            setKey_(key);
            for (String s : list) {
                getList().add(s);
            }
        }
        public void add(String... list) {
            for (String s : list) {
                getList().add(s);
            }
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return getList();
        }
        public void setValue(Object val) {
        }
    }


    /*
     * Component
     */
    @Getter
    @Setter
    public static class CP implements Conf {
        @Serial
        private static final long serialVersionUID = -2862026657287910593L;
        private String key_;
        private String value_;
        public CP(String key, String value) {
            setKey_(key);
            setValue_(value);
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return getValue_();
        }
        public void setValue(Object val) {
            if (val instanceof String) {
                setValue_((String) val);
            }
        }
    }

    /*
     * Component Arrays
     */
    @Getter
    @Setter
    public static class CPA implements Conf {
        @Serial
        private static final long serialVersionUID = -9027044681089881558L;
        private String key_;
        private List<Conf> list = new ArrayList();

        public CPA(String key, Conf... list) {
            setKey_(key);
            add(list);
        }

        public void add(Conf... configs) {
            // TODO::YETKİ KONTROLÜ BURADA YAPILABİLİR
            for (Conf config : configs) {
                getList().add(config);
            }
        }

        public String getKey() {
            return getKey_();
        }

        public Object getValue() {
            return getList();
        }

        public void setValue(Object val) {
            if (val instanceof List) {
                list = (List) val;
            }
        }
    }


    /*
    * Component Header Buttons
    */
    @Getter
    @Setter
    public static class CPB implements Conf {
        @Serial
        private static final long serialVersionUID = -1650904402604230L;
        private String key_;
        private boolean value_;

        public CPB(String key, boolean value) {
            setKey_(key);
            setValue_(value);
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return isValue_();
        }
        public void setValue(Object val) {
            if (val instanceof Boolean) {
                setValue_((Boolean) val);
            }
        }
    }


    /*
     * Component Floats
     */
    @Getter
    @Setter
    public static class CPF implements Conf {
        @Serial
        private static final long serialVersionUID = -5022730392297510863L;
        private String key_;
        private double value_;

        public CPF(String key, double value) {
            setKey_(key);
            setValue_(value);
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return getValue_();
        }
        public void setValue(Object val) {
            if (val instanceof String) {
                setValue_(Double.parseDouble((String) val));
            }else if (val instanceof Double) {
                setValue_((Double) val);
            }
        }
    }

    /*
     * Component Integer
     */
    @Getter
    @Setter
    public static class CPI implements Conf {
        @Serial
        private static final long serialVersionUID = 2899994742896693716L;
        private String key_;
        private int value_;
        public CPI(String key, int value) {
            setKey_(key);
            setValue(value);
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return getValue_();
        }
        public void setValue(Object val) {
            if (val instanceof Integer) {
                setValue_((Integer) val);
            }
        }
    }

    /*
     * Component List
     */
    @Getter
    @Setter
    public static class CPL implements Conf {
        private static final long serialVersionUID = -5722920963037139187L;
        private String key_;
        private StringDictionary<Conf> list = new StringDictionary();

        public CPL(String key, Conf... list) {
            setKey_(key);
            for (Conf conf : list) {
                getList().put((String) conf.getKey(), conf);
            }
        }

        public void add(Conf... list) {
            for (Conf conf : list) {
                getList().put((String) conf.getKey(), conf);
            }
        }

        public String getKey() {
            return getKey_();
        }

        public Object getValue() {
            return getList();
        }

        public void setValue(Object val) {
            if (val instanceof StringDictionary) {
                list = (StringDictionary) val;
            }
        }
    }

    /*
     * Component String, TODO::Change to Translatable
     */
    @Getter
    @Setter
    public static class CPT implements Conf {
        @Serial
        private static final long serialVersionUID = 9202409659669476216L;
        private String key_;
        private String value_;

        public CPT(String key, String value) {
            setKey_(key);
            setValue_(value);
        }
        public String getKey() {
            return getKey_();
        }
        public Object getValue() {
            return getValue_();
        }
        public void setValue(Object val) {
            if (val instanceof String) {
                setValue_((String) val);
            }
        }
    }


    /*
     * Component Listeners
     */
    @Getter
    @Setter
    public static class ComponentListener implements Serializable {
        @Serial
        private static final long serialVersionUID = -8641474398063260174L;
        public String name;
        public String fn;
        public boolean hasTarget = false;

        public ComponentListener(String name, String fn) {
            setName(name);
            setFn(fn);
        }

        public Component.ComponentListener sendTarget(boolean sendTarget) {
            setHasTarget(sendTarget);
            return this;
        }
    }
}
