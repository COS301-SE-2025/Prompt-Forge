package com.fiveOps.promptforge.payments.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.payments.dto.BankDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.dto.PaystackBankListResponseDTO;
import com.fiveOps.promptforge.payments.dto.PaystackErrorResponse;
import com.fiveOps.promptforge.payments.dto.PaystackResponseDTO;
import com.fiveOps.promptforge.payments.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.user_profile.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final RestTemplate restTemplate;
  private final UserService userService;
  private final BankDetailsService bankDetailsService;
  private final ObjectMapper objectMapper;
  private final String gatewayURL = "https://api.paystack.co/";

  @Value("${paystack.secret-key}")
  private String paystackSecretKey;

  public TransactionInitializationResponse inititalizeSingleAuthorPayment(
      String customerEmail, String subaccountCode, UUID authorID, int amount) {

    String secretKey = "Bearer " + paystackSecretKey;

    // headers
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
    try {
      ResponseEntity<String> response = restTemplate.postForEntity(gatewayURL + "transaction/initialize", request,
          String.class);

      // Output response
      System.out.println("\n\nStatus Code: " + response.getStatusCode());
      System.out.println("Response Body:\n" + response.getBody() + "\n\n");

      System.out.println("Paystack response:");
      System.out.println(response.getBody());

      ObjectMapper mapper = new ObjectMapper();
      JsonNode responseBody = mapper.readTree(response.getBody());

      Boolean status = responseBody.path("status").asBoolean();
      if (status) {
        String reference = responseBody.path("data").path("reference").asText();
        return new TransactionInitializationResponse(amount, customerEmail, reference);
      }

      throw new RuntimeException();
    } catch (Exception e) {
      // TODO: handle exception
      e.printStackTrace();
      throw new RuntimeException("Error checking out");
    }
  }

  public TransactionInitializationResponse initializeSplitPayment(
      String customerEmail, List<Map<String, Object>> subaccounts, int amount) {
    String url = gatewayURL + "transaction/initialize";

    // Set headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + paystackSecretKey);

    // Create split object
    Map<String, Object> split = new HashMap<>();
    split.put("type", "flat");
    split.put("bearer_type", "account");
    split.put("subaccounts", subaccounts);

    // request body
    Map<String, Object> body = new HashMap<>();
    body.put("email", customerEmail);
    body.put("amount", amount);
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
        String reference = responseBody.path("data").path("reference").asText();
        return new TransactionInitializationResponse(amount, customerEmail, reference);
      }

      throw new RuntimeException();
      // Optional: parse and extract authorization_url if needed
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException("Error checking out");
      // Optionally rethrow or wrap exception
    }
  }

  public TransactionInitializationResponse initializePayment(
      String customerEmail, List<CartItemDTO> prompts, Double total) throws Exception {

    Integer roundedTotalInCents = (int) Math.round(total * 100);
    Map<UUID, Integer> authorShares = new HashMap<>();
    if (roundedTotalInCents <= 0)
      throw new Exception("amount must be greater than zero");

    try {
      for (int i = 0; i < prompts.size(); i++) {
        CartItemDTO cartItem = prompts.get(i);

        UUID promptAuthorID = userService.getUserByUsername(cartItem.getAuthorName()).getUserId();
        int price = (int) Math.round(cartItem.getPromptPrice() * 100);

        // Accumulate the share for each author
        if (price > 0) {
          authorShares.put(promptAuthorID, authorShares.getOrDefault(promptAuthorID, 0) + price);
        }
      }

      if (authorShares.size() == 1) {
        Map.Entry<UUID, Integer> authorShareEntry = authorShares.entrySet().iterator().next();
        UUID authorId = authorShareEntry.getKey();
        String subaccountCode = bankDetailsService.getSubaccountCodeByUserID(authorId);
        return inititalizeSingleAuthorPayment(
            customerEmail, subaccountCode, authorId, roundedTotalInCents);
      } else {
        // Prepare Paystack subaccounts payload
        List<Map<String, Object>> subaccounts = new ArrayList<>();
        Integer totalCalculated = 0;

        for (Map.Entry<UUID, Integer> entry : authorShares.entrySet()) {
          UUID authorId = entry.getKey();
          Integer authorShare = entry.getValue();
          totalCalculated += authorShare;
          String subaccountCode = bankDetailsService.getSubaccountCodeByUserID(authorId);
          Map<String, Object> sub = new HashMap<>();
          sub.put("subaccount", subaccountCode);
          sub.put("share", authorShare); // share in kobo
          subaccounts.add(sub);
        }
        return initializeSplitPayment(customerEmail, subaccounts, roundedTotalInCents);
      }

    } catch (Exception e) {
      System.out.println("error purchasing:");
      System.out.println(e);
      throw e;
    }
  }

  public List<BankDTO> getBankList() {

    String secretKey = "Bearer " + paystackSecretKey;

    // headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", secretKey);

    // Make the GET request
    try {
      ResponseEntity<PaystackBankListResponseDTO> responseEntity = restTemplate
          .getForEntity(gatewayURL + "bank?country=south africa", PaystackBankListResponseDTO.class);
      PaystackBankListResponseDTO response = responseEntity.getBody();

      if (response.getStatus()) {
        return response.getData();
      }

      throw new RuntimeException();
    } catch (Exception e) {
      // TODO: handle exception
      e.printStackTrace();
      throw new RuntimeException();
    }
  }

  public PaystackAddSubaccountResponseDTO addSubaccount(String username, PayoutCardDTO payoutCard) throws Exception {
    String secretKey = "Bearer " + paystackSecretKey;

    // headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", secretKey);

    // Body
    Map<String, Object> body = new HashMap<>();
    body.put("business_name", username);
    body.put("bank_code", payoutCard.getBankCode());
    body.put("account_number", payoutCard.getAccountNumber());
    body.put("percentage_charge", 0);

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    // Make the POST request
    try {
      ResponseEntity<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>> responseEntity = restTemplate.exchange(
          gatewayURL + "subaccount",
          HttpMethod.POST,
          request, // request body + headers
          new ParameterizedTypeReference<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>>() {
          });

      // Output response
      System.out.println("\n\nStatus Code: " + responseEntity.getStatusCode());
      System.out.println("Response Body:\n" + responseEntity.getBody() + "");

      System.out.println("before response");
      PaystackResponseDTO<PaystackAddSubaccountResponseDTO> response = responseEntity.getBody();
      System.out.println("after response");

      System.out.println("dataaaa:" + response.getData());

      if (responseEntity.getStatusCode() == HttpStatusCode.valueOf(201)) {
        if (response.getStatus()) {
          System.out.println("get status is trueeeeeee");
          PaystackAddSubaccountResponseDTO data = response.getData();

          System.out.println("subaccoutCode:" + data.getSubaccount_code());
          System.out.println("isVerified:" + data.getVerification());
          return data;
        }
      } else {
        if (responseEntity.getStatusCode() == HttpStatusCode.valueOf(400)) {
          System.out.println("\n\n hereeeeeeeeeee throwing response.getmessage");
          throw new RuntimeException(response.getMessage());
        }
      }
      System.out.println("status:" + response.getMessage());
      throw new RuntimeException("Unable to create subaccount");
    } catch (HttpClientErrorException e) {
      if (e.getStatusCode().value() == 400) {
        try {
          PaystackErrorResponse errorResponse = objectMapper.readValue(e.getResponseBodyAsString(),
              PaystackErrorResponse.class);
          System.err.println("Validation failed: " + errorResponse.getMessage());
          throw new RuntimeException(errorResponse.getMessage());
        } catch (JsonMappingException runEx) {
          throw new RuntimeException("Internal server error");
        } catch (Exception runEx) {
          throw runEx;
        }
      } else {
        System.err.println("Unhandled error: " + e.getMessage());
        throw new RuntimeException(e.getMessage());
      }
    } catch (Exception e) {
      System.out.println("last exception:" + e.getMessage());
      throw e;
    }
  }

}
