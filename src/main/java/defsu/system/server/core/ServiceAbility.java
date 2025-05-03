package defsu.system.server.core;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceAbility {
    private String name;
    private String description;
    private ServiceAbility.ActionHandler handle;
    public ServiceAbility(String name, ServiceAbility.ActionHandler handler) {
        this.name = name;
        this.handle = handler;
    }

    public abstract static class ActionHandler {
        public abstract SuResponse handle(StringDictionary<ServerObject> o);
    }
}
