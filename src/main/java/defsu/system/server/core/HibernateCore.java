package defsu.system.server.core;

import defsu.system.server.maps.MapComponentstate;
import defsu.system.server.maps.MapUser;
import defsu.system.server.maps.MapUserlog;
import defsu.system.server.utils.Logger;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;

import java.util.ArrayList;

@Getter
@Setter
public class HibernateCore {
    @Getter
    @Setter
    private static Configuration mainCfg;
    @Getter
    @Setter
    private static ArrayList<Class<?>> mappingClasses = new ArrayList<>();
    @Getter
    @Setter
    private static SessionFactory mainSessionFactory;
    @Getter
    @Setter
    private static Session mainSession;
    @Getter
    @Setter
    private static Transaction mainTransaction;
    @Getter
    @Setter
    private static DatabaseConnection mainDatabaseConnection = null;
    
    /**
     * Session'ın açıldığı zamanı takip etmek için
     */
    private static long sessionCreationTime = 0;
    /**
     * Session'ın maksimum yaşam süresi (milisaniye cinsinden) - varsayılan 30 dakika
     */
    private static final long MAX_SESSION_AGE_MS = 30 * 60 * 1000;

    private static SessionFactory buildSessionFactory() {
        try {
            return new Configuration().configure().buildSessionFactory();
        } catch (Throwable ex) {
            throw new ExceptionInInitializerError(ex);
        }
    }

    public HibernateCore() {
        this.initialize();
    }

    public void init() {
        this.initialize();
    }
    public static void configure(DatabaseConnection mainDb) {
        setMainDatabaseConnection(mainDb);
        addMapping();
    }

    public static void addMapping(){
        addMapping(MapUser.class);
        addMapping(MapComponentstate.class);
        addMapping(MapUserlog.class);
    }

    private void initialize(){
        try{
            if(getMainSessionFactory() == null){
                if(getMainDatabaseConnection() != null){
                    setMainCfg(new Configuration());
                    for(Class<?> cls : getMappingClasses()){
                        getMainCfg().addAnnotatedClass(cls);
                    }
                    getMainCfg().setProperty("hibernate.connection.password", getMainDatabaseConnection().getDbPass());
                    getMainCfg().setProperty("hibernate.connection.username", getMainDatabaseConnection().getDbUser());
                    getMainCfg().setProperty("hibernate.connection.url", "jdbc:mysql://" + getMainDatabaseConnection().getDbHost() + ":" + getMainDatabaseConnection().getDbPort() + "/" + getMainDatabaseConnection().getDbName() + "?useUnicode=true&characterEncoding=UTF-8&useSSL=false&autoReconnect=true");
                    getMainCfg().setProperty("hibernate.connection.driver_class", getMainDatabaseConnection().getDriver());
                    getMainCfg().setProperty("hibernate.show_sql", "false");
                    getMainCfg().setProperty("hibernate.hbm2ddl.auto", "update");
                    getMainCfg().setProperty("hibernate.c3p0.preferredTestQuery", "SELECT 1");
                    getMainCfg().setProperty("hibernate.c3p0.idle_test_period", "300");
                    getMainCfg().setProperty("hibernate.c3p0.min_size", "5");
                    getMainCfg().setProperty("hibernate.c3p0.max_size", "75");
                    getMainCfg().setProperty("hibernate.c3p0.timeout", "300");
                    getMainCfg().setProperty("hibernate.c3p0.max_statements", "50");
                    getMainCfg().setProperty("hibernate.c3p0.numHelperThreads", "16");
                    getMainCfg().setProperty("hibernate.cache.provider_class", "org.hibernate.cache.NoCacheProvider");
                    setMainSessionFactory(getMainCfg().buildSessionFactory());
                }else{
                    Logger.Error("Database connection is not set",true);
                    return;
                }
            }
            
            // Mevcut session açıksa önce kapatalım
            if (getMainSession() != null && getMainSession().isOpen()) {
                try {
                    getMainSession().close();
                } catch (Exception e) {
                    Logger.Error( e,"Error closing existing session",true);
                }
            }
            
            // Yeni session açalım
            setMainSession(getMainSessionFactory().openSession());
            sessionCreationTime = System.currentTimeMillis();
        }catch (Exception e){
            Logger.Error(e,true);
        }
    }
    public static void addMapping(Class<?> cls){
        getMappingClasses().add(cls);
    }

