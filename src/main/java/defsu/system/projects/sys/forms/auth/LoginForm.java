package defsu.system.projects.sys.forms.auth;

import defsu.system.projects.sys.record.User;
import defsu.system.projects.sys.services.auth.LoginService;
import defsu.system.server.components.*;
import defsu.system.server.components.*;
import defsu.system.server.core.ObjectCore;
import defsu.system.server.core.RecordCore;
import defsu.system.server.core.ServerUtility;
import defsu.system.server.core.SuResponse;
import defsu.system.server.helpers.InteractionMessage;
import defsu.system.server.utils.Enums;

import java.security.MessageDigest;

public class LoginForm extends WindowForm {
    public LoginForm(){
        super(C.id("loginForm"),
                C.title("Giriş Ekranı"),
                C.width(300),
                C.height(250),
                C.Layout.border(),
                C.maximizable(false),
                C.minimizable(false),

                C.items(
                        new Container(C.id("imageContainer"),C.height(100), C.Region.north(),C.Layout.absolute(), C.items(
                                new Img(C.id("logo"), C.src("sources/assets/images/albatros.png"), C.x(45), C.y(10), C.Region.center(), C.width(200), C.height(75))
                        )),
                        new Container(C.id("inputContainer"), C.Layout.absolute(), C.width(275), C.items(
                                new Text(C.id("username"), C.x(20), C.y(10), C.width(245),  C.stringData("emptyText","Kullanıcı Adınız..."), C.dataName("userName"), C.booleanData("allowBlank",false), C.stringData("blankText","Kullanıcı adı boş bırakılamaz"), C.Text.minLength(3), C.Text.minLengthText("Kullanıcı adı en az 3 karakter olmalıdır","3"), C.Text.maxLength(20), C.Text.maxLengthText("Kullanıcı adı en fazla 20 karakter olabilir","20")),
                                new Text(C.id("password"), C.x(20), C.y(40), C.width(245), C.stringData("emptyText","Şifreniz..."), C.dataName("password"), C.booleanData("allowBlank",false), C.stringData("blankText","Şifre boş bırakılamaz"), C.Text.minLength(3), C.Text.minLengthText("Şifre en az 3 karakter olmalıdır","3"), C.Text.maxLength(20), C.Text.maxLengthText("Şifre en fazla 20 karakter olabilir","20"), C.stringData("inputType","password")),
                                new Button(C.id("loginButton"), C.x(20), C.y(70), C.text("Giriş"), C.width(245)).addService(LoginService.class).addMethod((new User()).getField().methods.get("login")))
                        )
                )
        );
    }

    public SuResponse login(LoginForm form){
        SuResponse response = new SuResponse();


        return response;
    }

    public static class ChangePassword extends WindowForm {
        private static final long serialVersionUID = -269291018521483614L;

        public ChangePassword() {
            super(C.id("login-changepassword"), C.title("Güvenlik İşlemleri"), C.width(400), C.height(300), C.iconFile("gtk-execute.png"), C.iconFolder("actions"), C.Layout.fit(), C.items(new Tab(new Conf[]{C.id("login-changepassword-tab"), C.items(new Panel(new Conf[]{C.id("login-changepassword-tab-configuration"), C.title("Şifre İşlemleri"), C.bodyPadding(5), C.items(new Text(new Conf[]{C.id("login-changepassword-oldpassword"), C.label("Eski Şifreniz"), C.anchor("100%"), C.labelWidth(170), C.Text.password()}), (new Text(new Conf[]{C.id("login-changepassword-newpassword"), C.label("Yeni Şifreniz"), C.anchor("100%"), C.labelWidth(170), C.Text.password()})).addService(LoginService.class).addListener(new Component.ComponentListener("stopedit", "stopEdit")), (new Text(new Conf[]{C.id("login-changepassword-newpasswordagain"), C.label("Yeni Şifreniz (Tekrar)"), C.anchor("100%"), C.labelWidth(170), C.Text.password()})).addService(LoginService.class).addListener(new Component.ComponentListener("stopedit", "stopEdit")), new Display(new Conf[]{C.id("login-changepassword-strength"), C.label("Şifre Güvenliği"), C.labelWidth(170)})), C.dockedItems(new Toolbar(new Conf[]{C.Dock.bottom(), C.items(Button.SAVE("login-changepassword-btn-save").addService(LoginService.class).addFormMethod("save"))}))}))})));
        }

