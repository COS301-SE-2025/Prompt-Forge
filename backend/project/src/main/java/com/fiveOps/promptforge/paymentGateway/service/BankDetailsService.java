package com.fiveOps.promptforge.paymentGateway.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import com.fiveOps.promptforge.cart.repository.BankDetailsRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankDetailsService {

  private final BankDetailsRepository bankDetailsRepository;
  
  public String getSubaccountIDByUserID(UUID userId) {
    String userDetails = bankDetailsRepository.findByUserId(userId)
      .orElseThrow(()-> new RuntimeException("Recipient code not found for user"));
    return userDetails;
  }

  
}
