package com.fiveOps.promptforge.payments.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.model.BankAccount;
import com.fiveOps.promptforge.payments.projection.PaymentDetailsProjectionWithPaystackSubaccountCode;
import com.fiveOps.promptforge.payments.repository.BankDetailsRepository;
import com.fiveOps.promptforge.user_profile.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankDetailsService {

  private final BankDetailsRepository bankDetailsRepository;

  public String getSubaccountCodeByUserID(UUID userId) {
    System.out.println("userId:" + userId);
    PaymentDetailsProjectionWithPaystackSubaccountCode bankDetails = getBankDetails(userId);

    if (bankDetails == null) {
      throw new RuntimeException("Author payment details not found");
    }
    return bankDetails.getPaystackSubaccountCode();
  }

  public PaymentDetailsProjectionWithPaystackSubaccountCode getBankDetails(UUID userId) {
    System.out.println("userId:" + userId);
    PaymentDetailsProjectionWithPaystackSubaccountCode userDetails =
        bankDetailsRepository.findByUserUserId(userId);
    return userDetails;
  }
  
  public void addPayoutDetails(UUID userID, PayoutCardDTO payoutCard, PaystackAddSubaccountResponseDTO subaccountCodeAndAccountVerification) {
    BankAccount bankAccount = new BankAccount();

    bankAccount.setUser(new User());
    bankAccount.getUser().setUserId(userID);
    bankAccount.setBankName(payoutCard.getBankName());
    bankAccount.setBankCode(payoutCard.getBankCode());
    bankAccount.setAccountNumber(payoutCard.getAccountNumber());
    bankAccount.setAccountHolder(payoutCard.getCardHolderName());
    bankAccount.setVerified(subaccountCodeAndAccountVerification.getVerification());
    bankAccount.setPaystackSubaccountCode(subaccountCodeAndAccountVerification.getSubaccount_code());
    bankDetailsRepository.save(bankAccount);
    return ;
  }

}
