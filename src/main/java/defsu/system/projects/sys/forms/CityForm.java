package defsu.system.projects.sys.forms;

import defsu.system.projects.sys.record.City;
import defsu.system.projects.sys.services.CityService;
import defsu.system.server.components.*;

public class CityForm extends WindowForm {
    public CityForm() {
        super(
                C.id("CityForm"),
                C.title("Şehir Bilgileri"),
                C.width(800),
                C.height(600),
                C.items(
                        new Panel(C.items(
                                new DataTable(
                                        C.Grid.columns("cf-table",
                                                new Col().width(200).text("Adı").dataIndex("cityName")
                                        )

                                ).id("cf-table").title("Liste").addService(CityService.class).addChannel(City.class.getName()).setAttribute(City.class).paginate()
                        )).id("CityForm-Panel").accordion().title("Şehirler")
                )
        );
    }
}
