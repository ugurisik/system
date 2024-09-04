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

    private static SecretKey generateKey(String key) {
        byte[] keyBytes = key.getBytes();
        return new SecretKeySpec(keyBytes, 0, KEY_SIZE / 8, ALGORITHM);
    }

    public static String encrypt(String data) throws Exception {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, generateKey(SystemApplication.secretKey));
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        }catch (Exception e){
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
