package defsu.system.server.endpoints;

import defsu.system.server.core.HttpCore;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainPage extends HttpCore {
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        String html = "<html  style=' margin: 0;\r\n  padding: 0;\r\n  height: 100%;\r\n  overflow: hidden;'><link rel=\"icon\" href=\"sources/assets/images/fav.ico\" type=\"image/x-icon\"><title>ALBATROS 5.0</title>\r\n<frameset rows=\"*\">\r\n<frame name=\"main\" src=\"/index.html\">\r\n<noframes>\r\n<body>\r\n<p>TARAYICINIZ BU PROGRAMI DESTEKLEMİYOR LÜTFEN GÜNCEL SÜRÜM TARAYICI KULLANINIZ</p>\r\n</body>\r\n</noframes>\r\n</frameset>";

        return new HttpCore.ActivePageResponse(html,"ALBATROS 5.0");
    }
}
