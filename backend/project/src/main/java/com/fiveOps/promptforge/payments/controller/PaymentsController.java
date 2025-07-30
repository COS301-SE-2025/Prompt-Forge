package com.fiveOps.promptforge.payments.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.cart.dto.APIResponse;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.payments.dto.InitializePaymentRequest;
import com.fiveOps.promptforge.payments.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.payments.projection.PaymentDetailsProjection;
import com.fiveOps.promptforge.payments.service.BankDetailsService;
import com.fiveOps.promptforge.payments.service.PaymentService;
import com.fiveOps.promptforge.user_profile.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentsController {

  private final PaymentService paymentService;
  private final UserService userService;
  private final BankDetailsService bankDetailsService;

  @PostMapping("/initialize")
  public ResponseEntity<APIResponse> checkoutCart(
      @RequestBody InitializePaymentRequest request, Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      List<CartItemDTO> prompts = request.getPrompts();

      TransactionInitializationResponse transactionAccessCodeAndReference = paymentService.initializePayment(userEmail,
          prompts, request.getTotal());

      return ResponseEntity.ok(
          new APIResponse(
              "success",
              "Transaction initialization successful",
              transactionAccessCodeAndReference));
    } catch (Exception e) {
      System.err.println("Checkout error: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(new APIResponse("error", "Checkout failed: " + e.getMessage()));
    }
  }

  @GetMapping("/user-payment-details")
  public ResponseEntity<APIResponse> bankDetails(Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      UUID userId = userService.getUserIdByEmail(userEmail);
      PaymentDetailsProjection details = bankDetailsService.getBankDetails(userId);
      if (details == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new APIResponse("error", "payment details not found", null));
      }
      return ResponseEntity.ok(new APIResponse("success", "Payment details found", details));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(
              new APIResponse(
                  "error", "Failed to fetch payment details failed: " + e.getMessage()));
    }
  }

  @GetMapping("/bank-list")
  public ResponseEntity<APIResponse> bankList(Authentication authentication) {
    try {
      // String userEmail = authentication.getName();
      // UUID userId = userService.getUserIdByEmail(userEmail);
      Object details = paymentService.getBankList();
      if (details == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new APIResponse("error", "bank list not found", null));
      }
      return ResponseEntity.ok(new APIResponse("success", "bank list found", details));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(
              new APIResponse(
                  "error", "Failed to fetch bank list: " + e.getMessage()));
    }
    
  }
}
