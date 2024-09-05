package alba.system.projects.sys.services.auth;

import alba.system.server.core.*;
import alba.system.server.helpers.InteractionMessage;
import alba.system.server.utils.Enums;
import alba.system.server.utils.Json;
import alba.system.server.utils.Logger;

import java.util.ArrayList;

public class LoginService extends MapService {
    private static ArrayList<ServiceAbility> actions;
    public LoginService() {
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
        }
    }

    @Override
    public ArrayList<ServiceAbility> getActions() {
        return actions;
    }
}
