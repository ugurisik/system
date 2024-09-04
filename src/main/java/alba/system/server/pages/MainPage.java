package alba.system.server.pages;

import alba.system.server.components.Table;
import alba.system.server.core.HttpCore;

public class MainPage extends HttpCore {
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        String html = "<html  style=' margin: 0;\r\n  padding: 0;\r\n  height: 100%;\r\n  overflow: hidden;'><link rel=\"icon\" href=\"/core/fav.ico\" type=\"image/x-icon\"><title>ALBATROS STK 4.0</title>\r\n<frameset rows=\"*\">\r\n<frame name=\"main\" src=\"/core/app/stk.html\">\r\n<noframes>\r\n<body>\r\n<p>TARAYICINIZ BU PROGRAMI DESTEKLEMİYOR LÜTFEN GÜNCEL SÜRÜM TARAYICI KULLANINIZ</p>\r\n</body>\r\n</noframes>\r\n</frameset>";

        return new HttpCore.ActivePageResponse(html);
    }
}
