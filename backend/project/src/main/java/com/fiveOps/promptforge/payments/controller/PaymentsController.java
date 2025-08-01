package com.fiveOps.promptforge.payments.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.cart.dto.APIResponse;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.payments.dto.InitializePaymentRequestDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.payments.projection.PaymentDetailsProjection;
import com.fiveOps.promptforge.payments.service.BankDetailsService;
import com.fiveOps.promptforge.payments.service.PaymentService;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
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
      @RequestBody InitializePaymentRequestDTO request, Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      List<CartItemDTO> prompts = request.getPrompts();

      TransactionInitializationResponse transactionAccessCodeAndReference =
          paymentService.initializePayment(userEmail, prompts, request.getTotal());

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
          .body(new APIResponse("error", "Failed to fetch bank list: " + e.getMessage()));
    }
  }

  @PostMapping("/add-payout-card")
  public ResponseEntity<APIResponse> addPayoutCard(
      @RequestBody PayoutCardDTO request, Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      UserDto user = userService.getUserByEmail(userEmail);

      Integer detailsCount = bankDetailsService.countPayoutDetailsByUserId(user.getUserId());
      if (detailsCount < 1) {
        PaystackAddSubaccountResponseDTO subaccountCodeAndAccountVerification =
            paymentService.addSubaccount(user.getUsername(), request);

        bankDetailsService.addPayoutDetails(
            user.getUserId(), request, subaccountCodeAndAccountVerification);

        return ResponseEntity.ok(new APIResponse("success", "Payout details added successfully"));
      }
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(new APIResponse("error", "Payout details already exist for user"));
    } catch (DataAccessResourceFailureException e) {
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(new APIResponse("error", "Internal server error, please try again later"));
    } catch (Exception e) {

      System.err.println(e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest().body(new APIResponse("error", e.getMessage()));
    }
  }

  @PutMapping("/update-payout-card")
  public ResponseEntity<APIResponse> editPayoutCard(
      @RequestBody PayoutCardDTO request, Authentication authentication) {
    try {

      String userEmail = authentication.getName();
      UserDto user = userService.getUserByEmail(userEmail);

      String subaccountCode = bankDetailsService.getSubaccountCodeByUserID(user.getUserId());
      paymentService.updateSubaccount(subaccountCode, user.getUsername(), request);
      bankDetailsService.updatePayoutDetails(user.getUserId(), request, subaccountCode);
      return ResponseEntity.ok(new APIResponse("success", "Payout details updated successfully"));
    } catch (DataAccessResourceFailureException e) {
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(new APIResponse("error", "Internal server error, please try again later"));
    } catch (Exception e) {

      System.err.println(e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest().body(new APIResponse("error", e.getMessage()));
    }
  }
}