    /**
     * Session'ın yaşını kontrol eder ve çok uzun süre açık kalmışsa yeniler.
     * Bu metod, uzun süreli session'ların neden olabileceği bellek sızıntılarını önler.
     */
    public static void checkSessionAge() {
        try {
            // Session null ise veya kapalıysa yeni bir session aç
            if (getMainSession() == null || !getMainSession().isOpen()) {
                setMainSession(getMainSessionFactory().openSession());
                sessionCreationTime = System.currentTimeMillis();
                return;
            }
            
            // Session çok uzun süre açık kalmışsa kapat ve yenisini aç
            if (System.currentTimeMillis() - sessionCreationTime > MAX_SESSION_AGE_MS) {
                Logger.Info("Refreshing long-running Hibernate session (age: " + 
                           ((System.currentTimeMillis() - sessionCreationTime) / 1000) + " seconds)");
                
                try {
                    if (getMainTransaction() != null && getMainTransaction().isActive()) {
                        getMainTransaction().commit();
                    }
                    getMainSession().close();
                } catch (Exception e) {
                    Logger.Error( e,"Error closing old session", true);
                }
                
                setMainSession(getMainSessionFactory().openSession());
                sessionCreationTime = System.currentTimeMillis();
            }
        } catch (Exception e) {
            Logger.Error( e,"Error in checkSessionAge", true);
        }
    }

    public static <T> boolean saveMain(T entity){
        checkSessionAge();
        Transaction transaction = null;
        try (Session session = getMainSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(entity);
            transaction.commit();
            return true;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            Logger.Error(e, true);
            return false;
        }
    }

    public static <T> boolean updateMain(T entity) {
        checkSessionAge();
        Transaction transaction = null;
        try (Session session = getMainSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.update(entity);
            transaction.commit();
            return true;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            Logger.Error(e, true);
            return false;
        }
    }

    public static <T> boolean deleteMain(T entity) {
        checkSessionAge();
        Transaction transaction = null;
        try (Session session = getMainSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.remove(entity);
            transaction.commit();
            return true;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            Logger.Error(e, true);
            return false;
        }
    }

    public static <T> T getMain(Class<T> clazz, byte[] id) {
        checkSessionAge();
        try (Session session = getMainSessionFactory().openSession()) {
            return session.get(clazz, id);
        } catch (Exception e) {
            Logger.Error(e, true);
            return null;
        }
    }

    public boolean commitMain() {
       checkSessionAge();
       if(getMainTransaction() != null && getMainSession().isOpen()){
           try{
               getMainTransaction().commit();
           }catch (Exception e){
               try {
                   getMainSession().close();
               } catch (Exception ee) {
                   Logger.Error(ee,true);
               }
               Logger.Error(e,true);
               return false;
           }
              return true;
       }else{
              Logger.Error("Transaction is null or session is closed",true);
              return false;
       }
    }

    public HibernateCriteriaBuilder getCriteriaBuilder(){
        checkSessionAge();
        return getMainSessionFactory().getCriteriaBuilder();
    }

    public boolean beginTransaction(){
        try {
            checkSessionAge();
            if(!getMainSession().isOpen()){
                setMainSession(getMainSessionFactory().openSession());
                sessionCreationTime = System.currentTimeMillis();
            }
            if(getMainSession().isOpen()){
                setMainTransaction(getMainSession().beginTransaction());
                return true;
            }
            return false;
        }catch (Exception e){
            Logger.Error(e,true);
            return false;
        }
    }

    @Getter
    @Setter
    public static class DatabaseConnection{
        private String dbPort = "";
        private String dbHost = "";
        private String dbName = "";
        private String dbPass = "";
        private String dbUser = "";
        private String driver = "";

        public DatabaseConnection(String dbPort, String dbHost, String dbName, String dbPass, String dbUser, String driver){
            setDbPort(dbPort);
            setDbHost(dbHost);
            setDbName(dbName);
            setDbPass(dbPass);
            setDbUser(dbUser);
            setDriver(driver);
        }
    }
}
