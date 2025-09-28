package com.fiveOps.promptforge.authentication.util;

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class RsaKeyManager {
  private static final Logger LOGGER = LoggerFactory.getLogger(RsaKeyManager.class);
  private KeyPair keyPair;

  public RsaKeyManager() {
    try {
      KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
      keyGen.initialize(2048);
      this.keyPair = keyGen.generateKeyPair();
    } catch (Exception e) {
      throw new RuntimeException("Failed to generate RSA key pair", e);
    }
  }

  public PublicKey getPublicKey() {
    return keyPair.getPublic();
  }

  public PrivateKey getPrivateKey() {
    return keyPair.getPrivate();
  }

  // Export public key as JWK-like minimal map for frontend import
  public Map<String, Object> getPublicJwk() {
    try {
      PublicKey pub = getPublicKey();
      if (!(pub instanceof RSAPublicKey)) {
        throw new RuntimeException("Public key is not RSA");
      }
      RSAPublicKey rsaPub = (RSAPublicKey) pub;
      BigInteger modulus = rsaPub.getModulus();
      BigInteger exponent = rsaPub.getPublicExponent();

      String n =
          Base64.getUrlEncoder()
              .withoutPadding()
              .encodeToString(stripLeadingZero(modulus.toByteArray()));
      String e =
          Base64.getUrlEncoder()
              .withoutPadding()
              .encodeToString(stripLeadingZero(exponent.toByteArray()));

      return Map.of(
          "kty", "RSA",
          "alg", "RSA-OAEP-256",
          "use", "enc",
          "n", n,
          "e", e);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private byte[] stripLeadingZero(byte[] input) {
    if (input.length > 1 && input[0] == 0) {
      byte[] out = new byte[input.length - 1];
      System.arraycopy(input, 1, out, 0, out.length);
      return out;
    }
    return input;
  }

  public String decryptBase64EncryptedRSA(String base64Encrypted) {
    try {
      if (base64Encrypted == null) throw new IllegalArgumentException("Empty cipher text");
      String trimmed = base64Encrypted.trim();
      byte[] encrypted = null;
      try {
        encrypted = Base64.getDecoder().decode(trimmed);
      } catch (IllegalArgumentException ex) {
        // Try URL-safe decoder as a fallback
        try {
          encrypted = Base64.getUrlDecoder().decode(trimmed);
        } catch (IllegalArgumentException ex2) {
          // Try to repair padding and characters
          String repaired = trimmed.replace('-', '+').replace('_', '/');
          int pad = (4 - (repaired.length() % 4)) % 4;
          for (int i = 0; i < pad; i++) repaired += '=';
          encrypted = Base64.getDecoder().decode(repaired);
        }
      }
      java.security.PrivateKey priv = getPrivateKey();

      byte[] decrypted = null;
      // First attempt: OAEP with SHA-256
      try {
        String transformation = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
        javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance(transformation);
        java.security.spec.MGF1ParameterSpec mgf1 =
            new java.security.spec.MGF1ParameterSpec("SHA-256");
        javax.crypto.spec.OAEPParameterSpec oaepSpec =
            new javax.crypto.spec.OAEPParameterSpec(
                "SHA-256", "MGF1", mgf1, javax.crypto.spec.PSource.PSpecified.DEFAULT);
        cipher.init(javax.crypto.Cipher.DECRYPT_MODE, priv, oaepSpec);
        decrypted = cipher.doFinal(encrypted);
        LOGGER.debug("Decryption succeeded with OAEP-SHA256");
      } catch (javax.crypto.BadPaddingException e) {
        // Padding error with SHA-256 — try OAEP with SHA-1 for compatibility
        try {
          LOGGER.debug("OAEP-SHA256 failed, trying OAEP-SHA1 fallback");
          String transformation = "RSA/ECB/OAEPWithSHA-1AndMGF1Padding";
          javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance(transformation);
          java.security.spec.MGF1ParameterSpec mgf1 =
              new java.security.spec.MGF1ParameterSpec("SHA-1");
          javax.crypto.spec.OAEPParameterSpec oaepSpec =
              new javax.crypto.spec.OAEPParameterSpec(
                  "SHA-1", "MGF1", mgf1, javax.crypto.spec.PSource.PSpecified.DEFAULT);
          cipher.init(javax.crypto.Cipher.DECRYPT_MODE, priv, oaepSpec);
          decrypted = cipher.doFinal(encrypted);
          LOGGER.debug("Decryption succeeded with OAEP-SHA1 (fallback)");
        } catch (Exception e2) {
          throw new RuntimeException("Failed to decrypt password", e2);
        }
      }
      return new String(decrypted);
    } catch (Exception e) {
      LOGGER.error("Failed to decrypt password", e);
      throw new RuntimeException("Failed to decrypt password", e);
    }
  }
}
