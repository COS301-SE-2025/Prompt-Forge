package com.fiveOps.promptforge.cart.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final RestTemplate restTemplate;
  private final String gatewayURL = "https:// api.paystack.co/";

  public void inititalizeSingleAuthorPayment(UUID authorID,Double amount) {
    
  }

}
