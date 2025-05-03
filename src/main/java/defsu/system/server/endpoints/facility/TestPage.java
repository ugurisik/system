package defsu.system.server.endpoints.facility;

import defsu.system.server.core.HttpCore;
import defsu.system.server.utils.Json;

public class TestPage extends HttpCore {
    public TestPage() {
        setRoute("bakhele");
    }
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        return new HttpCore.ActivePageResponse(Json.convertToJson(parameters),"application/json", "BAK HELE");
    }
}
