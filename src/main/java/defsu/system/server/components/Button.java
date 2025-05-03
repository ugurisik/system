package defsu.system.server.components;

import defsu.system.server.core.MapService;
import defsu.system.server.helpers.RecordArgument;
import defsu.system.server.helpers.RecordMethod;

public class Button extends Component{
    private static final long serialVersionUID = -3296364159999403299L;
    private String _service;
    private String _formMethod;

    public Button() {
        this._initialize();
    }

    public Button(String id) {
        super(id);
        this._initialize();
    }

    public Button(Conf... configs) {
        super(configs);
        this._initialize();
    }

    private void _initialize() {
        // Initialization logic (if any) goes here
    }

    @Override
    public String getXType() {
        return "mbutton";
    }

    public Button addService(Class<? extends MapService> cls) {
        this._service = cls.getName();
        this.addConfig(new Component.CP("service", this._service));
        return this;
    }

    public Button addMethod(RecordMethod method) {
        Component.CPA args = new Component.CPA("args", new Conf[0]);

        for(int k = 0; k < method.argumentList.getCount(); ++k) {
            RecordArgument arg = method.argumentList.get(k);
            Component.CPL cArg = new Component.CPL("arg", new Conf[0]);
            cArg.add(new Component.CP("name", arg.name));
            cArg.add(new Component.CPT("title", arg.title));
            cArg.add(new Component.CP("type", arg.argumentType.toString()));
            args.add(cArg);
        }

        this.addConfig(new Component.CPL("method", new Conf[]{new Component.CP("name", method.name), args}));
        return this;
    }

    @Override
    public Button addConfig(Conf... configs) {
        super.addConfig(configs);
        return this;
    }

    public Button addFormMethod(String methodName) {
        this._formMethod = methodName;
        this.addConfig(new Component.CP("formMethod", methodName));
        return this;
    }

    public String getFormMethod() {
        return this._formMethod;
    }

    public Button addAction(String actionName) {
        this.addConfig(new Component.CP("action", actionName));
        return this;
    }

    public static Button SAVE(String id) {
        return new Button(C.id(id), C.text("KAYDET"), C.iconFile("save.png"), C.iconFolder("stk"), C.Button.confirmMessage("Kaydetmek istediğinize emin misiniz?"));
    }

    public static Button EDIT(String id) {
        return new Button(C.id(id), C.text("GENERAL_EDIT", true), C.iconFile("gtk-edit.png"), C.iconFolder("actions"));
    }

    public static Button DELETE(String id) {
        return new Button(C.id(id), C.text("GENERAL_DELETE", true), C.iconFile("gtk-delete.png"), C.iconFolder("actions"), C.Button.confirmMessage("Bu kaydı silmek istediğinize emin misiniz? Bu işlem çoğu zaman geri alınamaz!"));
    }

    public static Button NEW(String id) {
        return new Button(C.id(id), C.text("GENERAL_NEW", true), C.iconFile("gtk-new.png"), C.iconFolder("actions"));
    }

    public static Button CLOSE(String id) {
        return new Button(C.id(id), C.text("GENERAL_CLOSE", true), C.iconFile("gtk-close.png"), C.iconFolder("actions"));
    }

    public static Button PRINT(String id) {
        return new Button(C.id(id), C.text("GENERAL_PRINT", true), C.iconFile("gtk-print.png"), C.iconFolder("actions"));
    }

    public static Button EXPORT(String id) {
        return new Button(C.id(id), C.text("GENERAL_EXPORT", true), C.iconFile("document-export.png"), C.iconFolder("actions"), C.Button.lockUntilResponse());
    }

    @Override
    public String getIcon() {
        return "../icons/components/button.png";
    }

    @Override
    public String getTitle() {
        return this.getConfigs().containsKey("text") ? this.getConfigs().get("text").getValue().toString() : "BAŞLIKSIZ";
    }
}
