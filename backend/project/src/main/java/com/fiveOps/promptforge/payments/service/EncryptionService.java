package com.fiveOps.promptforge.payments.service;

import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EncryptionService {

  @Value("${app.encryption.key:defaultEncryptionKey123456}")
  private String encryptionKey;

  private static final String ALGORITHM = "AES";
  private static final String TRANSFORMATION = "AES";

  public String encrypt(String plainText) {
    try {
      SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(), ALGORITHM);
      Cipher cipher = Cipher.getInstance(TRANSFORMATION);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey);
      byte[] encryptedData = cipher.doFinal(plainText.getBytes());
      return Base64.getEncoder().encodeToString(encryptedData);
    } catch (Exception e) {
      throw new RuntimeException("Error encrypting data: " + e.getMessage(), e);
    }
  }

  public String decrypt(String encryptedText) {
    try {
      SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(), ALGORITHM);
      Cipher cipher = Cipher.getInstance(TRANSFORMATION);
      cipher.init(Cipher.DECRYPT_MODE, secretKey);
      byte[] decodedData = Base64.getDecoder().decode(encryptedText);
      byte[] decryptedData = cipher.doFinal(decodedData);
      return new String(decryptedData);
    } catch (Exception e) {
      throw new RuntimeException("Error decrypting data: " + e.getMessage(), e);
    }
  }
}
