package com.fiveOps.promptforge.payments.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

public class EncryptionServiceTest {

  private EncryptionService encryptionService;

  @BeforeEach
  void setUp() {
    encryptionService = new EncryptionService();
    ReflectionTestUtils.setField(
        encryptionService, "encryptionKey", "MyTestEncryptionKey32Chars!!");
  }

  @Test
  void testEncryptDecrypt() {
    // Arrange
    String originalText = "1234567890";

    // Act
    String encrypted = encryptionService.encrypt(originalText);
    String decrypted = encryptionService.decrypt(encrypted);

    // Assert
    assertNotEquals(originalText, encrypted);
    assertEquals(originalText, decrypted);
  }

  @Test
  void testEncryptProducesDifferentOutput() {
    // Arrange
    String originalText = "9876543210";

    // Act
    String encrypted = encryptionService.encrypt(originalText);

    // Assert
    assertNotEquals(originalText, encrypted);
    assertNotNull(encrypted);
    assertTrue(encrypted.length() > 0);
  }

  @Test
  void testDecryptWithInvalidData() {
    // Arrange
    String invalidEncryptedData = "invalidBase64Data";

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          encryptionService.decrypt(invalidEncryptedData);
        });
  }

  @Test
  void testEncryptNullThrowsException() {
    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          encryptionService.encrypt(null);
        });
  }

  @Test
  void testDecryptNullThrowsException() {
    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          encryptionService.decrypt(null);
        });
  }
}
