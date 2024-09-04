package alba.system.server.core;

import alba.system.server.utils.Enums;
import alba.system.server.utils.Logger;
import alba.system.server.utils.ServerUtility;

import javax.swing.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

public class RecordCore {

    public static final byte[] ZERO_16 = new byte[16];
    private static final byte[] HEX_CHAR_TABLE = new byte[]{48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102};

    public static byte[] guid() {
        UUID id = UUID.randomUUID();
        byte[] byteArray = new byte[16];
        ByteBuffer buffer = ByteBuffer.wrap(byteArray);
        buffer.putLong(id.getMostSignificantBits());
        buffer.putLong(id.getLeastSignificantBits());
        return byteArray;
    }

    public static String toMD5(String input) {
        try {
            // MD5 mesaj özetini almak için MessageDigest örneği oluşturuyoruz
            MessageDigest md = MessageDigest.getInstance("MD5");

            // Girdi verisini byte dizisi olarak alıyoruz
            byte[] messageDigest = md.digest(input.getBytes());

            // byte dizisini hex formatına çeviriyoruz
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                hexString.append(String.format("%02x", b & 0xff));
            }

            // Hex formatındaki MD5 hash değerini döndürüyoruz
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            Logger.Error(e, true);
            return "";
        }
    }

    public static String guidS() {
        UUID id = UUID.randomUUID();
        byte[] byteArray = new byte[16];
        ByteBuffer buffer = ByteBuffer.wrap(byteArray);
        buffer.putLong(id.getMostSignificantBits());
        buffer.putLong(id.getLeastSignificantBits());
        return Arrays.toString(byteArray);
    }

    public static byte[] h2B(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];

        for(int i = 0; i < len; i += 2) {
            data[i / 2] = (byte)((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i + 1), 16));
        }

        return data;
    }

    public static String b2H(byte[] bytes) {
        if (bytes == null) {
            return "";
        } else {
            byte[] hex = new byte[2 * bytes.length];
            int index = 0;
            int var5 = bytes.length;

            for(int var4 = 0; var4 < var5; ++var4) {
                byte b = bytes[var4];
                int v = b & 255;
                hex[index++] = HEX_CHAR_TABLE[v >>> 4];
                hex[index++] = HEX_CHAR_TABLE[v & 15];
            }

            try {
                return new String(hex, StandardCharsets.US_ASCII);
            } catch (Exception var8) {
                return "";
            }
        }
    }

    public static byte[] i2B(int i) {
        byte[] bytes = new byte[16];
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        buffer.putInt(12, i);
        return bytes;
    }

    public static String i2H(int i) {
        byte[] bytes = new byte[16];
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        buffer.putInt(12, i);
        return b2H(bytes);
    }

    public static int b2I(byte[] ba) {
        return h2I(b2H(ba));
    }

    public static int h2I(String hex) {
        return Integer.parseInt(hex, 16);
    }

    public static String arrayJoin(String[] s, String glue) {
        int k = s.length;
        if (k == 0) {
            return null;
        } else {
            StringBuilder out = new StringBuilder();
            out.append(s[0]);

            for(int x = 1; x < k; ++x) {
                out.append(glue).append(s[x]);
            }

            return out.toString();
        }
    }

    public static <K extends Comparable<K>, V> LinkedHashMap<K, V> sortByKey(LinkedHashMap<K, V> map, OrderType order) {
        List<Map.Entry<K, V>> entries = new ArrayList<>(map.entrySet());

        if (order == OrderType.ASC) {
            entries.sort(Map.Entry.comparingByKey());
        } else if (order == OrderType.DESC) {
            entries.sort(Map.Entry.<K, V>comparingByKey().reversed());
        } else {
            throw new IllegalArgumentException("Order must be 'asc' or 'desc'");
        }

        LinkedHashMap<K, V> sortedMap = new LinkedHashMap<>();
        for (Map.Entry<K, V> entry : entries) {
            sortedMap.put(entry.getKey(), entry.getValue());
        }
        return sortedMap;
    }
    public static <K extends Comparable<K>, V extends Comparable<V>> LinkedHashMap<K, V> sortByValue(LinkedHashMap<K, V> map, OrderType order) {
        List<Map.Entry<K, V>> entries = new ArrayList<>(map.entrySet());

        if (order == OrderType.ASC) {
            entries.sort(Map.Entry.comparingByValue());
        } else if (order == OrderType.DESC) {
            entries.sort(Map.Entry.<K, V>comparingByValue().reversed());
        } else {
            throw new IllegalArgumentException("Order must be 'asc' or 'desc'");
        }

        LinkedHashMap<K, V> sortedMap = new LinkedHashMap<>();
        for (Map.Entry<K, V> entry : entries) {
            sortedMap.put(entry.getKey(), entry.getValue());
        }
        return sortedMap;
    }

    public static double round(double value) {
        return  round(value, 2);
    }
    public static double round(double value, int decimalPlaces) {
        double scale = Math.pow(10, decimalPlaces);
        return Math.round(value * scale) / scale;
    }

    public static String clearTurkishChars(String str) {
        String ret = str;
        char[] turkishChars = new char[]{'ı', 'İ', 'ü', 'Ü', 'ö', 'Ö', 'ş', 'Ş', 'ç', 'Ç', 'ğ', 'Ğ'};
        char[] englishChars = new char[]{'i', 'I', 'u', 'U', 'o', 'O', 's', 'S', 'c', 'C', 'g', 'G'};

        for (int i = 0; i < turkishChars.length; ++i) {
            ret = ret.replaceAll(new String(new char[]{turkishChars[i]}), new String(new char[]{englishChars[i]}));
        }

        return ret;
    }

    public static byte[] serialize(Object r) {
        try {
            ByteArrayOutputStream bs = new ByteArrayOutputStream();
            ObjectOutputStream stream = new ObjectOutputStream(bs);
            stream.writeObject(r);
            return bs.toByteArray();
        } catch (Exception e) {
            Logger.Error(e, true);
            return null;
        }
    }
    public static Object deserialize(byte[] binaryData) {
        try {
            ByteArrayInputStream input = new ByteArrayInputStream(binaryData);
            ObjectInputStream stream = new ObjectInputStream(input);
            return (Object) stream.readObject();
        } catch (Exception e) {
            Logger.Error(e, true);
            return null;
        }
    }

    public static String convertDate(Date date, DateType type){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        if(type == DateType.DATE){
            sdf = new SimpleDateFormat("yyyy-MM-dd");
        }else if(type == DateType.TIME){
            sdf = new SimpleDateFormat("HH:mm:ss");
        }else if(type == DateType.DATETIME){
            sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        }
        return sdf.format(date);
    }
    public enum DateType {
        DATE,
        TIME,
        DATETIME
    }
    public enum OrderType {
        ASC,
        DESC
    }

    public static String padRight(String s, int n) {
        return String.format("%1$-" + n + "s", s);
    }

    public static String padLeft(String s, int n) {
        return String.format("%1$" + n + "s", s);
    }


    public static Icon scaleIcon(Icon icon, int width, int height){
        return new ImageIcon(((ImageIcon) icon).getImage().getScaledInstance(width, height, java.awt.Image.SCALE_SMOOTH));
    }

    public static String convertToString(Object value, Enums.FT type) {
        if (value == null) {
            return "";
        } else if (value instanceof byte[]) {
            return RecordCore.b2H((byte[]) value);
        } else if (value instanceof Date) {

            if (type == Enums.FT.ONLY_DATE) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                return sdf.format((Date) value);
            }
            if (type == Enums.FT.ONLY_DATE_2) {
                SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
                return sdf.format((Date) value);
            }


            if (((Date) value).getTime() == ServerUtility.emptyDate.getTime()) {
                return "-";
            } else {
                Date dValue = (Date) value;
                if (type == Enums.FT.DATETIME) {
                    return (new SimpleDateFormat(ServerUtility.DATETIME_FORMAT)).format(dValue);
                } else if (type == Enums.FT.DATE) {
                    return (new SimpleDateFormat(ServerUtility.DATE_FORMAT)).format(dValue);
                } else {
                    return dValue.getHours() == 0 && dValue.getMinutes() == 0 && dValue.getSeconds() == 0 ? (new SimpleDateFormat(ServerUtility.DATE_FORMAT)).format(dValue) : (new SimpleDateFormat(ServerUtility.DATETIME_FORMAT)).format(dValue);
                }
            }
        } else if (!(value instanceof Double) && !(value instanceof Float) && !(value instanceof BigDecimal)) {
            return value.toString();
        } else if (type == Enums.FT.CURRENCY) {
            return ServerUtility.getCurrencyFormat().format(value);
        } else if (type == Enums.FT.CURRENCY_2) {
            return ServerUtility.getCurrencyFormat2().format(value);
        } else if (type == Enums.FT.DOUBLE_2) {
            return ServerUtility.getDecimalFormat2().format(value);
        } else if (type == Enums.FT.DOUBLE_3) {
            return ServerUtility.getDecimalFormat3().format(value);
        } else {
            return type == Enums.FT.DOUBLE ? ServerUtility.getDecimalFormat().format(value) : ServerUtility.getDecimalFormat2().format(value);
        }
    }
}
