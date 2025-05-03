package defsu.system.server.components;

import defsu.system.projects.sys.record.User;
import defsu.system.projects.sys.record.UserPreference;
import defsu.system.server.auth.Permission;
import defsu.system.server.core.*;
import defsu.system.server.core.*;
import defsu.system.server.helpers.FormChange;
import defsu.system.server.helpers.InteractionMessage;
import defsu.system.server.helpers.StyleSheet;
import defsu.system.server.helpers.SuField;
import defsu.system.server.utils.Logger;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
public class WindowForm extends Window{
    public static final String SELF = "@self";
    private static final long serialVersionUID = 8127327451703128205L;
    private static final String LOG_UNIT = "WindowForm";
    private static StringDictionary<StringDictionary<WindowForm>> forms_ = new StringDictionary();
    private StringDictionary<User> watchList_ = new StringDictionary();
    private byte[] uuid_;
    private List<FormChange> changes_ = new ArrayList();
    private boolean statefull_ = false;
    private Component.CPA tools = new Component.CPA("tools");
    public WindowForm() {
        this.initialize();
    }

    public WindowForm(String id) {
        super(id);
        this.initialize();
    }

    public WindowForm(Conf... configs) {
        super(configs);
        this.initialize();
    }

    private void initialize() {
        this.addConfig(new Conf[]{new Component.CP("uuid", getUuid())});
        this.addConfig(new Conf[]{this.tools});
    }
    public String getUuid() {
        if (getUuid_() == null) {
            setUuid_(RecordCore.guid());
        }
        return RecordCore.b2H(getUuid_());
    }
    public static WindowForm getFormByUuid(String uuid) {
        SessionCore sc = SessionCore.getCurrentContext();
        return forms_.containsKey(sc.getSessionID()) ? (WindowForm) ((StringDictionary) forms_.get(sc.getSessionID())).get(uuid) : null;
    }
    public static WindowForm getFormByUuid(String uuid, String sessionid) {
        return forms_.containsKey(sessionid) ? (WindowForm) ((StringDictionary) forms_.get(sessionid)).get(uuid) : null;
    }
    public static WindowForm getFormByUuid(String uuid, SessionCore sc) {
        return forms_.containsKey(sc.getSessionID()) ? (WindowForm) ((StringDictionary) forms_.get(sc.getSessionID())).get(uuid) : null;
    }
    public static <V extends WindowForm> V getFormByClass(Class<V> cls) {
        return getFormByClass(cls, (SessionCore) null);
    }

    public static <V extends WindowForm> V getFormByClass(Class<V> cls, SessionCore targetContext) {
        SessionCore sc = (targetContext == null) ? SessionCore.getCurrentContext() : targetContext;
        String sessionID = sc.getSessionID();
        if (forms_.containsKey(sessionID)) {
            StringDictionary<WindowForm> userForms = forms_.get(sessionID);

            for (WindowForm form : userForms.values()) {
                if (form.getClass().equals(cls)) {
                    return cls.cast(form);
                }
            }
        }
        return null;
    }

    public static <V extends WindowForm> List<V> getFormByClassList(Class<V> cls, SessionCore targetContext) {
        List<V> formList = new ArrayList<>();
        SessionCore sc = (targetContext == null) ? SessionCore.getCurrentContext() : targetContext;
        String sessionID = sc.getSessionID();
        if (forms_.containsKey(sessionID)) {
            StringDictionary<WindowForm> userForms = forms_.get(sessionID);
            for (WindowForm form : userForms.values()) {
                if (form.getClass().equals(cls)) {
                    formList.add(cls.cast(form));
                }
            }
        }
        return formList;
    }

    public static void removeFormByClass(Class<? extends WindowForm> cls, SessionCore targetContext) {
        SessionCore sc = (targetContext == null) ? SessionCore.getCurrentContext() : targetContext;
        String sessionID = sc.getSessionID();
        List<String> toBeRemoved = new ArrayList<>();
        if (forms_.containsKey(sessionID)) {
            StringDictionary<WindowForm> userForms = forms_.get(sessionID);
            for (WindowForm form : userForms.values()) {
                if (form.getClass().equals(cls)) {
                    toBeRemoved.add(form.getUuid());
                }
            }
            for (String uuid : toBeRemoved) {
                userForms.remove(uuid);
            }
        }
    }

