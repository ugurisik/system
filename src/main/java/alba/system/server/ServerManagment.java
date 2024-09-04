package alba.system.server;

import alba.system.server.core.ConnectionCore;
import org.springframework.boot.autoconfigure.rsocket.RSocketProperties;

import java.util.ArrayList;
import java.util.List;

public class ServerManagment {

    public static int port = 1921;
    public static String rootFolder = "./";
    private static final ArrayList<ServerManagment.BeforeStartEvents> startEventList = new ArrayList<>();
    private static final ArrayList<ServerManagment.UpdateEvents> updateEventList = new ArrayList<>();
    protected static ConnectionCore connectionCore;

    public static void main(String[] args) {
        System.out.println("Server is running...");
        if (connectionCore == null) {
            connectionCore = new ConnectionCore(port);
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