        private static boolean hasDigit(String input) {
            return input.matches(".*\\d+.*");
        }

        private static boolean hasAlpha(String input) {
            return input.matches(".*[A-Za-z]+.*");
        }

        public SuResponse stopEdit(LoginForm.ChangePassword form) {
            SuResponse response = new SuResponse();
            String newPassword = form.findComponent("login-changepassword-newpassword").getInputValue().toString();
            String newPasswordRe = form.findComponent("login-changepassword-newpasswordagain").getInputValue().toString();
            if (newPassword.equals(newPasswordRe)) {
                if (newPassword.length() < 6) {
                    form.up("login-changepassword-strength", "value", "Şifreniz en az 6 karakterden oluşmalıdır.");
                } else if (newPassword.length() > 20) {
                    form.up("login-changepassword-strength", "value", "Şifreniz en fazla 20 karakterden oluşmalıdır.");
                } else if (!hasDigit(newPassword)) {
                    form.up("login-changepassword-strength", "value", "Şifrenizde en az 1 karakter sayı olmalıdır.");
                } else if (!hasAlpha(newPassword)) {
                    form.up("login-changepassword-strength", "value", "Şifrenizde en az 1 karakter harf olmalıdır.");
                } else {
                    form.up("login-changepassword-strength", "value", "Şifre uygun.");
                }
            } else {
                form.up("login-changepassword-strength", "value", "Şifreler uyuşmuyor.");
            }

            response.setChanges(form.getChanges());
            form.resetChanges();
            return response;
        }

        public SuResponse save(LoginForm.ChangePassword form) {
            SuResponse response = new SuResponse();
            String oldPassword = form.findComponent("login-changepassword-oldpassword").getInputValue().toString();
            String newPassword = form.findComponent("login-changepassword-newpassword").getInputValue().toString();
            String newPasswordRe = form.findComponent("login-changepassword-newpasswordagain").getInputValue().toString();
            boolean hasProblem = true;
            if (newPassword.equals(newPasswordRe) && newPassword.length() >= 6 && newPassword.length() <= 20 && hasDigit(newPassword) && hasAlpha(newPassword)) {
                hasProblem = false;
            }

            if (hasProblem) {
                InteractionMessage msg = new InteractionMessage();
                msg.type = Enums.InteractionMessageType.ERROR;
                msg.message = "Şifre güvenlik uyarılarını kontrol ederek şifrenizi düzeltiniz.";
                response.getMessages().add(msg);
            } else {
                try {
                    User user = ServerUtility.getUser();
                    String password = oldPassword;
                    MessageDigest digest;
                    byte[] hash;
                    digest = MessageDigest.getInstance("SHA-256");
                    hash = digest.digest(oldPassword.getBytes("UTF-8"));
                    password = RecordCore.b2H(hash);

                    InteractionMessage msg;
                    if (password.equals(user.getUserPassword()) || oldPassword.equals(user.getUserPassword())) {
                        digest = MessageDigest.getInstance("SHA-256");
                        hash = digest.digest(newPassword.getBytes("UTF-8"));
                        user.setUserPassword(RecordCore.b2H(hash));

                        user.setUserRequestNewPassword(false);
                        if (ObjectCore.save(user, false, false)) {
                            form.up("@self", "closed", true);
                            response.setChanges(form.getChanges());
                            form.resetChanges();
                        } else {
                            msg = new InteractionMessage();
                            msg.type = Enums.InteractionMessageType.ERROR;
                            msg.message = "Şifre değiştirilirken hata oluştu. Lütfen sistem yöneticinize başvurunuz.";
                            response.getMessages().add(msg);
                        }
                    } else {
                        msg = new InteractionMessage();
                        msg.type = Enums.InteractionMessageType.ERROR;
                        msg.message = "Eski şifreniz hatalı! Lütfen mevcut şifrenizi kontrol ediniz.";
                        response.getMessages().add(msg);
                    }
                } catch (Exception var11) {
                    InteractionMessage msg = new InteractionMessage();
                    msg.type = Enums.InteractionMessageType.ERROR;
                    msg.message = "Şifre değiştirilirken hata oluştu. Lütfen sistem yöneticinize başvurunuz.";
                    response.getMessages().add(msg);
                }
            }

            return response;
        }
    }
}
