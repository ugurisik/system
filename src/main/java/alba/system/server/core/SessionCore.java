package alba.system.server.core;

import lombok.Getter;
import lombok.Setter;

import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;
import java.io.Serializable;
import java.util.*;

@Getter
@Setter
public class SessionCore {
    private static final String LOG_UNIT = "SessionContext";
    private static ArrayList<SessionCore> sessions = new ArrayList<>();
    private String client = "desktop";
    private long threadID;
    private String sessionID;
    //private HibernateCore hibernateHandler;
    private ConnectionCore.ClientHandler clientHandler;
    private boolean isGhost = false;
    private boolean isAlive = true;
    //private ArkUser user;


    private SessionCore(String sessionID) {
        setSessionID(sessionID);
        setThreadID(Thread.currentThread().threadId());
    }

    public static SessionCore start(String sessionID){
        SessionCore sc = getCurrentContext();
        sc.setSessionID(sessionID);
        return sc;
    }

    public static SessionCore getCurrentContext() {
        return getCurrentContext(true);
    }

    public static SessionCore getCurrentContext(boolean createNew) {
        Thread cThread = Thread.currentThread();
        long cThreadID;
        if (cThread instanceof ConnectionCore.ExtendedThread) {
            cThreadID = ((ConnectionCore.ExtendedThread) cThread).uHandler.parent.threadId();
        } else {
            cThreadID = Thread.currentThread().threadId();
        }

        for(int k = 0; k < sessions.size(); ++k) {
            SessionCore sc = (SessionCore)sessions.get(k);
            if (sc != null && cThreadID == sc.getThreadID()) {
                return sc;
            }
        }

        if (createNew) {
            SessionCore sc = new SessionCore(UUID.randomUUID().toString());
           // sc._hibernateHandler = new HibernateCore();
            sessions.add(sc);
            return sc;
        } else {
            return null;
        }
    }
    public static SessionCore change(String sessionID) {
        return change(sessionID, true);
    }

    public static SessionCore change(String sessionID, boolean deleteOldSession) {
        if (sessionID.length() == 36) {
            SessionCore sc = getCurrentContext();
            SessionCore oldsc = find(sessionID);
            if (deleteOldSession && oldsc != null) {
                removeSession(oldsc);
            }
            sc.setSessionID(sessionID);
            if (oldsc != null) {
               // sc.setUser(oldsc.getUser());
                oldsc.setAlive(false);
            }
            sc.setAlive(true);
            return sc;
        } else {
            return null;
        }
    }
    public static SessionCore cloneToGhostSilently(String sessionID) {
        if (sessionID.length() == 36) {
            SessionCore oldsc = find(sessionID);
            SessionCore sc = getCurrentContext();
            if (oldsc != null) {
                //sc.setUser(oldsc.getUser());
            }

            sc.setGhost(true);
            return sc;
        } else {
            return null;
        }
    }

  /*  public static List<SessionCore> getUserContexts(ArkUser user) {
        ArrayList<SessionCore> output = new ArrayList();
        Iterator var3 = _sessions.iterator();

        while(var3.hasNext()) {
            SessionCore sc = (SessionCore)var3.next();
            if (sc.getUser() != null && Arrays.equals(sc.getUser().getUserPK(), user.getUserPK())) {
                output.add(sc);
            }
        }

        return output;
    }*/

    public static SessionCore find(String sessionId) {
        try{
            for (SessionCore sc : sessions) {
                if (sc.getSessionID().equals(sessionId)) {
                    return sc;
                }
            }
        }catch (Exception e){
            return null;
        }
        return null;
    }

   /* public static SessionCore findUserContext(ArkUser user) {
        Iterator var2 = sessions.iterator();

        SessionCore sc;
        do {
            if (!var2.hasNext()) {
                return null;
            }

            sc = (SessionCore)var2.next();
        } while(sc.getUser() == null || !Arrays.equals(sc.getUser().getUserPK(), user.getUserPK()));

        return sc;
    }*/

    public static List<SessionCore> getSessions() {
        return sessions;
    }
    public static void removeSession(SessionCore session) {
        System.out.println("Removing session with SessionID: " + session.getSessionID());
        ArrayList<SessionCore> scs = new ArrayList();

        for (SessionCore sc : sessions) {
            if (!sc.getSessionID().equals(session.getSessionID())) {
                scs.add(sc);
            } else {
                //  sc._hibernateHandler.commit();
            }
        }
        sessions = scs;
    }

    public static class SessionContextCacheObject implements Serializable {
        private static final long serialVersionUID = -6246171964078770723L;
        public byte[] userPK;
        public String sessionId;

        public static SessionCore.SessionContextCacheObject deserialize(byte[] binaryData) {
            try {
                ByteArrayInputStream input = new ByteArrayInputStream(binaryData);
                ObjectInputStream stream = new ObjectInputStream(input);
                return (SessionCore.SessionContextCacheObject)stream.readObject();
            } catch (Exception e) {
                System.out.println("Can not deserialize object. Reason: " + e.getMessage());
                return null;
            }
        }
    }

}
