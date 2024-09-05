package alba.system.server.components;

import java.io.Serial;

public class Panel extends Container{
    @Serial
    private static final long serialVersionUID = 4492981097415099709L;
    public Panel() {
        this.initialize();
    }

    public Panel(String id) {
        super(id);
        this.initialize();
    }

    public Panel(Conf... configs) {
        super(configs);
        this.initialize();
    }

    private void initialize() {
    }

    public String getXType() {
        return "mpanel";
    }

    public String getIcon() {
        return "sources/assets/icons/panel.png";
    }
}
