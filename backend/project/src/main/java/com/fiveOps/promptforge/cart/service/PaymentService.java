package com.fiveOps.promptforge.cart.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final RestTemplate restTemplate;
  private final String gatewayURL = "https://api.paystack.co/";
  
  @Value("${paystack.secret-key}")
  private String paystackSecretKey;

  public void inititalizeSingleAuthorPayment(String customerEmail, String subaccountCode,
    UUID authorID, int amount) {
    String secretKey = "Bearer "+paystackSecretKey;

    //headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", secretKey);
    
    // Body
    Map<String, Object> body = new HashMap<>();
    body.put("email", customerEmail);
    body.put("amount", amount);

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

  public String initializeSplitPayment(String customerEmail, List<Map<String, 
    Object>> subaccounts, int total) {
    String url = gatewayURL+"transaction/initialize";

    // Set headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + paystackSecretKey);

    // Create split object
    Map<String, Object> split = new HashMap<>();
    split.put("type", "flat");
    split.put("bearer_type", "account");
    split.put("subaccounts", subaccounts);

    //request body
    Map<String, Object> body = new HashMap<>();
    body.put("email", customerEmail);
    body.put("amount", total);
    body.put("split", split);

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    try {
      ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
      System.out.println("Paystack response:");
      System.out.println(response.getBody());

      ObjectMapper mapper = new ObjectMapper();
      JsonNode responseBody = mapper.readTree(response.getBody());

      Boolean status = responseBody.path("status").asBoolean();
      if (status) {
        String accessCode = responseBody.path("data").path("access_code").asText();
        return accessCode;
      }

      throw new RuntimeException();
      // Optional: parse and extract authorization_url if needed
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException("Error checking out");
      // Optionally rethrow or wrap exception
    }
  }
}
