package com.fiveOps.promptforge.payments.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.payments.dto.BankDTO;
import com.fiveOps.promptforge.payments.dto.PayoutCardDTO;
import com.fiveOps.promptforge.payments.dto.PaystackAddSubaccountResponseDTO;
import com.fiveOps.promptforge.payments.dto.PaystackBankListResponseDTO;
import com.fiveOps.promptforge.payments.dto.PaystackErrorResponseDTO;
import com.fiveOps.promptforge.payments.dto.PaystackResponseDTO;
import com.fiveOps.promptforge.payments.dto.TransactionInitializationResponse;
import com.fiveOps.promptforge.user_profile.service.UserService;

class PaymentServiceTest {

  @Mock private RestTemplate restTemplate;
  @Mock private UserService userService;
  @Mock private BankDetailsService bankDetailsService;
  @Mock private ObjectMapper objectMapper;

  @InjectMocks private PaymentService paymentService;

  private final String secretKey = "sk_test_123";

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    // inject @Value manually for test
    paymentService.getClass().getDeclaredFields();
    try {
      var f = PaymentService.class.getDeclaredField("paystackSecretKey");
      f.setAccessible(true);
      f.set(paymentService, secretKey);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void inititalizeSingleAuthorPayment_ShouldReturnReference_WhenPaystackReturnsSuccess()
      throws Exception {
    // Arrange
    String responseJson = "{\"status\":true,\"data\":{\"reference\":\"ref_123\"}}";
    ResponseEntity<String> mockResponse = new ResponseEntity<>(responseJson, HttpStatus.OK);

    when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    TransactionInitializationResponse result =
        paymentService.inititalizeSingleAuthorPayment(
            "test@example.com", "sub_123", UUID.randomUUID(), 5000);
    // Assert
    assertNotNull(result);
    assertEquals("ref_123", result.getReference());
    assertEquals(5000, result.getAmount());
    verify(restTemplate)
        .postForEntity(contains("transaction/initialize"), any(HttpEntity.class), eq(String.class));
  }

  @Test
  void initializeSplitPayment_ShouldReturnReference_WhenPaystackReturnsSuccess() throws Exception {
    // Arrange
    String responseJson = "{\"status\":true,\"data\":{\"reference\":\"split_ref_456\"}}";
    ResponseEntity<String> mockResponse = new ResponseEntity<>(responseJson, HttpStatus.OK);

    when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    List<Map<String, Object>> subs = List.of(Map.of("subaccount", "sub1", "share", 3000));

    // Act
    TransactionInitializationResponse result =
        paymentService.initializeSplitPayment("test@example.com", subs, 10000);

    // Assert
    assertEquals("split_ref_456", result.getReference());
    assertEquals(10000, result.getAmount());
  }

  @Test
  void initializePayment_ShouldUseSingleAuthorFlow_WhenOneAuthor() throws Exception {
    // Arrange
    CartItemDTO cartItem = new CartItemDTO();
    cartItem.setAuthorName("author1");
    cartItem.setPromptPrice(50.0);

    UUID authorId = UUID.randomUUID();

    when(userService.getUserByUsername("author1"))
        .thenReturn(
            new com.fiveOps.promptforge.user_profile.dto.UserDto() {
              {
                setUserId(authorId);
              }
            });
    when(bankDetailsService.getSubaccountCodeByUserID(authorId)).thenReturn("sub_123");

    // Spy so we can mock only inititalizeSingleAuthorPayment
    PaymentService spyService = Mockito.spy(paymentService);
    doReturn(new TransactionInitializationResponse(5000, "test@example.com", "ref_123"))
        .when(spyService)
        .inititalizeSingleAuthorPayment(anyString(), anyString(), any(), anyInt());

    // Act
    TransactionInitializationResponse result =
        spyService.initializePayment("test@example.com", List.of(cartItem), 50.0);

    // Assert
    assertEquals("ref_123", result.getReference());
    verify(spyService)
        .inititalizeSingleAuthorPayment(
            eq("test@example.com"), eq("sub_123"), eq(authorId), eq(5000));
  }

  @Test
  void initializePayment_ShouldUseSplitPaymentFlow_WhenMultipleAuthors() throws Exception {
    // Arrange
    CartItemDTO c1 = new CartItemDTO();
    c1.setAuthorName("author1");
    c1.setPromptPrice(10.0);

    CartItemDTO c2 = new CartItemDTO();
    c2.setAuthorName("author2");
    c2.setPromptPrice(20.0);

    UUID a1 = UUID.randomUUID();
    UUID a2 = UUID.randomUUID();

    when(userService.getUserByUsername("author1"))
        .thenReturn(
            new com.fiveOps.promptforge.user_profile.dto.UserDto() {
              {
                setUserId(a1);
              }
            });
    when(userService.getUserByUsername("author2"))
        .thenReturn(
            new com.fiveOps.promptforge.user_profile.dto.UserDto() {
              {
                setUserId(a2);
              }
            });

    when(bankDetailsService.getSubaccountCodeByUserID(a1)).thenReturn("sub1");
    when(bankDetailsService.getSubaccountCodeByUserID(a2)).thenReturn("sub2");

    PaymentService spyService = Mockito.spy(paymentService);
    doReturn(new TransactionInitializationResponse(3000, "test@example.com", "split_ref"))
        .when(spyService)
        .initializeSplitPayment(anyString(), anyList(), anyInt());

    // Act
    TransactionInitializationResponse result =
        spyService.initializePayment("test@example.com", List.of(c1, c2), 30.0);

    // Assert
    assertEquals("split_ref", result.getReference());
    verify(spyService).initializeSplitPayment(eq("test@example.com"), anyList(), eq(3000));
  }

  @Test
  void getBankList_ShouldReturnBanks_WhenStatusTrue() {
    // Arrange
    PaystackBankListResponseDTO dto =
        new PaystackBankListResponseDTO(true, "", List.of(new BankDTO("Bank SA", "001")));
    ResponseEntity<PaystackBankListResponseDTO> entity = new ResponseEntity<>(dto, HttpStatus.OK);

    when(restTemplate.getForEntity(anyString(), eq(PaystackBankListResponseDTO.class)))
        .thenReturn(entity);

    // Act
    List<BankDTO> result = paymentService.getBankList();

    // Assert
    assertEquals(1, result.size());
    assertEquals("Bank SA", result.get(0).getName());
  }

  @Test
  void getBankList_ShouldThrow_WhenStatusFalse() {
    // Arrange
    PaystackBankListResponseDTO dto = new PaystackBankListResponseDTO(false, "", null);
    dto.setStatus(false);
    ResponseEntity<PaystackBankListResponseDTO> entity = new ResponseEntity<>(dto, HttpStatus.OK);

    when(restTemplate.getForEntity(anyString(), eq(PaystackBankListResponseDTO.class)))
        .thenReturn(entity);

    // Act & Assert
    assertThrows(RuntimeException.class, () -> paymentService.getBankList());
  }

  @Test
  void inititalizeSingleAuthorPayment_ShouldThrow_WhenPaystackStatusFalse() {
    String responseJson = "{\"status\":false}";
    ResponseEntity<String> mockResponse = new ResponseEntity<>(responseJson, HttpStatus.OK);
    when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    assertThrows(
        RuntimeException.class,
        () ->
            paymentService.inititalizeSingleAuthorPayment(
                "a@b.com", "sub", UUID.randomUUID(), 1000));
  }

  @Test
  void initializePayment_ShouldThrow_WhenAmountIsZero() {
    assertThrows(
        Exception.class, () -> paymentService.initializePayment("a@b.com", List.of(), 0.0));
  }

  @Test
  void addSubaccount_ShouldReturnData_When201AndStatusTrue() throws Exception {
    PaystackAddSubaccountResponseDTO data = new PaystackAddSubaccountResponseDTO(true, "sub123");

    PaystackResponseDTO<PaystackAddSubaccountResponseDTO> response =
        new PaystackResponseDTO<>(true, "", data);

    ResponseEntity<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>> entity =
        new ResponseEntity<>(response, HttpStatusCode.valueOf(201));

    when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            ArgumentMatchers
                .<ParameterizedTypeReference<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>>>
                    any()))
        .thenReturn(entity);

