package defsu.system.server.components;

import java.io.Serial;

public class Window extends Panel{
    @Serial
    private static final long serialVersionUID = -3842922350358073446L;

    public Window() {
        this.initialize();
    }

    public Window(String id) {
        super(id);
        this.initialize();
    }

    public Window(Conf... configs) {
        super(configs);
        this.initialize();
    }

    private void initialize() {
    }

    public String getXType() {
        return "window";
    }

    public static class Events {
        public static final String CLICK_HELP = "clickhelp";
        public static final String ONCLOSE = "onClose";
    }

    public static class Functions {
        public static final String OPEN_URL = "openUrl";
    }
}
