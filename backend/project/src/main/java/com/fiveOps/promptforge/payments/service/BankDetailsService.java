package com.fiveOps.promptforge.payments.service;

import java.util.Optional;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardWithSubaccountCodeDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.model.BankAccount;
import com.fiveOps.promptforge.payments.repository.BankDetailsRepository;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankDetailsService {

  private final BankDetailsRepository bankDetailsRepository;
  private final UserRepository userRepository;
  private final EncryptionService encryptionService;

  public String getSubaccountCodeByUserID(UUID userId) {
    System.out.println("Getting subaccount code for userId:" + userId);

    try {
      PayoutCardWithSubaccountCodeDTO bankDetails = bankDetailsRepository.findByUserUserId(userId);

      if (bankDetails == null) {
        System.out.println("No bank details found for user: " + userId);
        throw new RuntimeException("Author payment details not found");
      }

      String subaccountCode = bankDetails.getPaystackSubaccountCode();
      System.out.println("Retrieved subaccount code: " + subaccountCode);

      if (subaccountCode == null || subaccountCode.isEmpty()) {
        throw new RuntimeException("Paystack subaccount code not found for author");
      }

      return subaccountCode;
    } catch (Exception e) {
      System.err.println(
          "Error getting subaccount code for user " + userId + ": " + e.getMessage());
      throw new RuntimeException("Failed to retrieve author payment details: " + e.getMessage(), e);
    }
  }

  public PayoutCardWithSubaccountCodeDTO getBankDetails(UUID userId) {
    try {
      PayoutCardWithSubaccountCodeDTO dto = bankDetailsRepository.findByUserUserId(userId);
      if (dto != null && dto.getAccountNumber() != null && !dto.getAccountNumber().isEmpty()) {
        System.out.println("Decrypting account number for user: " + userId);
        // Decrypt the account number before returning
        String decryptedAccountNumber = encryptionService.decrypt(dto.getAccountNumber());
        dto.setAccountNumber(decryptedAccountNumber);
        System.out.println("Successfully decrypted account number");
      }
      return dto;
    } catch (Exception e) {
      System.err.println("Error getting bank details for user " + userId + ": " + e.getMessage());
      throw new RuntimeException("Failed to retrieve bank details: " + e.getMessage(), e);
    }
  }

  public void addPayoutDetails(
      UUID userId, PayoutCardDTO payoutCard, PaystackAddSubaccountResponseDTO subaccountResponse) {
    BankAccount bankAccount = new BankAccount();

    Optional<User> user = userRepository.findById(userId);
    if (user.isEmpty()) {
      throw new RuntimeException("User not found");
    }

    bankAccount.setUser(user.get());
    bankAccount.setBankCode(payoutCard.getBank().getCode());
    bankAccount.setBankName(payoutCard.getBank().getName());
    // Encrypt the account number before saving
    bankAccount.setAccountNumber(encryptionService.encrypt(payoutCard.getAccountNumber()));
    bankAccount.setAccountHolder(payoutCard.getAccountHolder());
    bankAccount.setPaystackSubaccountCode(subaccountResponse.getSubaccountCode());

    bankDetailsRepository.save(bankAccount);
  }

  public Integer countPayoutDetailsByUserId(UUID userID) {
    return bankDetailsRepository.countByUserUserId(userID);
  }

  @Transactional
  public void updatePayoutDetails(UUID userId, PayoutCardDTO payoutCard, String subaccountCode) {
    bankDetailsRepository.deleteByUserUserId(userId);

    BankAccount bankAccount = new BankAccount();

    Optional<User> user = userRepository.findById(userId);
    if (user.isEmpty()) {
      throw new RuntimeException("User not found");
    }

    bankAccount.setUser(user.get());
    bankAccount.setBankCode(payoutCard.getBank().getCode());
    bankAccount.setBankName(payoutCard.getBank().getName());
    // Encrypt the account number before saving
    bankAccount.setAccountNumber(encryptionService.encrypt(payoutCard.getAccountNumber()));
    bankAccount.setAccountHolder(payoutCard.getAccountHolder());
    bankAccount.setPaystackSubaccountCode(subaccountCode);

    bankDetailsRepository.save(bankAccount);
  }
}
