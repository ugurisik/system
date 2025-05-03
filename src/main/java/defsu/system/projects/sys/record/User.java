package defsu.system.projects.sys.record;

import defsu.system.SystemApplication;
import defsu.system.projects.sys.forms.auth.LoginForm;
import defsu.system.projects.sys.services.auth.LoginService;
import defsu.system.server.auth.Permission;
import defsu.system.server.components.SimpleComboAdapter;
import defsu.system.server.components.WindowForm;
import defsu.system.server.core.*;
import defsu.system.server.helpers.*;
import defsu.system.server.core.*;
import defsu.system.server.helpers.*;
import defsu.system.server.maps.MapUser;
import defsu.system.server.utils.Enums;
import defsu.system.server.utils.Logger;
import defsu.system.server.utils.ModuleUtils;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Getter
@Setter
public class User extends MapUser implements SuRecord {
    private boolean empty = true;
    public static final String PRIMARY_KEY = "userPK";
    private static RecordMethod.RecordMethodList _methods;
    private static SuField.SuFieldList _fields;
    private static List<User.UserPresence> _presences = new ArrayList();
    private static List<User.LoginHandler> loginHandlers = new ArrayList();
    private byte[] userPK;
    private int userLevel;
    private String userName;

   public User(){
       setEmpty(true);
       initialize();
   }

    public User(Object userPK){
        Object o = null;
        initialize();
       if(userPK instanceof byte[]){
           o = ObjectCore.load(this.getClass(), (byte[])userPK);
       }else if(userPK instanceof String){
           o = ObjectCore.load(this.getClass(), RecordCore.h2B((String)userPK));
       }
        if(o == null){
            setEmpty(true);
        }else{
            this.setEmpty(false);
            ObjectCore.copyPojoToRecord(o,this);
        }
    }

