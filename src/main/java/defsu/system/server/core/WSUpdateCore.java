package defsu.system.server.core;

import defsu.system.projects.sys.record.User;
import defsu.system.server.helpers.*;
import defsu.system.server.utils.Enums;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

public class WSUpdateCore {
    private static final Logger logger = Logger.getLogger(WSUpdateCore.class.getName());
    public static final String CHNL_LOGIN = "admin.logins";
    private static List<WSUpdateCore.Channel> channels = new ArrayList();
    private static final Lock cleaningsLock = new ReentrantLock();
    private static boolean isCleaning = false;
    /**
     * Payload'ların saklanacağı maksimum süre (milisaniye cinsinden) - varsayılan 1 saat
     */
    private static final long MAX_PAYLOAD_AGE_MS = 3600000;
    /**
     * Son temizleme zamanı
     */
    private static long lastCleanupTime = System.currentTimeMillis();
    /**
     * Temizleme aralığı (milisaniye cinsinden) - varsayılan 10 dakika
     */
    private static final long CLEANUP_INTERVAL_MS = 600000;

    /**
     * Belirli bir süreden daha eski olan payload'ları tüm kanallardan temizler.
     * Bu metod thread-safe olarak çalışır ve temizleme işlemi sırasında diğer işlemleri engellemez.
     * 
     * @param maxAgeMs Saklanacak maksimum payload yaşı (milisaniye cinsinden)
     * @return Temizlenen payload sayısı
     */
    public static int cleanOldPayloads(long maxAgeMs) {
        if (!cleaningsLock.tryLock()) {
            return 0; // Başka bir thread zaten temizleme yapıyor
        }
        
        try {
            isCleaning = true;
            int totalRemoved = 0;
            Date threshold = new Date(System.currentTimeMillis() - maxAgeMs);
            
            for (WSUpdateCore.Channel channel : channels) {
                int initialSize = channel._payloads.size();
                channel._payloads.removeIf(p -> p.date.before(threshold));
                int removed = initialSize - channel._payloads.size();
                totalRemoved += removed;
                
                if (removed > 0) {
                    logger.info("Removed " + removed + " old payloads from channel: " + channel.name);
                }
            }
            
            lastCleanupTime = System.currentTimeMillis();
            return totalRemoved;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error during payload cleanup", e);
            return 0;
        } finally {
            isCleaning = false;
            cleaningsLock.unlock();
        }
    }
    
    /**
     * Varsayılan yaş sınırı (MAX_PAYLOAD_AGE_MS) kullanarak eski payload'ları temizler.
     * 
     * @return Temizlenen payload sayısı
     */
    public static int cleanOldPayloads() {
        return cleanOldPayloads(MAX_PAYLOAD_AGE_MS);
    }

