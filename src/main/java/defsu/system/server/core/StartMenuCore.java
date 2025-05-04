package defsu.system.server.core;

import defsu.system.projects.TestService;
import defsu.system.projects.sys.record.StartMenu;
import defsu.system.projects.sys.services.CityService;
import defsu.system.projects.sys.services.TaxOfficeService;
import defsu.system.server.helpers.RecordRow;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class StartMenuCore {
    public static ObjectCore.ListResult startMenu = new ObjectCore.ListResult();
    public static int MODULE_TYPE_EXTERNAL = 3;

    public static void init() {
        StartMenuCore.generateMenu(1, 0, "Home 1", 0, "", "", 0, "", "");
        StartMenuCore.generateMenu(2, 1, "Home 2", 1, TestService.class.getName(), "testmodule", 0, "icons", "panel.png");

        StartMenuCore.generateMenu(3, 0, "Home 3", 0, "", "", 0, "", "");
        StartMenuCore.generateMenu(4, 3, "Home 4", 3, "testclass", "testmodule2", 0, "icons", "panel.png");


        StartMenuCore.generateMenu(5, 0, "Tanımlar", 0, "", "", 0, "", "");
        StartMenuCore.generateMenu(6, 5, "Sistem Tanımları", 5, "", "", 0, "icons", "panel.png");
        StartMenuCore.generateMenu(7, 6, "Vergi Daireleri", 6, TaxOfficeService.class.getName(), "TaxOfficeService", 0, "icons", "panel.png");
        StartMenuCore.generateMenu(8, 6, "Şehir Listesi", 6, CityService.class.getName(), "CityService", 0, "icons", "panel.png");
    }

    public static void generateMenu(int id, int moduleid, String title, int parentId, String moduleClass, String moduleName, int moduleTypeId, String iconFolder, String icon) {
        StartMenu sm = new StartMenu();
        sm.setStartMenuPK(RecordCore.i2B(id));
        sm.setApplicationModuleFK(RecordCore.i2B(moduleid));
        sm.setStartMenuTitle(title);
        sm.setStartMenuOrder(0);
        sm.setStartMenuFK(RecordCore.i2B(parentId));
        sm.setApplicationModuleClass(moduleClass);
        sm.setApplicationModuleName(moduleName);
        sm.setApplicationModuleTypeFK(RecordCore.i2B(moduleTypeId));
        sm.setApplicationModuleIconFolder(iconFolder);
        sm.setApplicationModuleIcon(icon);
        sm.setId(sm.getStartMenuPK());
        sm.setText(sm.getStartMenuTitle());
        sm.setParent(sm.getStartMenuFK());
        addMenu(sm);
    }

    public static void addMenu(StartMenu sm) {
        StartMenuCore.startMenu.records.add(sm);
        StartMenuCore.startMenu.rows.add(ObjectCore.getRecordRow(sm));
    }

    public static StartMenu getStartMenuByName(String name){
        for(SuRecord r : StartMenuCore.startMenu.records){
            StartMenu sm = (StartMenu) r;
            if(sm.getStartMenuTitle().equals(name)){
                return sm;
            }
        }
        return null;
    }

    public static StartMenu getStartMenuByModuleId(int id){
        for(SuRecord r : StartMenuCore.startMenu.records){
            StartMenu sm = (StartMenu) r;
            if(Arrays.equals(sm.getApplicationModuleFK(), RecordCore.i2B(id))){
                return sm;
            }
        }
        return null;
    }

    public static List<RecordRow> getMenuList(){
        List<RecordRow> list = new ArrayList<>();

        for(SuRecord r : StartMenuCore.startMenu.records){
            StartMenu sm = (StartMenu) r;
            list.add(ObjectCore.getRecordRow(sm));
            // TODO :: Add menu items by authorization
        }

        return list;
    }
}
