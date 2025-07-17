package com.fiveOps.promptforge.paymentGateway.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.dto.APIResponse;
import com.fiveOps.promptforge.paymentGateway.dto.InitializePaymentRequest;
import com.fiveOps.promptforge.paymentGateway.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.paymentGateway.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
public class PaymentsController {

  private final PaymentService paymentService;

  public PaymentsController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping("/initialize")
  public ResponseEntity<APIResponse> checkoutCart(
      @RequestBody InitializePaymentRequest request, Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      List<CartItemDTO> prompts = request.getPrompts();

      TransactionInitializationResponse transactionAccessCodeAndReference = paymentService
        .initializePayment(userEmail, prompts, request.getTotal());

      return ResponseEntity.ok(new APIResponse("success",
        "Transaction initialization successful", transactionAccessCodeAndReference));
    } catch (Exception e) {
      System.err.println("Checkout error: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(new APIResponse("error", "Checkout failed: " + e.getMessage()));
    }
  }
}
