package alba.system.projects.sys.services.auth;

import alba.system.projects.sys.forms.auth.LoginForm;
import alba.system.projects.sys.record.User;
import alba.system.server.components.Component;
import alba.system.server.components.WindowForm;
import alba.system.server.core.*;
import alba.system.server.helpers.InteractionMessage;
import alba.system.server.utils.Enums;
import alba.system.server.utils.Json;
import alba.system.server.utils.Logger;
import alba.system.server.core.ServerUtility;

import java.util.ArrayList;

public class LoginService extends MapService {
    private static ArrayList<ServiceAbility> actions;

    public LoginService() {
        this.initialize();
    }

    private void initialize() {
        if (actions == null) {
            actions = new ArrayList<>();

            actions.add(new ServiceAbility("form", new ServiceAbility.ActionHandler() {
                @Override
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    ServerObject args = params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    String formName = mem.get("@form");
                    Object form = null;
                    if ("cp".equals(formName)) {
                        form = WindowForm.getFormByClass(LoginForm.ChangePassword.class);
                        if (form == null) {
                            form = new LoginForm.ChangePassword();
                            WindowForm.addForm((WindowForm)form);
                        }
                    }else{
                        form = WindowForm.getFormByClass(LoginForm.class);
                        if(form == null){
                            form = new LoginForm();
                            WindowForm.addForm((WindowForm) form);
                        }
                    }
                    ServerUtility.setForm((WindowForm)form);
                    response.setForm(Component.getJson(form));
                    return response;
                }
            }));

            actions.add(new ServiceAbility("invoke", new ServiceAbility.ActionHandler() {
                @Override
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    ServerObject args = params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    String methodName = mem.get("@method");
                    WindowForm form = null;
                    if(mem.containsKey("@form")){
                        form = WindowForm.getFormByUuid(mem.get("@form"));
                    }

                    if(form != null && methodName != null){
                        response = WindowForm.invoke(form,methodName);
                    }else{
                        response = ObjectCore.invoke(User.class, mem);
                    }


                    return response;
                }
            }));


            actions.add(new ServiceAbility("test", new ServiceAbility.ActionHandler() {
                @Override
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    ServerObject args = params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    Logger.Info(Json.convertToJson(mem));
                    Logger.Info(Json.convertToJson(args));

                    InteractionMessage message = new InteractionMessage();
                    message.setType(Enums.InteractionMessageType.INFO);
                    message.setTitle("Test Service");
                    message.setMessage("Test service is working");
                    response.getMessages().add(message);
                    response.setStatusCode("100");
                    return response;
                }
            }));
        }
    }

    @Override
    public ArrayList<ServiceAbility> getActions() {
        return actions;
    }
}
