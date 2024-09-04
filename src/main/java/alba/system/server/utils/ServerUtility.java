package alba.system.server.utils;

import alba.system.server.core.SessionCore;
import alba.system.server.core.StringDictionary;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.Date;

public class ServerUtility {
    public static final Date emptyDate = new Date(0L);
    private static final String defaultUploadFolder = "/core/uploads/";
    public static String DATE_FORMAT = "dd.MM.yyyy";
    public static String DATETIME_FORMAT = "dd.MM.yyyy HH:mm:ss";
    public static ArrayList<String> languageCodes;
    public static ArrayList<String> languageCodesShort;
    public static String APPLICATION = "core";
    public static char DECIMAL_SEPARATOR = ',';
    public static char THOUSAND_SEPARATOR = '.';
    public static String DECIMAL_FORMAT = "0.00########";
    public static String DECIMAL_FORMAT_2 = "0.00";

    public static String DECIMAL_FORMAT_3 = "0.0000";
    public static String CURRENCY_FORMAT = "0.000";
    public static String CURRENCY_FORMAT_2 = "0.00";
    public static String CURRENCY_SUFFIX = "";
    public static String CURRENCY_PREFIX = " ";
    private static DecimalFormat decimalFormat;
    private static DecimalFormat decimalFormat2;
    private static DecimalFormat decimalFormat3;

    private static DecimalFormat decimalFormat4;
    private static DecimalFormat currencyFormat;

    private static StringDictionary<StringDictionary<String>> parameters = new StringDictionary();
    private static StringDictionary<StringDictionary<String>> memory = new StringDictionary();

    public static Date now() {
        return new Date();
    }



    public static Date getEmptyDate() {
        return new Date(emptyDate.getTime());
    }

    public static DecimalFormat getDecimalFormat() {
        if (decimalFormat == null) {
            decimalFormat = new DecimalFormat(DECIMAL_FORMAT);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat.setGroupingSize(3);
            decimalFormat.setGroupingUsed(true);
            decimalFormat.setDecimalFormatSymbols(symbols);
        }

        return decimalFormat;
    }

    public static DecimalFormat getDecimalFormat2() {
        if (decimalFormat3 == null) {
            decimalFormat3 = new DecimalFormat(DECIMAL_FORMAT_2);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat3.setGroupingSize(3);
            decimalFormat3.setGroupingUsed(true);
            decimalFormat3.setDecimalFormatSymbols(symbols);
        }

        return decimalFormat3;
    }


    public static DecimalFormat getDecimalFormat3() {
        if (decimalFormat4 == null) {
            decimalFormat4 = new DecimalFormat(DECIMAL_FORMAT_3);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat4.setGroupingSize(3);
            decimalFormat4.setGroupingUsed(true);
            decimalFormat4.setDecimalFormatSymbols(symbols);
        }

        return decimalFormat4;
    }

    public static DecimalFormat getCurrencyFormat() {
        if (currencyFormat == null) {
            String format = new String(CURRENCY_FORMAT);
            if (CURRENCY_PREFIX.length() > 0) {
                format = "'" + CURRENCY_PREFIX + "'" + format;
            }

            if (CURRENCY_SUFFIX.length() > 0) {
                format = format + "'" + CURRENCY_SUFFIX + "'";
            }

            currencyFormat = new DecimalFormat(format);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            currencyFormat.setGroupingSize(3);
            currencyFormat.setGroupingUsed(true);
            currencyFormat.setDecimalFormatSymbols(symbols);
            if (CURRENCY_PREFIX.length() > 0) {
                currencyFormat.setNegativePrefix(CURRENCY_PREFIX + "-");
            }
        }

        return currencyFormat;
    }

    public static DecimalFormat getCurrencyFormat2() {
        if (decimalFormat2 == null) {
            String format = new String(CURRENCY_FORMAT_2);
            if (CURRENCY_PREFIX.length() > 0) {
                format = "'" + CURRENCY_PREFIX + "'" + format;
            }

            if (CURRENCY_SUFFIX.length() > 0) {
                format = format + "'" + CURRENCY_SUFFIX + "'";
            }

            decimalFormat2 = new DecimalFormat(format);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setDecimalSeparator(DECIMAL_SEPARATOR);
            symbols.setGroupingSeparator(THOUSAND_SEPARATOR);
            decimalFormat2.setGroupingSize(3);
            decimalFormat2.setGroupingUsed(true);
            decimalFormat2.setDecimalFormatSymbols(symbols);
            if (CURRENCY_PREFIX.length() > 0) {
                decimalFormat2.setNegativePrefix(CURRENCY_PREFIX + "-");
            }
        }

        return decimalFormat2;
    }
    public static void setParameter(String key, String value) {
        SessionCore sc = SessionCore.getCurrentContext();
        if (!parameters.containsKey(sc.getSessionID())) {
            parameters.put((String) sc.getSessionID(), new StringDictionary());
        }

        StringDictionary<String> sessionParams = (StringDictionary) parameters.get(sc.getSessionID());
        sessionParams.put((String) key, value);
    }

    public static StringDictionary<String> getMemory() {
        SessionCore sc = SessionCore.getCurrentContext();
        if (!memory.containsKey(sc.getSessionID())) {
            memory.put((String) sc.getSessionID(), new StringDictionary());
        }

        return (StringDictionary) memory.get(sc.getSessionID());
    }
    public static void clearMemory() {
        try{
            StringDictionary<String> mem = getMemory();
            mem.clear();
        }catch (Exception e){}
    }
    public static String getParameter(String key) {
        SessionCore sc = SessionCore.getCurrentContext();
        if (parameters.containsKey(sc.getSessionID())) {
            StringDictionary<String> sessionParams = (StringDictionary) parameters.get(sc.getSessionID());
            if (sessionParams.containsKey(key)) {
                return (String) sessionParams.get(key);
            }
        }

        return "";
    }
}
