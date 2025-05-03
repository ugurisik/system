package defsu.system.server.components;

public class Toolbar extends Container {
    private static final long serialVersionUID = 7763476084348061629L;

    public Toolbar() {
        this._initialize();
    }

    public Toolbar(String id) {
        super(id);
        this._initialize();
    }

    public Toolbar(Conf... configs) {
        super(configs);
        this._initialize();
    }

    private void _initialize() {
    }

    public String getXType() {
        return "mtoolbar";
    }

    public String getIcon() {
        return "sources/assets/icons/components/toolbar.png";
    }
}
