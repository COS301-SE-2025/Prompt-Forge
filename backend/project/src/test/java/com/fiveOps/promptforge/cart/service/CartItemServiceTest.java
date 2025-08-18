package com.fiveOps.promptforge.cart.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.dto.CartItemProjection;
import com.fiveOps.promptforge.cart.model.CartItem;
import com.fiveOps.promptforge.cart.repository.CartItemRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import com.fiveOps.promptforge.user_profile.service.UserService;

@ExtendWith(MockitoExtension.class)
class CartItemServiceTest {
  @Mock private CartItemRepository cartItemRepository;
  @Mock private UserRepository userRepository;
  @Mock private PromptRepository promptRepository;
  @Mock private PromptStoreService promptStoreService;
  @Mock private UserService userService;
  @InjectMocks private CartItemService service;

  private UUID userId;
  private UUID promptId;
  private User user;
  private Prompt prompt;
  private CartItem cartItem;
  private Pageable pageable;

  @BeforeEach
  void setUp() {
    userId = UUID.randomUUID();
    promptId = UUID.randomUUID();
    user = mock(User.class);
    prompt = mock(Prompt.class);
    cartItem = new CartItem();
    pageable = mock(Pageable.class);
  }

  @Test
  void getCartItemsForUser_ShouldReturnPage() {
    Page<CartItemProjection> page = mock(Page.class);
    when(cartItemRepository.findCartItemsWithTagsByUserId(userId, pageable)).thenReturn(page);
    Page<CartItemProjection> result = service.getCartItemsForUser(userId, pageable);
    assertNotNull(result);
  }

  @Test
  void addItemToCart_ShouldAddSuccessfully() {
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
    when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);
    CartItem result = service.addItemToCart(userId, promptId);
    assertNotNull(result);
  }

  @Test
  void addItemToCart_ShouldThrowIfUserNotFound() {
    when(userRepository.findById(userId)).thenReturn(Optional.empty());
    assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
  }

  @Test
  void addItemToCart_ShouldThrowIfPromptNotFound() {
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(promptRepository.findById(promptId)).thenReturn(Optional.empty());
    assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
  }

  @Test
  void addItemToCart_ShouldThrowIfAlreadyAdded() {
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
    when(cartItemRepository.save(any(CartItem.class)))
        .thenThrow(new DataIntegrityViolationException("already added"));
    assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
  }

  @Test
  void addItemToCart_ShouldThrowOnOtherException() {
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
    when(cartItemRepository.save(any(CartItem.class))).thenThrow(new RuntimeException("fail"));
    assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
  }

  @Test
  void removeItemFromCart_ShouldCallRepository() {
    doNothing().when(cartItemRepository).deleteByUserIdAndPromptId(userId, promptId);
    assertDoesNotThrow(() -> service.removeItemFromCart(userId, promptId));
  }

  @Test
  void isPromptAddedToCart_ShouldReturnFalse() {
    when(cartItemRepository.findByUserIdAndPromptId(userId, promptId))
        .thenReturn(Collections.emptyList());
    assertFalse(service.isPromptAddedToCart(userId, promptId));
  }

  @Test
  void isPromptAddedToCart_ShouldReturnTrue() {
    List<Object[]> mockResult = Collections.singletonList(new Object[]{"mock-id"});
    when(cartItemRepository.findByUserIdAndPromptId(userId, promptId))
        .thenReturn(mockResult);
    assertTrue(service.isPromptAddedToCart(userId, promptId));
  }

  @Test
  void purchase_ShouldSuccessfullyPurchaseAndClearCart() throws Exception {
    String email = "test@example.com";
    CartItemDTO dto = mock(CartItemDTO.class);
    when(dto.getPromptId()).thenReturn(promptId);
    List<CartItemDTO> prompts = Collections.singletonList(dto);
    
    when(userService.getUserIdByEmail(email)).thenReturn(userId);
    when(promptStoreService.purchasePrompt(promptId, userId)).thenReturn(mock(PromptPurchase.class));
    doNothing().when(cartItemRepository).deletebyUserID(userId);

    assertDoesNotThrow(() -> service.purchase(email, prompts));
    
    verify(promptStoreService).purchasePrompt(promptId, userId);
    verify(cartItemRepository).deletebyUserID(userId);
  }

  @Test
  void purchase_ShouldThrowWhenUserNotFound() {
    String email = "nonexistent@example.com";
    List<CartItemDTO> prompts = Collections.singletonList(mock(CartItemDTO.class));
    
    when(userService.getUserIdByEmail(email))
        .thenThrow(new RuntimeException("User not found"));

    assertThrows(RuntimeException.class, () -> service.purchase(email, prompts));
  }

  @Test
  void purchase_ShouldThrowWhenPurchaseFails() throws Exception {
    String email = "test@example.com";
    CartItemDTO dto = mock(CartItemDTO.class);
    when(dto.getPromptId()).thenReturn(promptId);
    List<CartItemDTO> prompts = Collections.singletonList(dto);
    
    when(userService.getUserIdByEmail(email)).thenReturn(userId);
    when(promptStoreService.purchasePrompt(promptId, userId))
        .thenThrow(new RuntimeException("Purchase failed"));

    Exception exception = assertThrows(RuntimeException.class, () -> service.purchase(email, prompts));
    assertEquals("Purchase failed", exception.getMessage());
  }
}
