package com.fiveOps.promptforge.payments.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
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
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

public class BankDetailsServiceTest {

  @Mock private BankDetailsRepository bankDetailsRepository;
  @Mock private UserRepository userRepository;
  @Mock private EncryptionService encryptionService;

  @InjectMocks private BankDetailsService bankDetailsService;

  private UUID userId;
  private User mockUser;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    userId = UUID.randomUUID();
    mockUser = new User();
    mockUser.setUserId(userId);
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
    assertEquals(
        "Failed to retrieve author payment details: Author payment details not found",
        ex.getMessage());
  }

  @Test
  void getBankDetails_ShouldReturnDto() {
    // Arrange
    PayoutCardWithSubaccountCodeDTO dto = new PayoutCardWithSubaccountCodeDTO("", "", "", "", "");
    when(bankDetailsRepository.findByUserUserId(userId)).thenReturn(dto);

    // Act
    PayoutCardWithSubaccountCodeDTO result = bankDetailsService.getBankDetails(userId);

    // Assert
    assertNotNull(result);
    assertEquals(dto, result);
  }

  @Test
  void addPayoutDetails_ShouldSaveBankAccount() {
    // Arrange
    PayoutCardDTO payoutCard = new PayoutCardDTO("TB01", "Test Bank", "12345678", "John Doe");

    PaystackAddSubaccountResponseDTO subaccountResponse =
        new PaystackAddSubaccountResponseDTO(true, "SUB123");

    when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
    when(encryptionService.encrypt(anyString())).thenReturn("encrypted_value");

    // Act
    bankDetailsService.addPayoutDetails(userId, payoutCard, subaccountResponse);

    // Assert
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
  void updatePayoutDetails_ShouldDeleteAndSave() {
    // Arrange
    PayoutCardDTO payoutCard = new PayoutCardDTO("TB01", "Test Bank", "12345678", "Jane Doe");

    when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
    when(encryptionService.encrypt(anyString())).thenReturn("encrypted_value");

    // Act
    bankDetailsService.updatePayoutDetails(userId, payoutCard, "SUB123");

    // Assert
    verify(bankDetailsRepository).deleteByUserUserId(userId);
    verify(bankDetailsRepository).save(any(BankAccount.class));
  }
}
