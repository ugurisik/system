package defsu.system.projects.sys.services;

import defsu.system.projects.sys.forms.CityForm;
import defsu.system.projects.sys.forms.test.TestForm;
import defsu.system.projects.sys.record.City;
import defsu.system.server.components.Component;
import defsu.system.server.components.WindowForm;
import defsu.system.server.core.*;

import java.util.ArrayList;

public class CityService extends MapService {
    private static ArrayList<ServiceAbility> actions;

    public CityService() {
        this.initialize();
    }

    public void initialize() {
        if(actions == null){
            actions = new ArrayList<>();
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
                        form = WindowForm.getFormByClass(CityForm.class);
                        if(form == null){
                            form = new CityForm();
                            WindowForm.addForm((WindowForm) form);
                        }
                    }
                    ServerUtility.setForm(form);
                    response.setForm(Component.getJson(form));
                    return response;
                }
            }));

            actions.add(new ServiceAbility("list", new ServiceAbility.ActionHandler() {
                public SuResponse handle(StringDictionary<ServerObject> params) {
                    SuResponse response = new SuResponse();
                    WSUpdateCore.subscribe(City.class);
                    ServerObject args = (ServerObject) params.get("ARGS");
                    StringDictionary<String> mem = args.memory;
                    MapService.appendSort(mem, "accountListCode", "A");
                   // response.setListResult(ObjectCore.listAsRecordRow(City.class, mem));

                    response.setStatusCode("100");
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
