package alba.system.server.endpoints.canteen;

import alba.system.server.core.HttpCore;
import alba.system.server.utils.Json;

public class TestPage extends HttpCore {
    public TestPage() {
       // setRoute("TestPage");
    }
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        return new HttpCore.ActivePageResponse(Json.convertToJson(parameters));
    }
}
