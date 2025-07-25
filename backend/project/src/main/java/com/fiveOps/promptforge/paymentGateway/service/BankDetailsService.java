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
    System.out.println("userId:" + userId);
    String userDetails =
        bankDetailsRepository
            .findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Author payment details not found"));
    return userDetails;
  }
}
