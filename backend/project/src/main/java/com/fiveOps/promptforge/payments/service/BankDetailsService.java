package com.fiveOps.promptforge.payments.service;

import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardWithSubaccountCodeDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.model.BankAccount;
import com.fiveOps.promptforge.payments.repository.BankDetailsRepository;
import com.fiveOps.promptforge.user_profile.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankDetailsService {

  private final BankDetailsRepository bankDetailsRepository;

  public String getSubaccountCodeByUserID(UUID userId) {
    System.out.println("userId:" + userId);
    PayoutCardWithSubaccountCodeDTO bankDetails = getBankDetails(userId);

    if (bankDetails == null) {
      throw new RuntimeException("Author payment details not found");
    }
    return bankDetails.getAccountNumber();
  }

  public PayoutCardWithSubaccountCodeDTO getBankDetails(UUID userId) {
    System.out.println("userId:" + userId);
    PayoutCardWithSubaccountCodeDTO userDetails = bankDetailsRepository.findByUserUserId(userId);
    return userDetails;
  }

  public void addPayoutDetails(
      UUID userID,
      PayoutCardDTO payoutCard,
      PaystackAddSubaccountResponseDTO subaccountCodeAndAccountVerification) {
    BankAccount bankAccount = new BankAccount();

    bankAccount.setUser(new User());
    bankAccount.getUser().setUserId(userID);
    bankAccount.setBankName(payoutCard.getBank().getName());
    bankAccount.setBankCode(payoutCard.getBank().getCode());
    bankAccount.setAccountNumber(payoutCard.getAccountNumber());
    bankAccount.setAccountHolder(payoutCard.getAccountHolder());
    bankAccount.setVerified(subaccountCodeAndAccountVerification.getVerification());
    bankAccount.setPaystackSubaccountCode(subaccountCodeAndAccountVerification.getSubaccountCode());
    bankDetailsRepository.save(bankAccount);
    return;
  }

  public Integer countPayoutDetailsByUserId(UUID userID) {
    return bankDetailsRepository.countByUserUserId(userID);
  }

  @Transactional
  public void updatePayoutDetails(UUID userID, PayoutCardDTO payoutCard, String subaccountCode) {
    BankAccount bankAccount = new BankAccount();

    bankAccount.setUser(new User());
    bankAccount.getUser().setUserId(userID);
    bankAccount.setBankName(payoutCard.getBank().getName());
    bankAccount.setBankCode(payoutCard.getBank().getCode());
    bankAccount.setAccountNumber(payoutCard.getAccountNumber());
    bankAccount.setAccountHolder(payoutCard.getAccountHolder());
    bankAccount.setPaystackSubaccountCode(subaccountCode);

    bankDetailsRepository.deleteByUserUserId(userID);
    bankDetailsRepository.save(bankAccount);
    return;
  }
}
