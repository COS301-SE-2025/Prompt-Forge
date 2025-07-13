package com.fiveOps.promptforge.cart.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final RestTemplate restTemplate;
  private final String gatewayURL = "https://api.paystack.co/";
  
  @Value("${paystack.secret-key}")
  private String paystackSecretKey;

  public void inititalizeSingleAuthorPayment(String customerEmail, String subaccountCode, UUID authorID, Double amount) {
    String secretKey = "Bearer "+paystackSecretKey;

    //headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", secretKey);

    BigDecimal bd = new BigDecimal(amount).setScale(2, RoundingMode.HALF_UP);
    Double rounded = bd.doubleValue();
    String amountString = String.format("%.2f",rounded).replace(",", "");
    
    // Body
    Map<String, Object> body = new HashMap<>();
    body.put("email", customerEmail);
    body.put("amount", amountString);

    body.put("subaccount", subaccountCode);
    body.put("bearer", "subaccount");

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    // Make the POST request
    ResponseEntity<String> response = restTemplate.postForEntity(
        gatewayURL + "transaction/initialize", request, String.class);

    // Output response
    System.out.println("\n\nStatus Code: " + response.getStatusCode());
    System.out.println("Response Body:\n" + response.getBody() + "\n\n");

  }

}
