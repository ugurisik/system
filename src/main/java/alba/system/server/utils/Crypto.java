package alba.system.server.utils;

import alba.system.SystemApplication;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class Crypto {
    private static final String ALGORITHM = "AES";
    private static final int KEY_SIZE = 128;

    private SecretKey secretKey;

    public Crypto() {
        this.secretKey = generateKey(SystemApplication.secretKey);
    }

    private static SecretKey generateKey(String key){
        byte[] keyBytes = key.getBytes();
        byte[] keyBytesPadded = new byte[KEY_SIZE / 8]; // Örneğin 128 bit için 16 byte
        System.arraycopy(keyBytes, 0, keyBytesPadded, 0, Math.min(keyBytes.length, keyBytesPadded.length));
        return new SecretKeySpec(keyBytesPadded, ALGORITHM);
    }

    public static String encrypt(String data) throws Exception {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, generateKey(SystemApplication.secretKey));
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        }catch (Exception e){
            Logger.Error(e, false);
            return data;
        }
    }

    public static String decrypt(String encryptedData) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, generateKey(SystemApplication.secretKey));
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decryptedBytes);
    }
}