    public static void removeFormByClass(Class<? extends WindowForm> cls) {
        SessionCore sc = SessionCore.getCurrentContext();
        List<String> toBeRemoved = new ArrayList<>();

        if (forms_.containsKey(sc.getSessionID())) {
            StringDictionary<WindowForm> userForms = forms_.get(sc.getSessionID());
            for (WindowForm form : userForms.values()) {
                if (form.getClass().equals(cls)) {
                    toBeRemoved.add(form.getUuid());
                }
            }
            for (String uuid : toBeRemoved) {
                userForms.remove(uuid);
            }
        }
    }

    public static void removeAll(User user) {
        SessionCore sc = SessionCore.findUserContext(user);
        forms_.remove(sc.getSessionID());
    }

    public static void remove(WindowForm form) {
        SessionCore sc = SessionCore.getCurrentContext();
        StringDictionary<WindowForm> userForms = forms_.get(sc.getSessionID());
        userForms.remove(form.getUuid());
    }

    public static StringDictionary<WindowForm> getForms(String sessionId) {
        return forms_.containsKey(sessionId) ? forms_.get(sessionId) : null;
    }
    public static WindowForm getFormById(String id) {
        SessionCore sc = SessionCore.getCurrentContext();
        if (forms_.containsKey(sc.getSessionID())) {
            StringDictionary<WindowForm> userForms = forms_.get(sc.getSessionID());
            for (WindowForm form : userForms.values()) {
                if (form.getId().equals(id)) {
                    return form;
                }
            }
        }
        return null;
    }

    public static void addForm(WindowForm form) {
        addForm(form, null);
    }

    public static void addForm(WindowForm form, SessionCore targetContext) {
        SessionCore sc = (targetContext == null) ? SessionCore.getCurrentContext() : targetContext;
        String sessionID = sc.getSessionID();
        if (forms_.containsKey(sessionID)) {
            StringDictionary<WindowForm> userForms = forms_.get(sessionID);
            userForms.put(form.getUuid(), form);
        } else {
            StringDictionary<WindowForm> userForms = new StringDictionary<>();
            userForms.put(form.getUuid(), form);
            forms_.put(sessionID, userForms);
        }
    }

    public static SuResponse invoke(WindowForm form, String methodName) {
        return invoke(form, methodName, null);
    }

    public static SuResponse invoke(WindowForm form, String methodName, String target) {
        Method m = null;
        SuResponse response;

        try {
            try {
                if (target != null && !target.isEmpty()) {
                    m = form.getClass().getMethod(methodName, form.getClass(), String.class);
                } else {
                    m = form.getClass().getMethod(methodName, form.getClass());
                }
            } catch (NoSuchMethodException e) {
                if (WindowForm.class.isAssignableFrom(form.getClass().getSuperclass())) {
                    if (target != null && !target.isEmpty()) {
                        m = form.getClass().getSuperclass().getMethod(methodName, form.getClass().getSuperclass(), String.class);
                    } else {
                        m = form.getClass().getSuperclass().getMethod(methodName, form.getClass().getSuperclass());
                    }
                }
            }

            int minimumUserLevel = 2;
            Permission permission = m.getAnnotation(Permission.class);
            if (permission != null) {
                minimumUserLevel = permission.minimumUserLevel();
            }
            if (ServerUtility.getUser().getUserLevel() >= minimumUserLevel) {
                response = (target != null && !target.isEmpty()) ?
                        (SuResponse) m.invoke(form, form, target) :
                        (SuResponse) m.invoke(form, form);
            } else {
                response = new SuResponse();
                InteractionMessage message = new InteractionMessage();
                message.setTitle("YETKİ HATASI");
                message.setMessage("Bu işlemi yapmaya yetkiniz yok.");
                response.getMessages().add(message);
            }
        } catch (Exception e) {
            Logger.Error(e,"WindowForm InvocationError Error invoking : " + form.getClass().getName() + "." + methodName, true);
            response = new SuResponse();
            response.setStatusCode(SuResponse.STATUS_CODE_FAIL);
        }
        return response;
    }

    public static void fillRecord(SuRecord r, WindowForm form) {
        fillRecord(r, form, "");
    }

