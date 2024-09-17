package alba.system.server.endpoints.facility;

import alba.system.server.core.HttpCore;
import alba.system.server.utils.Json;

public class TestPage extends HttpCore {
    public TestPage() {
        setRoute("bakhele");
    }
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        return new HttpCore.ActivePageResponse(Json.convertToJson(parameters),"application/json", "BAK HELE");
    }
}
