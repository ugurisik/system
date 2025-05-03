package defsu.system.server.core;

import defsu.system.server.helpers.InteractionMessage;
import defsu.system.server.utils.Enums;
import defsu.system.server.utils.Logger;

import java.util.ArrayList;

public abstract class MapService {
    public static final String ACTION = "action";

    public abstract ArrayList<ServiceAbility> getActions();

    public SuResponse handle(String actionName, StringDictionary<ServerObject> params) {
        ArrayList<ServiceAbility> actions = this.getActions();
        SuResponse response = new SuResponse();
        ServiceAbility action = null;
        for (int k = 0; k < actions.size(); ++k) {
            ServiceAbility cAction = (ServiceAbility) actions.get(k);
            if (cAction != null && actionName.equals(cAction.getName())) {
                action = cAction;
                break;
            }
        }
        if (action != null) {
            try {
                response = action.getHandle().handle(params);
            } catch (Exception e) {
                Logger.Error(e, "Error while handling action", true);
            }
        } else {
            response.setStatusCode("404");
        }
        return response;
    }

    public static SuResponse call(String serviceClassName, String action, StringDictionary<ServerObject> params) {
        SuResponse response = new SuResponse();
        boolean notAuthorized = true;
        Class cls;
        try {
            // TODO::Burada yetki kontrolü yapılacak
            cls = Class.forName(serviceClassName);
        } catch (Exception e) {
            Logger.Error(e, "Error while calling service", true);
        }

        if(!notAuthorized){
            InteractionMessage message = new InteractionMessage();
            message.setType(Enums.InteractionMessageType.ERROR);
            message.setMessage("Not authorized");
            message.setTitle("Error");
            response.getMessages().add(message);
            return response;
        }else{
            cls = null;
            Object o = null;
            try{
                cls = Class.forName(serviceClassName);
                try{
                    o = cls.newInstance();
                }catch (InstantiationException | IllegalAccessException e){
                    Logger.Error(e, "Error while creating instance", true);
                    response.setStatusCode("306");
                }
                if(o instanceof MapService service){
                    response = service.handle(action, params);
                }
            }catch (ClassNotFoundException e){
                Logger.Error(e, "Error while calling service EOI:304", true);
                response.setStatusCode("304");
            }
        }
        return response;
    }
}