    private void initialize() {
        if (_fields == null) {
            _fields = new SuField.SuFieldList();
            SuField f = new SuField();
            f.name = "userPK";
            f.defaultValue = null;
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "userName";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "userPassword";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.visualize = new SuField.FieldVisualizer() {
                public String morph(SuRecord r) {
                    return ((User) r).getUserPassword().length() > 0 ? "**********" : "";
                }
            };
            _fields.add(f);
            f = new SuField();
            f.name = "userRealName";
            f.defaultValue = "";
            f.searchable = true;
            f.sortable = true;
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "userPassword";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "userLastLoginDT";
            f.defaultValue = ServerUtility.emptyDate;
            f.fieldType = SuField.FT.DATETIME;
            _fields.add(f);
            f = new SuField();
            f.name = "roleFK";
            f.defaultValue = RecordCore.i2B(1);
            f.fieldType = SuField.FT.BYTE_ARRAY;
          /*  f.comboAdapter = new DynamicComboAdapter(ArkPermission.class, "roleTitle") {
                private static final long serialVersionUID = 993155017907063470L; // TODO::
            };*/
            f.displayAs = SuField.DT.COMBOBOX;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "userLevelFK";
            f.defaultValue = RecordCore.i2B(1);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.comboAdapter = new SimpleComboAdapter("1|??FormUser.LBL_GUEST??~2|Giriş Yapmış Kullanıcı~3|1. seviye moderatör~4|2. Seviye Moderatör~5|3. Seviye Moderatör~6|1. Seviye Yönetici~7|2. Seviye Yönetici~8|3. Seviye Yönetici~9|Süper Admin");
            f.displayAs = SuField.DT.COMBOBOX;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "userEmail";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.searchable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "userStyle";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "userStatusFK";
            f.defaultValue = RecordCore.i2B(1);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.comboAdapter = new SimpleComboAdapter("0|Pasif~1|Aktif");
            f.displayAs = SuField.DT.COMBOBOX;
            _fields.add(f);
           /* f = new SuField();
            f.name = "companyName";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            f.fetchFrom = "companyFK";
            _fields.add(f);*/
            f = new SuField();
            f.name = "userLanguageFK";
            f.defaultValue = RecordCore.i2B(1);
            f.fieldType = SuField.FT.BYTE_ARRAY;
            f.displayAs = SuField.DT.COMBOBOX;
            f.comboAdapter = new SimpleComboAdapter("1|Türkçe~2|English");
            _fields.add(f);
            f = new SuField();
            f.name = "staffFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "terminalFK";
            f.defaultValue = new byte[16];
            f.fieldType = SuField.FT.BYTE_ARRAY;
            _fields.add(f);
            f = new SuField();
            f.name = "userKey";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "userPhoto";
            f.defaultValue = "";
            f.fieldType = SuField.FT.STRING;
            _fields.add(f);
            f = new SuField();
            f.name = "createdDate";
            f.defaultValue = ServerUtility.now();
            f.fieldType = SuField.FT.DATETIME;
            f.displayAs = SuField.DT.DATETIMEPICKER;
            f.sortable = true;
            f.searchable = true;
            _fields.add(f);
            f = new SuField();
            f.name = "visible";
            f.defaultValue = true;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);
            f = new SuField();
            f.name = "userRequestNewPassword";
            f.defaultValue = true;
            f.fieldType = SuField.FT.BOOLEAN;
            _fields.add(f);
            f = new SuField();
            f.name = "migrationRef";
            f.defaultValue = 0;
            f.fieldType = SuField.FT.INTEGER;
            f.searchable = true;
            f.sortable = true;
            _fields.add(f);
        }
       
       
        if (_methods == null) {
            _methods = new RecordMethod.RecordMethodList();
            RecordMethod m = new RecordMethod();
            m.name = "login";
            m.WindowForm = LoginForm.class;
            m.title = "User.method.login.title";
            RecordArgument a = new RecordArgument();
            a.name = "userName";
            a.title = "User.method.login.argument.userName.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            a = new RecordArgument();
            a.name = "password";
            a.title = "User.method.login.argument.password.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            _methods.add(m);
            m = new RecordMethod();
            m.name = "loginMobile";
            m.WindowForm = LoginForm.class;
            m.title = "User.method.login.title";
            a = new RecordArgument();
            a.name = "userName";
            a.title = "User.method.login.argument.userName.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            a = new RecordArgument();
            a.name = "password";
            a.title = "User.method.login.argument.password.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            _methods.add(m);
            m = new RecordMethod();
            m.name = "checkLogin";
            m.title = "User.method.checkLogin.title";
            _methods.add(m);
            m = new RecordMethod();
            m.name = "getTranslateables";
            m.title = "User.method.login.title";
            a = new RecordArgument();
            a.name = "translateables";
            a.title = "Generic.Empty";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            _methods.add(m);
            m = new RecordMethod();
            m.name = "getShortcuts";
            m.title = "User.method.getShortcuts.title";
            _methods.add(m);
            m = new RecordMethod();
            m.name = "getStartmenu";
            m.title = "User.method.getStartMenu.title";
            _methods.add(m);
            m = new RecordMethod();
            m.name = "logout";
            m.title = "User.method.logout.title";
            _methods.add(m);
            m = new RecordMethod();
            m.name = "changeContext";
            m.WindowForm = LoginForm.class;
            m.title = "User.method.changeContext.title";
            a = new RecordArgument();
            a.name = "sid";
            a.title = "User.method.changeContext.argument.sid.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            _methods.add(m);
            m = new RecordMethod();
            m.name = "changeContextKeepSession";
            m.WindowForm = LoginForm.class;
            m.title = "User.method.changeContext.title";
            a = new RecordArgument();
            a.name = "sid";
            a.title = "User.method.changeContext.argument.sid.title";
            a.argumentType = Enums.ArgumentType.STRING;
            a.displayAs = Enums.DisplayType.TEXTBOX;
            m.argumentList.add(a);
            _methods.add(m);
        }
        ObjectCore.setFieldsToDefaults(this);
    }


    public int getUserLevel() {
        return this.getUserLevelFK() != null ? this.getUserLevelFK()[15] : 0;
    }

    public static void onLogin(User.LoginHandler handler) {
        loginHandlers.add(handler);
    }


    private static final ExecutorService executorService = Executors.newSingleThreadExecutor();
    @Permission(minimumUserLevel = 1)
    public static SuResponse changeContext(String sid) {
        SessionCore.change(sid);
        return buildResponse();
    }

    @Permission(minimumUserLevel = 1)
    public static SuResponse changeContextKeepSession(String sid) {
        executorService.submit(() -> {
            try {
                Thread.sleep(4000L);
                SessionCore.change(sid, false);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("Change context interrupted: " + e.getMessage());
            }
        });
        return buildResponse();
    }

    private static SuResponse buildResponse() {
        SuResponse response = new SuResponse();
        response.setStatusCode("100");
        response.getCookies().add(new DynamicCookie("ALBAL", ServerUtility.getParameter("lang"), 30));
        return response;
    }

    @Permission(
            minimumUserLevel = 1
    )
    public SuResponse login(String userName, String password){
        SuResponse response = new SuResponse();

        if(userName.isEmpty() || password.isEmpty()){
            response.getMessages().add(ModuleUtils.errorMessage("Giriş Hatası","Kullanıcı adı ve şifre boş bırakılamaz!"));
            return response;
        }


        SessionCore sc = SessionCore.getCurrentContext();
        HibernateCore hc = sc.getHibernateHandler();


        CriteriaBuilder builder = hc.getCriteriaBuilder();
        CriteriaQuery<MapUser> criteria = builder.createQuery(MapUser.class);
        Root<MapUser> root = criteria.from(MapUser.class);
        criteria.select(root).where(
                builder.equal(root.get("userName"), userName)
        );
        ObjectCore.ListResult result = ObjectCore.list(User.class,criteria);
        if(!result.records.isEmpty()){
            User user = (User) result.records.get(0);
            ObjectCore.copyPojoToRecord(user,this);

            InteractionMessage locked = new InteractionMessage();
            locked.type = Enums.InteractionMessageType.ERROR;
            if(this.getMigrationRef() >= 10){
                if(this.getMigrationRef() == 99){
                    locked.setMessage("Kullanıcınız kullanım dışı olması sebebiyle giriş yetkiniz kaldırılmıştır. Sistem yöneticinize başvurun.");
                }else{
                    locked.setMessage("Kullanıcınız hatalı şifre denemesi nedeniyle kitlenmiştir. Sistem yöneticinize başvurun");
                }
                response.getMessages().add(locked);
                return response;
            }else{
                if(Arrays.equals(this.getUserStatusFK(), RecordCore.i2B(0))){
                    locked.setMessage("Kullanıcınız pasif durumda olduğu için giriş yapamazsınız. Sistem yöneticinize başvurun.");
                    response.getMessages().add(locked);
                    return response;
                }else{
                    byte[] hash = null;
                    try{
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        hash = digest.digest(password.getBytes("UTF-8"));
                    }catch (Exception e){
                        Logger.Error(e,"Şifreleme hatası",true);
                    }
                    String hashedPass = RecordCore.b2H(hash);
                    if((hash != null) && (this.getUserPassword().equals(hashedPass) || password.equals(this.getUserPassword()))){
                        this.setMigrationRef(1);
                        this.setUserLastLoginDT(new Date());
                        this.setEmpty(false);
                        ObjectCore.save(this);
                        List<SessionCore> userContexts = SessionCore.getUserContexts(this);
                        if (userContexts.size() > 0) {
                            boolean confirm = ModuleUtils.confirmMessage("Çoklu Oturum", "Bu kullanıcıya ait başka oturumlar açık. Bu oturumları kapatmak ister misiniz?");
                            if(!confirm){
                                response.getMessages().add(ModuleUtils.errorMessage("Çoklu Oturum","İsteğiniz üzere giriş işlemi iptal edildi!"));
                                return response;
                            }
                        }else{
                            //response.getMessages().add(ModuleUtils.successMessage("Giriş Başarılı","Hoşgeldiniz " + this.getUserRealName()));
                        }
                        ServerUtility.setUser(this);
                        changePresence(new User.UserPresence(this));
                        response.getCookies().add(new DynamicCookie("ALBAN", sc.getSessionID(), SystemApplication.USERCOOKIEDAY));
                        WSUpdateCore.Payload p = new WSUpdateCore.Payload();
                        p.fn = "login";
                        ArrayList<NameValuePair> customData = new ArrayList();
                        customData.add(new NameValuePair("userName", user.getUserName()));
                        customData.add(new NameValuePair("userRealName", user.getUserRealName()));
                        p.customData = customData;
                        WSUpdateCore.pump("admin.logins", p);
                        WSUpdateCore.subscribe("admin.logins");
                        WSUpdateCore.subscribe("private.user." + user.getUserName());
                        WSUpdateCore.subscribe("private.session." + sc.getSessionID());
                        response.setCustomData(customData);
                        if (user.getUserRequestNewPassword()) {
                            SuResponse.ModuleInitiator initiator = new SuResponse.ModuleInitiator();
                            initiator.className = LoginService.class.getName();
                            initiator.form = "cp";
                            response.setModuleInitiator(initiator);
                        } else {
                            String newVersionName = (String) ServerUtility.getConfig("GNL", "versionName", 0);
                            String userKey = ObjectCore.toString(ServerUtility.getUser().getUserPK());
                            String currentVersionName = (String) ServerUtility.getConfig("PROMPT", userKey, "");
                            if (!newVersionName.equals(currentVersionName)) {
                                ServerUtility.setConfig("PROMPT", userKey, newVersionName);
                                SuResponse.ModuleInitiator initiator = new SuResponse.ModuleInitiator();
                                initiator.className = LoginService.class.getName();
                                initiator.form = "pr";
                                response.setModuleInitiator(initiator);
                            }
                        }
                        Iterator it = loginHandlers.iterator();

                        while (it.hasNext()) {
                            User.LoginHandler handler = (User.LoginHandler) it.next();
                            handler.onLogin(user, response);
                        }



                    }else{
                        locked.setMessage("Kullanıcı adı veya şifre hatalı!");
                        response.getMessages().add(locked);
                        this.setMigrationRef(this.getMigrationRef() + 1);
                        ObjectCore.save(this);
                        return response;
                    }
                }
            }


        }else{
            response.getMessages().add(ModuleUtils.errorMessage("Giriş Hatası","Kullanıcı bulunamadı!"));
        }

        return response;
    }

    @Permission(
            minimumUserLevel = 1
    )
    public static SuResponse checkLogin() {
        SuResponse response = new SuResponse();
        if (ServerUtility.getParameter("role").equals("public")) {
            List<NameValuePair> pairs = new ArrayList();
            User publicUser = new User();
            publicUser.setUserName("public");
            publicUser.setUserRealName("Memur");
            ServerUtility.setUser(publicUser);
            pairs.add(new NameValuePair("userName", publicUser.getUserName()));
            pairs.add(new NameValuePair("userRealName", publicUser.getUserRealName()));
            response.setCustomData(pairs);
        } else {
            User cUser = ServerUtility.getUser();
            if (cUser.isEmpty()) {
                response.setModuleInitiator(new SuResponse.ModuleInitiator(LoginService.class.getName(), new SuResponse.ModuleInitiatorParam[]{new SuResponse.ModuleInitiatorParam("userName", "default")}));
            } else {
                List<NameValuePair> pairs = new ArrayList();
                pairs.add(new NameValuePair("userName", cUser.getUserName()));
                pairs.add(new NameValuePair("userRealName", cUser.getUserRealName()));
                response.setCustomData(pairs);
                WSUpdateCore.subscribe("admin.logins");
                WSUpdateCore.subscribe("private.user." + cUser.getUserName());
                User.UserPresence presence = isPresent(cUser.getUserPK());
                if (presence == null) {
                    presence = new User.UserPresence(cUser);
                }

                presence.type = User.UserPresenceType.ONLINE;
                changePresence(presence);
            }
        }

        return response;
    }

    public static SuResponse logout() {
        SuResponse response = new SuResponse();
        SessionCore sc = SessionCore.getCurrentContext();
        WindowForm.removeAll(ServerUtility.getUser());
        User.UserPresence presence = isPresent(ServerUtility.getUser().getUserPK());
        if (presence != null) {
            presence.type = User.UserPresenceType.OFFLINE;
            changePresence(presence);
        }
        LoginForm frm = (LoginForm) WindowForm.getFormByClass(LoginForm.class);

        sc.setUser((User) null);
        ServerUtility.setUser(new User());
        InteractionMessage msg = new InteractionMessage();
        msg.type = Enums.InteractionMessageType.SUCCESS;
        response.getMessages().add(msg);


        ServerUtility.clearParameters();
        SessionCore.removeSession(sc);
        ConnectionCore.ClientHandler ch = sc.getClientHandler();
        sc = SessionCore.getCurrentContext();
        sc.setClientHandler(ch);
        response.getCookies().add(new DynamicCookie("ARKN", sc.getSessionID(), 1));
        return response;
    }

    public static void changePresence(User.UserPresence presence) {
        User.UserPresence p = isPresent(presence.user.getUserPK());
        if (p == null) {
            _presences.add(presence);
            p = presence;
        } else {
            p.user = presence.user;
            p.type = presence.type;
            p.createdDate = presence.createdDate;
        }
        WSUpdateCore.Payload payload = new WSUpdateCore.Payload();
        payload.fn = "presence";
        payload.customData = p;
        WSUpdateCore.pump("public.presence", payload);
    }

    public static User.UserPresence isPresent(byte[] userPK) {
        Iterator it = _presences.iterator();
        while (it.hasNext()) {
            User.UserPresence presence = (User.UserPresence) it.next();
            try {
                if (Arrays.equals(userPK, presence.user.getUserPK())) {
                    return presence;
                }
            } catch (Exception e) {
                Logger.Error(e);
            }
        }
        return null;
    }

    @Override
    public RecordProperties getField() {
        RecordProperties props = new RecordProperties();
        props.fields = _fields;
        props.primaryKey = PRIMARY_KEY;
        props.methods = _methods;
        props.title = "Kullanıcı";
        return props;
    }

    @Override
    public void procces() {

    }

    @Override
    public boolean disableLog() {
        return false;
    }


    public static enum UserPresenceType {
        ONLINE(1),
        AWAY(2),
        DND(3),
        OFFLINE(4),
        APPEAROFFLINE(5);

        private int _value;

        private UserPresenceType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public abstract static class LoginHandler {
        public abstract void onLogin(User u, SuResponse r);
    }

    public static class UserPresence implements Serializable {
        private static final long serialVersionUID = 5509273424380827985L;
        public User user;
        @Expose
        @SerializedName("type")
        public User.UserPresenceType type;
        @Expose
        @SerializedName("createdDate")
        public Date createdDate;
        @Expose
        @SerializedName("user")
        private byte[] userId;

        public UserPresence(User user) {
            this.user = user;
            this.createdDate = new Date();
            this.type = User.UserPresenceType.ONLINE;
            this.userId = user.getUserPK();
        }
    }
}