    public static SuRecord fillRecord(SuRecord r, WindowForm form, String suffix) {
        SuField.SuFieldList fields = r.getField().fields;
        for (int k = 0; k < fields.getCount(); k++) {
            SuField field = fields.get(k);
            Component cmp = form.findArgument(field.name + suffix);
            if (cmp != null) {
                Object inputValue = ObjectCore.parse(cmp.getInputValue().toString(), field);
                ObjectCore.setFieldValue(r, field.name, inputValue);
            }
        }
        return r;
    }

    public static void fillForm(SuRecord r, WindowForm form, String suffix) {
        SuField.SuFieldList fields = r.getField().fields;
        String langCode = "TR-TR";

        for (int k = 0; k < fields.getCount(); k++) {
            SuField field = fields.get(k);
            Component cmp = form.findArgument(field.name + suffix);
            if (cmp != null) {
                try {
                    String value;
                    StringDictionary<SuField.LanguageColumn> languageColumns = field.getLanguageColumns();

                    if (languageColumns != null && languageColumns.containsKey(langCode)) {
                        value = ObjectCore.convertToString(ObjectCore.getFieldValue(r, languageColumns.get(langCode).columnName), field.fieldType);
                    } else {
                        value = ObjectCore.convertToString(ObjectCore.getFieldValue(r, field.name), field.fieldType);
                    }

                    form.up(cmp.getId(), cmp.getValueProperty(), value);
                } catch (Exception e) {
                    Logger.Error(e,"WindowForm FillForm Can not get value of field: " + field.name + ". Reason: " + e.getMessage(),true);
                }
            }
        }
    }

    public static void fillForm(SuRecord r, WindowForm form) {
        fillForm(r, form, "");
    }

    public static Conf getStateValue(String name, String value, byte[] type) {
        if (Arrays.equals(type, RecordCore.i2B(1))) {
            return new Component.CP(name, value);
        } else if (Arrays.equals(type, RecordCore.i2B(2))) {
            return value.contains(".")
                    ? new Component.CPI(name, (int) Double.parseDouble(value))
                    : new Component.CPI(name, Integer.parseInt(value));
        } else if (Arrays.equals(type, RecordCore.i2B(3))) {
            return new Component.CPB(name, Boolean.parseBoolean(value));
        } else {
            return new Component.CP(name, value);
        }
    }

    public void setStatefull(boolean statefull) {
        setStatefull_(statefull);
       /* if (statefull) { // TODO:: this part is commented out
            List<UserPreferencee> states = UserPreferencee.findAll(this.getId());

            for (UserPreferencee state : states) {
                if (state.getComponentStateCmpId().equals("@self")) {
                    this.addConfig(getStateValue(state.getComponentStateProperty(), state.getComponentStateValue(), state.getComponentStateValueTypeFK()));
                } else {
                    Component cmp = this.findComponent(state.getComponentStateCmpId());
                    if (cmp != null) {
                        cmp.addConfig(getStateValue(state.getComponentStateProperty(), state.getComponentStateValue(), state.getComponentStateValueTypeFK()));
                    }
                }
            }
        }*/
    }
    public boolean isStatefull() {
        return this.statefull_;
    }
    private void addTool(String type) {
        this.tools.add(new Component.CPL("dummy", new Component.CP("type", type)));
    }

    public void enableCloseTool() {
        addTool("close");
    }

    public void enableHelpTool() {
        addTool("help");
    }

    public void enableNotifierTool() {
        addTool("pin");
    }

    public boolean setComponent(String componentId, String configParam, String value) {
        value = value.replace("&quot;", "\"");
        Component vc = componentId.equals("@self") ? this : this.findComponent(componentId);

        if (vc == null) {
            return false;
        }

        Conf cfg = getStateValue(configParam, value, UserPreference.getStateType(configParam));
        vc.addConfig(cfg);

        if (this.isStatefull() && !componentId.startsWith("ugr-id") && !configParam.equals("encodedPath")) {
            SessionCore sc = SessionCore.getCurrentContext();
            sc.getHibernateHandler().beginTransaction();

            UserPreference state = UserPreference.find(this.getId(), componentId, configParam);
            byte[] stateType = UserPreference.getStateType(configParam);

            if (state == null) {
                state = new UserPreference();
                state.setComponentStateCmpId(componentId);
                state.setComponentStateFormId(this.getId());
                state.setComponentStateProperty(configParam);
                state.setComponentStateValueTypeFK(stateType);
                state.setUserFK(ServerUtility.getUser().getUserPK());
            }

            if (stateType != null) {
                state.setComponentStateValue(value);
                state.save();
            }

            sc.getHibernateHandler().commitMain();
        }

        if (!this.getWatchList().isEmpty()) {
            for (String userId : this.getWatchList().keySet()) {
                User targetUser = this.getWatchList().get(userId);
                FormChange change = new FormChange(this.getUuid(), vc.getId(), configParam, cfg.getValue());

                WSUpdateCore.Payload p = new WSUpdateCore.Payload();
                p.changes = new ArrayList<>();
                p.changes.add(change);
                // TODO:: maybe this can be issue
                WSUpdateCore.pump("private.user." + targetUser.getUserName(), p);
            }
        }

        return true;
    }