    public static List<WSUpdateCore.Payload> processQueue() {
        List<WSUpdateCore.Payload> output = new ArrayList<>();
        int cleanCount = 0;

        if (System.currentTimeMillis() - lastCleanupTime > CLEANUP_INTERVAL_MS) {
            cleanOldPayloads();
        }

        while (isCleaning) {
            try {
                Thread.sleep(500L);
                if (++cleanCount > 20) {
                    return output;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.warning("Thread interrupted while waiting for cleaning to finish");
                return output;
            }
        }

        SessionCore currentSessionContext = SessionCore.getCurrentContext();

        for (WSUpdateCore.Channel channel : channels) {
            List<WSUpdateCore.Subscriber> subscribers = channel.getSubscribers();

            for (WSUpdateCore.Subscriber subscriber : subscribers) {
                if (subscriber.sessionContext.getSessionID().equals(currentSessionContext.getSessionID())) {
                    List<WSUpdateCore.Payload> payloads = channel.getPayloadsSince(subscriber.lastPumpDate);

                    for (WSUpdateCore.Payload payload : payloads) {
                        WSUpdateCore.Payload copy = payload.copy();
                        if (checkLimit(subscriber, channel, copy)) {
                            output.add(copy);
                        }
                    }

                    if (!payloads.isEmpty()) {
                        subscriber.lastPumpDate = new Date();
                    }
                }
            }
        }

        return output;
    }



    public static boolean checkLimit(WSUpdateCore.Subscriber s, WSUpdateCore.Channel c, WSUpdateCore.Payload p) {
        if (p.manipulations.isEmpty()) {
            return true;
        } else {
            boolean found = false;
            List<RecordManipulation> oldManipulations = new ArrayList<>(p.manipulations);
            p.manipulations.clear();

            for (RecordManipulation manip : oldManipulations) {
                for (String key : s.limits.keyList()) {
                    if (key.startsWith(c.name + '|')) {
                        StringDictionary params = s.limits.get(key);

                        if (params.containsKey("@viewId")) {
                            if (manip.type != Enums.ManipulationType.INSERT && manip.type != Enums.ManipulationType.UPDATE) {
                                found = true;
                            } else {
                                String searchStr = (String) params.get("@search", "");
                                if (searchStr.isEmpty()) {
                                    found = true;
                                } else {
                                    String[] searchParams = searchStr.split(";");
                                    int matchingFilters = 0;

                                    for (String param : searchParams) {
                                        String[] paramParts = param.split("=");
                                        if (paramParts.length > 1 && paramParts[1].endsWith("~")) {
                                            ++matchingFilters;
                                        } else {
                                            RecordValue value = manip.record.getRecordValue(paramParts[0]);
                                            String valueStr = (value != null) ? value.rawValue() : "";

                                            if (valueStr.isEmpty() && value != null) {
                                                valueStr = value.getValue();
                                            }

                                            List<String> paramValues = new ArrayList<>();
                                            if (paramParts[1].contains("|")) {
                                                String[] paramValuesA = paramParts[1].split("\\|");
                                                for (String sss : paramValuesA) {
                                                    paramValues.add(sss);
                                                }
                                            } else {
                                                paramValues.add(paramParts[1]);
                                            }

                                            for (String paramValue : paramValues) {
                                                try {
                                                    if (value != null && value.getField().fieldType == SuField.FT.STRING && valueStr.contains(paramValue)) {
                                                        ++matchingFilters;
                                                        break;
                                                    } else if (valueStr.equals(paramValue)) {
                                                        ++matchingFilters;
                                                        break;
                                                    }
                                                } catch (Exception e) {
                                                    logger.log(Level.SEVERE, "Error in WSUpdateCore.checkLimit", e);
                                                }
                                            }
                                        }
                                    }

                                    if (matchingFilters == searchParams.length) {
                                        found = true;
                                    }
                                }
                            }

                            if (found) {
                                RecordManipulation mm = manip.copy();
                                mm.targetView = (String) params.get("@viewId");
                                p.manipulations.add(mm);
                            }
                        }
                    }
                }
            }

            return found;
        }
    }
    private static WSUpdateCore.Channel _findChannel(String name) {
        return channels.stream()
                .filter(c -> c.name.equals(name))
                .findFirst()
                .orElse(null);
    }

    public static void limitSubscriber(Class<? extends SuRecord> cls, StringDictionary<String> mem) {
        WSUpdateCore.Subscriber s = subscribe(cls);
        if (mem.containsKey("@viewId") && ("grid".equals(mem.get("@viewType")) || "chart".equals(mem.get("@viewType")))) {
            String key = cls.getName() + '|' + mem.get("@viewId");
            if (s.limits.containsKey(key)) {
                s.limits.get(key).clear();
                s.limits.get(key).putAll(mem.copy());
            } else {
                s.limits.put(cls.getName() + '|' + mem.get("@viewId"), mem.copy());
            }
        }
    }

    public static WSUpdateCore.Subscriber subscribe(Class<? extends SuRecord> cls) {
        WSUpdateCore.Channel c = _findChannel(cls.getName());
        if (c == null) {
            c = new WSUpdateCore.Channel(cls);
            channels.add(c);
        }

        SessionCore sc = SessionCore.getCurrentContext();
        WSUpdateCore.Subscriber s = c.getSubscribers().stream()
                .filter(ss -> ss.sessionContext.getSessionID().equals(sc.getSessionID()))
                .findFirst()
                .orElse(null);

        if (s == null) {
            s = new WSUpdateCore.Subscriber();
            s.lastPumpDate = new Date();
            s.sessionContext = SessionCore.getCurrentContext();
            c.getSubscribers().add(s);
        }

        return s;
    }

    public static void subscribe(String channelName) {
        subscribe(channelName, null);
    }

    public static void subscribe(String channelName, SessionCore targetContext) {
        WSUpdateCore.Channel c = _findChannel(channelName);
        if (c == null) {
            c = new WSUpdateCore.Channel(channelName);
            channels.add(c);
        }

        SessionCore sc = (targetContext == null) ? SessionCore.getCurrentContext() : targetContext;
        WSUpdateCore.Subscriber s = c.getSubscribers().stream()
                .filter(ss -> ss.sessionContext.getSessionID().equals(sc.getSessionID()))
                .findFirst()
                .orElse(null);

        if (s == null) {
            s = new WSUpdateCore.Subscriber();
            s.lastPumpDate = new Date();
            s.sessionContext = sc;
            c.getSubscribers().add(s);
        }
    }

    public static void pump(String channelName, WSUpdateCore.Payload p) {
        WSUpdateCore.Channel c = _findChannel(channelName);
        if (c == null) {
            c = new WSUpdateCore.Channel(channelName);
        }

        p.origin.channel = channelName;
        c.pump(p);
    }
    public static void pump(Class<? extends SuRecord> cls, WSUpdateCore.Payload p) {
        WSUpdateCore.Channel c = _findChannel(cls.getName());
        if (c == null) {
            c = new WSUpdateCore.Channel(cls);
        }

        p.origin.channel = cls.getName();
        c.pump(p);
    }

    public static void pumpAll(WSUpdateCore.Payload p){
        for (WSUpdateCore.Channel c : channels) {
            c.pump(p);
        }
    }

    public static boolean pumpToSession(String sessionId, WSUpdateCore.Payload p) {
        boolean sended = false;
        for (WSUpdateCore.Channel c : channels) {
            for (WSUpdateCore.Subscriber s : c.getSubscribers()) {
                if (s.sessionContext.getSessionID().equals(sessionId)) {
                    p.origin.channel = c.name;
                    c.pump(p);
                    sended = true;
                    break;
                }
            }
        }
        return sended;
    }

    public static boolean sendToSession(WSUpdateCore.Payload p){
        String currentSessionId = SessionCore.getCurrentContext().getSessionID();
        return pumpToSession(currentSessionId, p);
    }




    public static class Channel {
        public String uuid = RecordCore.b2H(RecordCore.guid());
        public String name;
        public Enums.ChannelProtocol protocol;
        private List<WSUpdateCore.Payload> _payloads = new CopyOnWriteArrayList<>();
        private List<WSUpdateCore.Subscriber> _subscribers = new CopyOnWriteArrayList<>();

        public Channel(Class<? extends SuRecord> cls) {
            this.name = cls.getName();
            this.protocol = Enums.ChannelProtocol.PERSISTENCE;
        }

        public Channel(String name) {
            this.name = name;
            this.protocol = Enums.ChannelProtocol.INFORMATION;
        }

        public List<WSUpdateCore.Subscriber> getSubscribers() {
            return this._subscribers;
        }

        public List<WSUpdateCore.Payload> getPayloadsSince(Date since) {
            List<WSUpdateCore.Payload> output = new ArrayList<>();

            try {
                if (this._payloads.size() < 1000) {
                    for (WSUpdateCore.Payload p : this._payloads) {
                        if (p.date.after(since)) {
                            output.add(p);
                        }
                    }
                }
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Error in getPayloadsSince", e);
            }

            return output;
        }

        public void pump(WSUpdateCore.Payload p) {
            this._payloads.add(p);
        }
    }



    public static class Payload implements Serializable {
        private static final long serialVersionUID = 1034881350124204082L;
        @Expose
        @SerializedName("origin")
        public WSUpdateCore.PayloadOrigin origin = new WSUpdateCore.PayloadOrigin();
        @Expose
        @SerializedName("date")
        public Date date;
        @Expose
        @SerializedName("customData")
        public Object customData;
        @Expose
        @SerializedName("manipulations")
        public List<RecordManipulation> manipulations = new CopyOnWriteArrayList<>();
        @Expose
        @SerializedName("fn")
        public String fn;
        @Expose
        @SerializedName("changes")
        public List<FormChange> changes;
        @Expose
        @SerializedName("moduleInitiator")
        public SuResponse.ModuleInitiator moduleInitiator;
        @Expose
        @SerializedName("messages")
        public List<InteractionMessage> messages = new CopyOnWriteArrayList<>();

        public Payload(SessionCore sc) {
            this.origin.type = Enums.PayloadOriginType.USER;
            if (sc != null) {
                this.origin.userName = sc.getUser().getUserName();
            }

            this.date = new Date();
        }

        public Payload() {
            this.origin.type = Enums.PayloadOriginType.USER;
            User user = SessionCore.getCurrentContext().getUser();
            if (user != null) {
                this.origin.userName = SessionCore.getCurrentContext().getUser().getUserName();
            }

            this.date = new Date();
        }

        public WSUpdateCore.Payload copy() {
            WSUpdateCore.Payload output = new WSUpdateCore.Payload();
            output.changes = this.changes;
            output.customData = this.customData;
            output.date = this.date;
            output.fn = this.fn;
            output.messages = this.messages;
            output.moduleInitiator = this.moduleInitiator;
            output.origin = this.origin;
            if (this.manipulations != null) {
                for (RecordManipulation manip : this.manipulations) {
                    output.manipulations.add(manip.copy());
                }
            }
            return output;
        }
    }

    public static class PayloadOrigin implements Serializable {
        private static final long serialVersionUID = -8337882771224506142L;
        @Expose
        @SerializedName("type")
        public Enums.PayloadOriginType type;
        @Expose
        @SerializedName("userName")
        public String userName;
        @Expose
        @SerializedName("systemService")
        public String systemService;
        @Expose
        @SerializedName("channel")
        public String channel;

        public PayloadOrigin() {
            this.type = Enums.PayloadOriginType.USER;
        }
    }
    public static class Subscriber {
        public SessionCore sessionContext;
        public Date lastPumpDate = new Date();
        public StringDictionary<StringDictionary<String>> limits = new StringDictionary<>();
    }
}
