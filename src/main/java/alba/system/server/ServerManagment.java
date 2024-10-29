package alba.system.server;

import alba.system.SystemApplication;
import alba.system.server.core.ConnectionCore;
import alba.system.server.core.HttpCore;
import alba.system.server.endpoints.MainPage;
import alba.system.server.utils.Logger;
import org.reflections.Reflections;

import java.util.ArrayList;
import java.util.List;

public class ServerManagment {

    public static int port = 1921;
    public static String rootFolder = "./";
    private static final ArrayList<ServerManagment.BeforeStartEvents> startEventList = new ArrayList<>();
    private static final ArrayList<ServerManagment.UpdateEvents> updateEventList = new ArrayList<>();
    protected static ConnectionCore connectionCore;
    public static String VERSION = "5.0.0";

    public static ConnectionCore getConnectionHandler() {
        return connectionCore;
    }
    public static void main(String[] args) {
        System.out.println("Server is running...");
        if (connectionCore == null) {
            connectionCore = new ConnectionCore(port);
        }
        HttpCore.add("/", new MainPage());

        // Auto mapping for endpoints
        String[] packages = SystemApplication.projects.split(";");
        for (String pack : packages) {
            Reflections reflections = new Reflections("alba.system.server.endpoints." + pack);
            reflections.getSubTypesOf(HttpCore.class).forEach(httpCore -> {
                try {
                    HttpCore httpCore1 = httpCore.newInstance();
                    String className = httpCore1.getClass().getName();
                    className = className.substring(className.lastIndexOf('.') + 1);
                    className = httpCore1.getRoute().isEmpty() ? className : httpCore1.getRoute();
                    System.out.println(className);
                    HttpCore.add("/"+className, httpCore1);
                } catch (InstantiationException | IllegalAccessException e) {
                    Logger.Error(e, "Error on endpoint", true);
                }
            });
        }


        for(ServerManagment.BeforeStartEvents event : startEventList) {
            try{
                event.onReady();
            }catch (Exception e){
                Logger.Error(e, "Error on start event", true);
            }
        }
        connectionCore.startListening();
    }

    public static void addStartEvent(ServerManagment.BeforeStartEvents event) {
        startEventList.add(event);
    }

    public static void addUpdateEvent(ServerManagment.UpdateEvents event) {
        updateEventList.add(event);
    }

    public static List<UpdateEvents> getUpdateEventList() {
        return updateEventList;
    }

    public abstract static class BeforeStartEvents {
        public abstract void onReady();
    }

    public abstract static class UpdateEvents {
        public abstract int getVersionNo();

        public abstract void queryForTable(String query);

        public abstract void queryForAll();

        public abstract String getVersion();

        public abstract String getVersionAnnouncement();
    }
}