    public Component findComponent(String componentId) {
        for (Component vc : this.getComponents()) {
            if (vc.getId().equals(componentId)) {
                return vc;
            }
        }
        return null;
    }

    public Component findArgument(String argumentName) {
        for (Component vc : this.getComponents()) {
            StringDictionary<Conf> configs = vc.getConfigs();
            if (configs.containsKey("argumentName")) {
                Conf config = configs.get("argumentName");
                if (config.getValue().equals(argumentName)) {
                    return vc;
                }
            }
        }
        return null;
    }


    public boolean addItem(String id, Component component) {
        Component cmp = id.equals("@self") ? this : this.findComponent(id);

        if (cmp instanceof Container) {
            ((Container) cmp).addItem(component);
            this.getComponents().add(component);

            FormChange change = new FormChange(this.getUuid(), id, "", Component.getJson(component));
            change.isNew = true;
            getChanges_().add(change);

            this.getComponents().clear();
            this.registerComponents();
            return true;
        }
        return false;
    }

    public boolean removeAllComponent(String id) {
        FormChange change = new FormChange(getUuid(), id, "removeAllComponent", "");
        change.isFunction = true;
        getChanges_().add(change);
        return true;
    }

    public boolean removeItem(String id, String childId) {
        Component cmp = id.equals("@self") ? this : findComponent(id);
        Component child = findComponent(childId);

        if (cmp instanceof Container && child != null) {
            Component.CPA itemsCfg = (Component.CPA) ((Container) cmp).getConfigs().get("items");

            if (itemsCfg != null) {
                ArrayList<Conf> items = (ArrayList<Conf>) itemsCfg.getValue();
                items.remove(child);
                this.getComponents().remove(child);

                FormChange change = new FormChange(this.getUuid(), id, "removeSubComponent", childId);
                change.isFunction = true;
                getChanges_().add(change);
            }
            return true;
        }
        return false;
    }

    public boolean changeFrameContent(String iframeId, String elementId, String value) {
        FormChange change = new FormChange();
        change.frameId = iframeId;
        change.id = elementId;
        change.value = value;
        getChanges_().add(change);
        return true;
    }

    public boolean up(String id, String pName, Object value) {
        Component cmp = id.equals("@self") ? this : this.findComponent(id);

        if (cmp != null) {
            StringDictionary<Conf> configs = (StringDictionary<Conf>) ((Component) cmp).getValue();
            FormChange change = this.findChange(id, pName);

            if (change == null) {
                change = new FormChange(this.getUuid(), id, pName, value instanceof Conf ? Component.getJson(value) : value);
            } else {
                change.value = value instanceof Conf ? Component.getJson(value) : value;
            }

            getChanges_().add(change);

            if (configs.containsKey(pName)) {
                Conf config = configs.get(pName);
                config.setValue(value instanceof Conf ? ((Conf) value).getValue() : value);
            } else {
                configs.put(pName, createComponentConfig(pName, value));
            }

            return true;
        }

        return false;
    }

    private Conf createComponentConfig(String pName, Object value) {
        if (value instanceof String) {
            return new Component.CP(pName, (String) value);
        } else if (value instanceof Integer) {
            return new Component.CPI(pName, (Integer) value);
        } else if (value instanceof Boolean) {
            return new Component.CPB(pName, (Boolean) value);
        } else if (value instanceof Component.CPL) {
            return (Component.CPL) value;
        } else if (value instanceof Component.CPA) {
            return (Component.CPA) value;
        }
        return null;
    }

