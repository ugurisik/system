package defsu.system.server.core;

import defsu.system.projects.sys.record.User;
import defsu.system.server.components.WindowForm;
import defsu.system.server.utils.Logger;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;

public class ServerUtility {

    private static DecimalFormat decimalFormat;
    private static DecimalFormat decimalFormat2;
    private static DecimalFormat decimalFormat3;
    private static DecimalFormat decimalFormat4;

    public static String DECIMAL_FORMAT = "0.00########";
    public static String DECIMAL_FORMAT_2 = "0.00";
    public static String DECIMAL_FORMAT_3 = "0.0000";

    private static DecimalFormat currencyFormat;
    public static String CURRENCY_FORMAT = "0.000";
    public static String CURRENCY_FORMAT_2 = "0.00";
    public static String CURRENCY_SUFFIX = "";
    public static String CURRENCY_PREFIX = " ";

    public static char DECIMAL_SEPARATOR = ',';
    public static char THOUSAND_SEPARATOR = '.';

    public static String DATE_FORMAT = "dd.MM.yyyy";
    public static String DATETIME_FORMAT = "dd.MM.yyyy HH:mm:ss";

    public static final Date emptyDate = new Date(0L);

    private static StringDictionary<Long> _userDates = new StringDictionary();
    private static StringDictionary<StringDictionary<String>> _parameters = new StringDictionary();
    private static StringDictionary<StringDictionary<String>> _memory = new StringDictionary();
    private static StringDictionary<User> _users = new StringDictionary();
    private static StringDictionary<WindowForm> _activeForms = new StringDictionary();
    private static final String defaultUploadFolder = "/core/uploads/";



    public static Date now() {
        SessionCore sc = SessionCore.getCurrentContext();
        if (_userDates.containsKey(sc.getSessionID())) {
            long dif = _userDates.get(sc.getSessionID());
            return new Date(System.currentTimeMillis() + dif);
        } else {
            return new Date();
        }
    }

    public static Date today() {
        Date now = now();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    private static StringDictionary<String> getSessionParameters() {
        SessionCore sc = SessionCore.getCurrentContext();
        return _parameters.computeIfAbsent(sc.getSessionID(), k -> new StringDictionary<>());
    }

    public static void setParameter(String key, String value) {
        StringDictionary<String> sessionParams = getSessionParameters();
        sessionParams.put(key, value);
    }

    public static void clearParameters() {
        StringDictionary<String> sessionParams = getSessionParameters();
        sessionParams.clear();
    }

    public static String getParameter(String key) {
        StringDictionary<String> sessionParams = getSessionParameters();
        return sessionParams.getOrDefault(key, "");
    }

    public static StringDictionary<String> getMemory() {
        SessionCore sc = SessionCore.getCurrentContext();
        return _memory.computeIfAbsent(sc.getSessionID(), k -> new StringDictionary<>());
    }

    public static void clearMemory() {
        try {
            getMemory().clear();
        } catch (Exception e) {
            Logger.Error(e,true);
        }
    }


    public static User getUser() {
        SessionCore sc = SessionCore.getCurrentContext();
        try{
            System.out.println(sc.getUser().getUserName());
        }catch (Exception e){
            System.out.println("User is null");
        }
        return sc.getUser() != null ? sc.getUser() : new User();
    }

    public static void setUser(User user) {
        SessionCore sc = SessionCore.getCurrentContext();
        sc.setUser(user);
    }

    public static void flushUser(byte[] userPK) {
        for (Map.Entry<String, User> entry : _users.entrySet()) {
            String sid = entry.getKey();
            User user = entry.getValue();
            if (Arrays.equals(user.getUserPK(), userPK)) {
                _users.put(sid, new User(userPK));
                WindowForm.getForms(sid).clear();
                return;
            }
        }
    }

    public static WindowForm getForm() {
        SessionCore sc = SessionCore.getCurrentContext();
        return _activeForms.get(sc.getSessionID());
    }

    public static void setForm(WindowForm form) {
        SessionCore sc = SessionCore.getCurrentContext();
        _activeForms.put(sc.getSessionID(), form);
    }

    public static WindowForm getForm(Class<?> cls) {
        WindowForm form = getForm();
        return (form != null && form.getClass().equals(cls)) ? form : null;
    }

    public static Object getConfig(String path, String config, Object defaultValue) {
        // TODO:: get config
        return "";
    }

    public static boolean setConfig(String path, String config, Object value) {
        // TODO:: set config
        return false;
    }

    public static String getUploadFolder() {
        // TODO:: get upload folder from config
        return "";
    }

    private static DecimalFormat configureDecimalFormat(String pattern, DecimalFormat decimalFormat) {
        if (decimalFormat == null) {
            decimalFormat = new DecimalFormat(pattern);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat.setGroupingSize(3);
            decimalFormat.setGroupingUsed(true);
            decimalFormat.setDecimalFormatSymbols(symbols);
        }
        return decimalFormat;
    }

    public static DecimalFormat getDecimalFormat() {
        return decimalFormat = configureDecimalFormat(DECIMAL_FORMAT, decimalFormat);
    }

    public static DecimalFormat getDecimalFormat2() {
        return decimalFormat3 = configureDecimalFormat(DECIMAL_FORMAT_2, decimalFormat3);
    }

    public static DecimalFormat getDecimalFormat3() {
        return decimalFormat4 = configureDecimalFormat(DECIMAL_FORMAT_3, decimalFormat4);
    }

    private static DecimalFormat configureCurrencyFormat(String pattern, DecimalFormat decimalFormat,
                                                         String prefix, String suffix) {
        if (decimalFormat == null) {
            String format = pattern;
            if (prefix.length() > 0) {
                format = "'" + prefix + "'" + format;
            }
            if (suffix.length() > 0) {
                format = format + "'" + suffix + "'";
            }

            decimalFormat = new DecimalFormat(format);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat.setGroupingSize(3);
            decimalFormat.setGroupingUsed(true);
            decimalFormat.setDecimalFormatSymbols(symbols);

            if (prefix.length() > 0) {
                decimalFormat.setNegativePrefix(prefix + "-");
            }
        }
        return decimalFormat;
    }

    public static DecimalFormat getCurrencyFormat() {
        return currencyFormat = configureCurrencyFormat(CURRENCY_FORMAT, currencyFormat, CURRENCY_PREFIX, CURRENCY_SUFFIX);
    }

    public static DecimalFormat getCurrencyFormat2() {
        return decimalFormat2 = configureCurrencyFormat(CURRENCY_FORMAT_2, decimalFormat2, CURRENCY_PREFIX, CURRENCY_SUFFIX);
    }
}
