package defsu.system.server.endpoints.canteen;

import defsu.system.server.core.HttpCore;
import defsu.system.server.utils.Json;

public class TestPage extends HttpCore {
    public TestPage() {
       // setRoute("TestPage");
    }
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        return new HttpCore.ActivePageResponse(Json.convertToJson(parameters),"TEST PAGE");
    }
}
