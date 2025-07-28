package com.fiveOps.promptforge.payments.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.payments.projection.PaymentDetailsProjectionWithPaystackSubaccountCode;
import com.fiveOps.promptforge.payments.repository.BankDetailsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankDetailsService {

  private final BankDetailsRepository bankDetailsRepository;

  public String getSubaccountIDByUserID(UUID userId) {
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
}
