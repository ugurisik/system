package defsu.system.projects;

import defsu.system.projects.sys.forms.test.TestForm;
import defsu.system.projects.sys.record.User;
import defsu.system.server.components.Component;
import defsu.system.server.components.WindowForm;
import defsu.system.server.core.*;
import defsu.system.server.core.*;
import defsu.system.server.helpers.InteractionMessage;
import defsu.system.server.utils.Enums;
import defsu.system.server.utils.Json;
import defsu.system.server.utils.Logger;

import java.util.ArrayList;

public class TestService extends MapService {
    private static ArrayList<ServiceAbility> actions;
    public TestService() {
        this.initialize();
    }
    private void initialize(){
        if(actions == null){
            actions = new ArrayList<>();

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


            actions.add(new ServiceAbility("form", new ServiceAbility.ActionHandler() {
                @Override
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    ServerObject args = params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    WindowForm form = null;
                    if(mem.containsKey("@form")){
                        if(mem.get("@form").equals("selector")){
                            form = new TestForm.Selector();
                            WindowForm.addForm((WindowForm) form);
                        }else{
                            form = WindowForm.getFormByUuid(mem.get("@form"));
                        }

                    }
                    if(form == null){
                        form = WindowForm.getFormByClass(TestForm.class);
                        if(form == null){
                            form = new TestForm();
                            WindowForm.addForm((WindowForm) form);
                        }
                    }
                    ServerUtility.setForm(form);
                    response.setForm(Component.getJson(form));
                    return response;
                }
            }));

            actions.add(new ServiceAbility("invoke", new ServiceAbility.ActionHandler() {
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    SessionCore sc = SessionCore.getCurrentContext();
                    HibernateCore hh = sc.getHibernateHandler();
                    hh.beginTransaction();
                    ServerObject args = (ServerObject) params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    String methodName = (String) mem.get("@method");
                    WindowForm form = null;
                    if (mem.containsKey("@form")) {
                        form = WindowForm.getFormByUuid((String) mem.get("@form"));
                    }
                    if (form != null && methodName != null) {
                        response = WindowForm.invoke(form, methodName);
                    }
                    hh.commitMain();
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
