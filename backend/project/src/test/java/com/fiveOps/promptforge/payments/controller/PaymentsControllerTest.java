package com.fiveOps.promptforge.payments.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.fiveOps.promptforge.cart.dto.APIResponse;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.payments.dto.BankDTO;
import com.fiveOps.promptforge.payments.dto.InitializePaymentRequestDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardWithSubaccountCodeDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.payments.service.BankDetailsService;
import com.fiveOps.promptforge.payments.service.PaymentService;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.service.UserService;

@ExtendWith(MockitoExtension.class)
public class PaymentsControllerTest {

  @Mock private PaymentService paymentService;
  @Mock private UserService userService;
  @Mock private BankDetailsService bankDetailsService;
  @Mock private Authentication authentication;
  @InjectMocks private PaymentsController paymentsController;

  private static final String TEST_EMAIL = "test@example.com";
  private static final UUID TEST_USER_ID = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    lenient().when(authentication.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  void testinitializePaymentSuccess() throws Exception {
    // Arrange
    InitializePaymentRequestDTO request = new InitializePaymentRequestDTO();
    List<CartItemDTO> prompts = new ArrayList<>();
    request.setPrompts(prompts);
    request.setTotal(100.0);

    TransactionInitializationResponse response =
        new TransactionInitializationResponse(1000, TEST_EMAIL, "ref_123");

    lenient()
        .when(paymentService.initializePayment(TEST_EMAIL, prompts, 100.0))
        .thenReturn(response);

    // Act
    ResponseEntity<APIResponse> result =
        paymentsController.initializePayment(request, authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
    assertEquals(response, result.getBody().getData());
  }

  @Test
  void testGetUserPayoutDetailsSuccess() {
    // Arrange
    PayoutCardWithSubaccountCodeDTO detailsWithCode =
        new PayoutCardWithSubaccountCodeDTO(
            "123", "Test Bank", "1234567890", "Test User", "SUB_123");

    lenient().when(userService.getUserIdByEmail(TEST_EMAIL)).thenReturn(TEST_USER_ID);
    lenient().when(bankDetailsService.getBankDetails(TEST_USER_ID)).thenReturn(detailsWithCode);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.bankDetails(authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());

    PayoutCardDTO returnedDetails = (PayoutCardDTO) result.getBody().getData();
    assertEquals("123", returnedDetails.getBank().getCode());
    assertEquals("Test Bank", returnedDetails.getBank().getName());
    assertEquals(
        "1234567890",
        returnedDetails.getAccountNumber()); // This should be decrypted by the service
    assertEquals("Test User", returnedDetails.getAccountHolder());
  }

  @Test
  void testGetBankListSuccess() {
    // Arrange
    List<BankDTO> bankList = new ArrayList<>();
    bankList.add(new BankDTO("Test Bank", "123"));
    lenient().when(paymentService.getBankList()).thenReturn(bankList);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.bankList(authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
    assertEquals(bankList, result.getBody().getData());
  }

  @Test
  void testAddPayoutCardSuccess() throws Exception {
    // Arrange
    PayoutCardDTO request = new PayoutCardDTO("123", "Test Bank", "1234567890", "Test User");
    UserDto userDto = new UserDto();
    userDto.setUsername("testuser");

    PaystackAddSubaccountResponseDTO paystackResponse =
        new PaystackAddSubaccountResponseDTO(true, "SUB_123");

    lenient().when(userService.getUserByEmail(TEST_EMAIL)).thenReturn(userDto);
    lenient().when(paymentService.addSubaccount("testuser", request)).thenReturn(paystackResponse);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.addPayoutCard(request, authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
  }

  @Test
  void testUpdatePayoutCardSuccess() throws Exception {
    // Arrange
    PayoutCardDTO request = new PayoutCardDTO("123", "Test Bank", "1234567890", "Test User");

    UserDto userDto = new UserDto();
    userDto.setUserId(TEST_USER_ID);
    userDto.setUsername("testuser");

    lenient().when(userService.getUserByEmail(TEST_EMAIL)).thenReturn(userDto);
    lenient()
        .when(bankDetailsService.getSubaccountCodeByUserID(TEST_USER_ID))
        .thenReturn("SUB_123");

    // Act
    ResponseEntity<APIResponse> result = paymentsController.editPayoutCard(request, authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
  }

  @Test
  void testGetBankListEmptyList() {
    // Arrange
    List<BankDTO> emptyBankList = new ArrayList<>();
    lenient().when(paymentService.getBankList()).thenReturn(emptyBankList);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.bankList(authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
    assertEquals(emptyBankList, result.getBody().getData());
  }

  @Test
  void testGetBankListNullResponse() {
    // Arrange
    lenient().when(paymentService.getBankList()).thenReturn(null);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.bankList(authentication);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
    assertEquals("error", result.getBody().getStatus());
    assertEquals("bank list not found", result.getBody().getMessage());
  }

  @Test
  void testGetBankListMultipleBanks() {
    // Arrange
    List<BankDTO> multipleBanks = new ArrayList<>();
    multipleBanks.add(new BankDTO("First Bank", "001"));
    multipleBanks.add(new BankDTO("Second Bank", "002"));
    multipleBanks.add(new BankDTO("Third Bank", "003"));

    lenient().when(paymentService.getBankList()).thenReturn(multipleBanks);

    // Act
    ResponseEntity<APIResponse> result = paymentsController.bankList(authentication);

    // Assert
    assertEquals(HttpStatus.OK, result.getStatusCode());
    assertEquals("success", result.getBody().getStatus());
    assertEquals(multipleBanks, result.getBody().getData());
    assertEquals(3, ((List<BankDTO>) result.getBody().getData()).size());
  }

  // @Test
  // void testGetBankListServiceException() {
  // // Arrange
  // lenient().when(paymentService.getBankList())
  // .thenThrow(new RuntimeException("Service unavailable"));

  // // Act
  // ResponseEntity<APIResponse> result =
  // paymentsController.bankList(authentication);

  // // Assert
  // assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
  // assertEquals("error", result.getBody().getStatus());
  // assertEquals("Failed to fetch bank list", result.getBody().getMessage());
  // }
}
