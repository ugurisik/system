package defsu.system.server.core;

import defsu.system.projects.sys.record.User;
import defsu.system.server.utils.Logger;
import lombok.Getter;
import lombok.Setter;

import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;
import java.io.Serializable;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Getter
@Setter
public class SessionCore {
    private static final String LOG_UNIT = "SessionContext";
    private static List<SessionCore> _sessions = new CopyOnWriteArrayList<>();
    private String _client = "desktop";
    private long _threadID;
    private String _sessionID;
    private HibernateCore _hibernateHandler;
    private ConnectionCore.ClientHandler _clientHandler;
    private boolean isGhost = false;
    private boolean _isAlive = true;
    private User _user;

    public boolean isAlive() {
        return this._isAlive;
    }

    public void setAlive(boolean alive) {
        this._isAlive = alive;
    }

    private SessionCore(String sessionID) {
        this._sessionID = sessionID;
        this._threadID = Thread.currentThread().getId();
        this._hibernateHandler = new HibernateCore();
    }

    public static SessionCore start(String sessionID) {
        SessionCore sc = getCurrentContext();
        sc._sessionID = sessionID;
        return sc;
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

            sc._sessionID = sessionID;
            if (oldsc != null) {
                sc.setUser(oldsc.getUser());
                oldsc.setAlive(false);
            }

            sc.setAlive(true);
            return sc;
        }
        return null;
    }

    public static SessionCore cloneToGhostSilently(String sessionID) {
        if (sessionID.length() == 36) {
            SessionCore oldsc = find(sessionID);
            SessionCore sc = getCurrentContext();
            if (oldsc != null) {
                sc.setUser(oldsc.getUser());
            }

            sc.setGhost(true);
            return sc;
        }
        return null;
    }

    public static SessionCore getCurrentContext() {
        return getCurrentContext(true);
    }

    public static SessionCore getCurrentContext(boolean createNew) {
        Thread cThread = Thread.currentThread();
        long cThreadID = cThread instanceof ConnectionCore.ExtendedThread
                ? ((ConnectionCore.ExtendedThread) cThread).uHandler.parent.getId()
                : cThread.getId();

        return _sessions.stream()
                .filter(sc -> sc._threadID == cThreadID)
                .findFirst()
                .orElseGet(() -> createNew ? createNewSession() : null);
    }

    private static SessionCore createNewSession() {
        SessionCore sc = new SessionCore(UUID.randomUUID().toString());
        _sessions.add(sc);
        return sc;
    }

    public String getSessionID() {
        return this._sessionID;
    }

    public ConnectionCore.ClientHandler getClientHandler() {
        return this._clientHandler;
    }

    public void setClientHandler(ConnectionCore.ClientHandler handler) {
        this._clientHandler = handler;
    }

    public static List<SessionCore> getUserContexts(User user) {
        return _sessions.stream()
                .filter(sc -> sc.getUser() != null && Arrays.equals(sc.getUser().getUserPK(), user.getUserPK()))
                .collect(Collectors.toList());
    }

    public static SessionCore find(String sessionId) {
        return _sessions.stream()
                .filter(sc -> sc.getSessionID().equals(sessionId))
                .findFirst()
                .orElse(null);
    }

    public static SessionCore findUserContext(User user) {
        return _sessions.stream()
                .filter(sc -> sc.getUser() != null && Arrays.equals(sc.getUser().getUserPK(), user.getUserPK()))
                .findFirst()
                .orElse(null);
    }

    public HibernateCore getHibernateHandler() {
        return this._hibernateHandler;
    }

    public User getUser() {
        return this._user;
    }

    public void setUser(User user) {
        this._client = ServerUtility.getParameter("client").isEmpty() ? "desktop" : ServerUtility.getParameter("client");
        this._user = user;
    }

    public static List<SessionCore> getSessions() {
        return _sessions;
    }

    public static void removeSession(SessionCore session) {
        Logger.Info("RemoveSession.Removing Ghost session: " + session._sessionID,true);
        _sessions.removeIf(sc -> sc._sessionID.equals(session._sessionID));
        session._hibernateHandler.commitMain();
    }

    public void removeSession() {
        Logger.Info("RemoveSession.Removing Ghost session: " + this._sessionID,true);
        _sessions.removeIf(sc -> sc._sessionID.equals(this._sessionID));
        this._hibernateHandler.commitMain();
    }

    public static void runAsyncJob(final AsyncJob job) {
        String sessionID = getCurrentContext().getSessionID();
        CompletableFuture.runAsync(() -> {
            SessionCore.change(sessionID, false);
            job.run();
        });
    }

    public boolean isGhost() {
        return this.isGhost;
    }

    public void setGhost(boolean isGhost) {
        this.isGhost = isGhost;
    }

    public abstract static class AsyncJob {
        public abstract SuResponse run();
    }

    public static class SessionContextCacheObject implements Serializable {
        private static final long serialVersionUID = -6246171964078770723L;
        public byte[] userPK;
        public String sessionId;

        public static SessionContextCacheObject deserialize(byte[] binaryData) {
            try (ByteArrayInputStream input = new ByteArrayInputStream(binaryData);
                 ObjectInputStream stream = new ObjectInputStream(input)) {
                return (SessionContextCacheObject) stream.readObject();
            } catch (Exception e) {
                Logger.Error(e,"Deserialize.Cannot deserialize object",true);
                return null;
            }
        }
    }
}

