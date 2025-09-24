package com.fiveOps.promptforge.payments.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardWithSubaccountCodeDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.model.BankAccount;
import com.fiveOps.promptforge.payments.repository.BankDetailsRepository;

public class BankDetailsServiceTest {

  @Mock private BankDetailsRepository bankDetailsRepository;
  @Mock private EncryptionService encryptionService;

  @InjectMocks private BankDetailsService bankDetailsService;

  private UUID userId;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    userId = UUID.randomUUID();
  }

  @Test
  void getSubaccountCodeByUserID_ShouldReturnCode_WhenBankDetailsExist() {
    // Arrange
    PayoutCardWithSubaccountCodeDTO dto =
        new PayoutCardWithSubaccountCodeDTO("", "", "", "", "SUB123");

    when(bankDetailsRepository.findByUserUserId(userId)).thenReturn(dto);

    // Act
    String code = bankDetailsService.getSubaccountCodeByUserID(userId);

    // Assert
    assertEquals("SUB123", code);
    verify(bankDetailsRepository).findByUserUserId(userId);
  }

  @Test
  void getSubaccountCodeByUserID_ShouldThrow_WhenBankDetailsNotFound() {
    // Arrange
    when(bankDetailsRepository.findByUserUserId(userId)).thenReturn(null);

    // Act & Assert
    RuntimeException ex =
        assertThrows(
            RuntimeException.class, () -> bankDetailsService.getSubaccountCodeByUserID(userId));
    assertEquals("Author payment details not found", ex.getMessage());
  }

  @Test
  void getBankDetails_ShouldReturnDecryptedDto() {
    // Arrange
    String encryptedAccountNumber = "encryptedAccountNumber";
    String decryptedAccountNumber = "1234567890";

    PayoutCardWithSubaccountCodeDTO dto =
        new PayoutCardWithSubaccountCodeDTO("", "", encryptedAccountNumber, "", "");

    when(bankDetailsRepository.findByUserUserId(userId)).thenReturn(dto);
    when(encryptionService.decrypt(encryptedAccountNumber)).thenReturn(decryptedAccountNumber);

    // Act
    PayoutCardWithSubaccountCodeDTO result = bankDetailsService.getBankDetails(userId);

    // Assert
    assertNotNull(result);
    assertEquals(decryptedAccountNumber, result.getAccountNumber());
    verify(encryptionService).decrypt(encryptedAccountNumber);
  }

  @Test
  void addPayoutDetails_ShouldSaveBankAccountWithEncryptedNumber() {
    // Arrange
    PayoutCardDTO payoutCard = new PayoutCardDTO("TB01", "Test Bank", "12345678", "John Doe");
    String encryptedAccountNumber = "encryptedAccountNumber";

    PaystackAddSubaccountResponseDTO subaccountResponse =
        new PaystackAddSubaccountResponseDTO(true, "SUB123");

    when(encryptionService.encrypt("12345678")).thenReturn(encryptedAccountNumber);

    // Act
    bankDetailsService.addPayoutDetails(userId, payoutCard, subaccountResponse);

    // Assert
    verify(encryptionService).encrypt("12345678");
    verify(bankDetailsRepository, times(1)).save(any(BankAccount.class));
  }

  @Test
  void countPayoutDetailsByUserId_ShouldReturnCount() {
    // Arrange
    when(bankDetailsRepository.countByUserUserId(userId)).thenReturn(3);

    // Act
    Integer count = bankDetailsService.countPayoutDetailsByUserId(userId);

    // Assert
    assertEquals(3, count);
  }

  @Test
  void updatePayoutDetails_ShouldDeleteAndSaveWithEncryptedNumber() {
    // Arrange
    PayoutCardDTO payoutCard = new PayoutCardDTO("TB01", "Test Bank", "12345678", "Jane Doe");
    String encryptedAccountNumber = "encryptedAccountNumber";

    when(encryptionService.encrypt("12345678")).thenReturn(encryptedAccountNumber);

    // Act
    bankDetailsService.updatePayoutDetails(userId, payoutCard, "SUB123");

    // Assert
    verify(encryptionService).encrypt("12345678");
    verify(bankDetailsRepository).deleteByUserUserId(userId);
    verify(bankDetailsRepository).save(any(BankAccount.class));
  }
}
