package defsu.system.server.components;

public class Tab extends Panel {
    private static final long serialVersionUID = -2897444308330801348L;

    public Tab() {
        this._initialize();
    }

    public Tab(Conf... confs){
        super(confs);
        this._initialize();
    }

    private void _initialize() {
    }

    public String getXType() {
        return "mtabpanel";
    }

    public String getIcon() {
        return "../icons/components/tab_panel.png";
    }

    public int getActiveTab() {
        return this.getConfigs().containsKey("activeTab") ? (Integer) ((Conf) this.getConfigs().get("activeTab")).getValue() : 0;
    }
}
