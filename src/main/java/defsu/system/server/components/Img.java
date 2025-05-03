package defsu.system.server.components;

public class Img extends Container{
    private static final long serialVersionUID = -46697745362090765L;

    public Img() {
        this._initialize();
    }

    public Img(String id) {
        super(id);
        this._initialize();
    }

    public Img(Conf... configs) {
        super(configs);
        this._initialize();
    }

    private void _initialize() {
    }

    public String getXType() {
        return "mimage";
    }

    public Object getInputValue() {
        return this.getConfigs().containsKey("src") ? (String)((Conf)this.getConfigs().get("src")).getValue() : "";
    }
}