    public StringDictionary<User> getWatchList() {
        return getWatchList_();
    }

    private FormChange findChange(String id, String property) {
        for (FormChange change : getChanges_()) {
            if (change.id.equals(id) && change.key.equals(property)) {
                return change;
            }
        }
        return null;
    }

    public boolean callFunction(String id, String fName, Object value) {
        Component cmp = id.equals("@self") ? this : this.findComponent(id);

        if (cmp != null) {
            FormChange change = new FormChange(this.getUuid(), id, fName, value instanceof Conf ? Component.getJson(value) : value);
            change.isFunction = true;
            getChanges_().add(change);
            return true;
        }
        return false;
    }

    public List<FormChange> getChanges() {
        if (!getWatchList_().isEmpty()) {
            for (String userId : this.getWatchList().keySet()) {
                User targetUser = this.getWatchList().get(userId);
                WSUpdateCore.Payload p = new WSUpdateCore.Payload();
                p.changes = new ArrayList<>(getChanges_());

                WSUpdateCore.pump("private.user." + targetUser.getUserName(), p);
            }
        }

        if (getChanges_() == null) {
            setChanges_(new ArrayList<>());
        }

        return getChanges_();
    }

    public void resetChanges() {
        setChanges_(new ArrayList<>());
    }

    public WindowForm addStyleSheet(StyleSheet... styles) {
        StringDictionary<Conf> configs = this.getConfigs();
        for (StyleSheet style : styles) {
            style.setKey_('#' + this.getId() + ' ' + style.getKey());
            style.setKey_('.' + this.getCls() + ' ' + style.getKey());
        }
        Component.CPL styleSheets = configs.containsKey("styleSheets")
                ? (Component.CPL) configs.get("styleSheets")
                : new Component.CPL("styleSheets", new Conf[0]);
        if (!configs.containsKey("styleSheets")) {
            this.addConfig(new Conf[]{styleSheets});
        }
        styleSheets.add(styles);
        return this;
    }

    public void checkPermissions() {
        for (Component component : this.getComponents()) {
            if (component instanceof Button) {
                Button btn = (Button) component;
                if (btn.getFormMethod() != null) {
                    try {
                        Method m = this.getClass().getMethod(btn.getFormMethod(), this.getClass());
                        Permission anPerm = m.getAnnotation(Permission.class);
                        if (anPerm != null && ServerUtility.getUser().getUserLevel() < anPerm.minimumUserLevel()) {
                            btn.addConfig(C.hidden());
                        }
                    } catch (Exception e) {
                        Logger.Error(e,"WindowForm method Cannot get properties of method: " + this.getClass() + "." + btn.getFormMethod(), true);
                    }
                }
            }
        }
    }

    public abstract static class EditorForm extends WindowForm {
        private static final long serialVersionUID = -2490570003214525902L;
        private EditorHandler handler;

        public EditorForm(Conf... configurables) {
            super(configurables);
        }

        public abstract void setTargetRecord(SuRecord record, EditorProperties properties);

        public EditorHandler getEditorHandler() {
            return this.handler;
        }

        public void setEditorHandler(EditorHandler handler) {
            this.handler = handler;
        }
    }

    public abstract static class EditorHandler implements Serializable {
        private static final long serialVersionUID = -5775963575103441985L;
        private final WindowForm form;

        public EditorHandler(WindowForm form) {
            this.form = form;
        }

        public WindowForm getForm() {
            return this.form;
        }

        public abstract SuResponse onEdit(Object data);
    }

    public static class EditorProperties implements Serializable {
        private static final long serialVersionUID = -8440583709272337465L;
        public Class<? extends EditorForm> editorClass;
        public Class<? extends MapService> serviceClass;
        public String editorFormName = "editor";
        public Serializable tag;
    }

    public abstract static class FormEvent implements Serializable {
        private static final long serialVersionUID = 8826434328969607976L;
        private final WindowForm form;

        public FormEvent(WindowForm form) {
            this.form = form;
        }

        public WindowForm getForm() {
            return this.form;
        }

        public abstract SuResponse onSelect(Object data);
    }

    public static class SelectorProperties implements Serializable {
        private static final long serialVersionUID = -1729581315990872271L;
        public Class<? extends WindowForm> selectorClass;
        public Class<? extends MapService> serviceClass;
        public String selectorFormName = "selector";
    }

}