    PayoutCardDTO card = new PayoutCardDTO("001", "Bank", "123456", "Holder");
    PaystackAddSubaccountResponseDTO result = paymentService.addSubaccount("user1", card);

    assertEquals("sub123", result.getSubaccountCode());
    assertTrue(result.getVerification());
  }

  @Test
  void addSubaccount_ShouldThrowValidationMessage_WhenHttp400() throws Exception {
    PaystackErrorResponseDTO<BankDTO> errorDto =
        new PaystackErrorResponseDTO<BankDTO>(false, "Invalid account", null, "", "");
    errorDto.setMessage("Invalid account");
    String jsonError = new ObjectMapper().writeValueAsString(errorDto);

    HttpClientErrorException ex =
        new HttpClientErrorException(
            HttpStatus.BAD_REQUEST, "Bad Request", jsonError.getBytes(), null);

    when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            ArgumentMatchers
                .<ParameterizedTypeReference<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>>>
                    any()))
        .thenThrow(ex);
    when(objectMapper.readValue(anyString(), eq(PaystackErrorResponseDTO.class)))
        .thenReturn(errorDto);

    assertThrows(
        RuntimeException.class,
        () -> paymentService.addSubaccount("user1", new PayoutCardDTO("001", "B", "123", "H")));
  }

  @Test
  void updateSubaccount_ShouldReturn_When200AndStatusTrue() throws Exception {
    PaystackAddSubaccountResponseDTO data = new PaystackAddSubaccountResponseDTO(true, "sub123");
    PaystackResponseDTO<PaystackAddSubaccountResponseDTO> response =
        new PaystackResponseDTO<>(true, "", data);

    ResponseEntity<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>> entity =
        new ResponseEntity<>(response, HttpStatus.OK);

    when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.PUT),
            any(HttpEntity.class),
            ArgumentMatchers
                .<ParameterizedTypeReference<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>>>
                    any()))
        .thenReturn(entity);

    paymentService.updateSubaccount(
        "sub123", "user1", new PayoutCardDTO("001", "Bank", "123456", "Holder"));
    verify(restTemplate)
        .exchange(
            contains("subaccount/sub123"),
            eq(HttpMethod.PUT),
            any(HttpEntity.class),
            any(ParameterizedTypeReference.class));
  }

  @Test
  void updateSubaccount_ShouldThrowValidationMessage_WhenHttp400() throws Exception {
    PaystackErrorResponseDTO errorDto =
        new PaystackErrorResponseDTO(false, "", null, "Bad bank code", "");
    errorDto.setMessage("Bad bank code");
    String jsonError = new ObjectMapper().writeValueAsString(errorDto);

    HttpClientErrorException ex =
        new HttpClientErrorException(
            HttpStatus.BAD_REQUEST, "Bad Request", jsonError.getBytes(), null);

    when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.PUT),
            any(HttpEntity.class),
            ArgumentMatchers
                .<ParameterizedTypeReference<PaystackResponseDTO<PaystackAddSubaccountResponseDTO>>>
                    any()))
        .thenThrow(ex);
    when(objectMapper.readValue(anyString(), eq(PaystackErrorResponseDTO.class)))
        .thenReturn(errorDto);

    assertThrows(
        RuntimeException.class,
        () ->
            paymentService.updateSubaccount(
                "sub123", "user1", new PayoutCardDTO("001", "B", "123", "H")));
  }
}
