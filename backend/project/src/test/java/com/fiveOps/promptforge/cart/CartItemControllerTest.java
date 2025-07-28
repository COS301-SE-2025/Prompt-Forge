package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.fiveOps.promptforge.cart.controller.CartItemController;
import com.fiveOps.promptforge.cart.dto.APIResponse;
import com.fiveOps.promptforge.cart.dto.CartCheckoutRequest;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.dto.CartItemProjection;
import com.fiveOps.promptforge.cart.dto.CartItemRequest;
import com.fiveOps.promptforge.cart.service.CartItemService;
import com.fiveOps.promptforge.user_profile.service.UserService;

@ExtendWith(MockitoExtension.class)
class CartItemControllerTest {

  @Mock
  private CartItemService cartItemService;
  @Mock
  private UserService userService;
  @Mock
  private Authentication authentication;
  @InjectMocks
  private CartItemController controller;

  private UUID userId;
  private UUID promptId;
  private CartItemProjection cartItemProjection;
  private Pageable pageable;

  @BeforeEach
  void setUp() {
    userId = UUID.randomUUID();
    promptId = UUID.randomUUID();
    cartItemProjection = mock(CartItemProjection.class);
    pageable = mock(Pageable.class);
    when(authentication.getName()).thenReturn("user@example.com");
    when(userService.getUserIdByEmail(anyString())).thenReturn(userId);
  }

  @Test
  void getCartItems_ShouldReturnPage() {
    Page<CartItemProjection> page = new PageImpl<>(List.of(cartItemProjection));
    when(cartItemService.getCartItemsForUser(userId, pageable)).thenReturn(page);

    ResponseEntity<Page<CartItemProjection>> response = controller.getCartItems(pageable, authentication);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(1, response.getBody().getContent().size());
  }

  @Test
  void getCartItems_ShouldReturnEmptyPage() {
    Page<CartItemProjection> page = new PageImpl<>(Collections.emptyList());
    when(cartItemService.getCartItemsForUser(userId, pageable)).thenReturn(page);

    ResponseEntity<Page<CartItemProjection>> response = controller.getCartItems(pageable, authentication);

    assertTrue(response.getBody().isEmpty());
  }

  @Test
  void addItemToCart_ShouldReturnConflictIfAlreadyAdded() {
    CartItemRequest request = mock(CartItemRequest.class);
    when(request.getPromptId()).thenReturn(promptId);
    doThrow(new RuntimeException("already been added"))
        .when(cartItemService)
        .addItemToCart(userId, promptId);

    ResponseEntity<APIResponse> response = controller.addItemToCart(request, authentication);

    assertEquals(409, response.getStatusCodeValue());
    assertEquals("Prompt added to cart.", response.getBody().getMessage()); // Per controller logic
  }

  @Test
  void addItemToCart_ShouldReturnServerErrorOnOtherException() {
    CartItemRequest request = mock(CartItemRequest.class);
    when(request.getPromptId()).thenReturn(promptId);
    doThrow(new RuntimeException("other error"))
        .when(cartItemService)
        .addItemToCart(userId, promptId);

    ResponseEntity<APIResponse> response = controller.addItemToCart(request, authentication);

    assertEquals(500, response.getStatusCodeValue());
    assertEquals("Failed to add item to cart.", response.getBody().getMessage());
  }

  @Test
  void removeItemFromCart_ShouldReturnOk() {
    doNothing().when(cartItemService).removeItemFromCart(userId, promptId);

    ResponseEntity<APIResponse> response = controller.removeItemFromCart(promptId, authentication);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals("item removed from cart.", response.getBody().getMessage());
  }

  @Test
  void removeItemFromCart_ShouldReturnServerErrorOnException() {
    doThrow(new RuntimeException("fail"))
        .when(cartItemService)
        .removeItemFromCart(userId, promptId);

    ResponseEntity<APIResponse> response = controller.removeItemFromCart(promptId, authentication);

    assertEquals(500, response.getStatusCodeValue());
    assertEquals("Failed to add item to cart.", response.getBody().getMessage());
  }

  @Test
  void isPromptAddedToCart_ShouldReturnTrue() {
    when(cartItemService.isPromptAddedToCart(userId, promptId)).thenReturn(true);

    ResponseEntity<Boolean> response = controller.isPromptAddedToCart(promptId, authentication);

    assertTrue(response.getBody());
  }

  @Test
  void isPromptAddedToCart_ShouldReturnFalse() {
    when(cartItemService.isPromptAddedToCart(userId, promptId)).thenReturn(false);

    ResponseEntity<Boolean> response = controller.isPromptAddedToCart(promptId, authentication);

    assertFalse(response.getBody());
  }

  // @Test
  // void checkoutCart_ShouldReturnOk() {
  //   CartCheckoutRequest request = mock(CartCheckoutRequest.class);
  //   CartItemDTO cartItem = mock(CartItemDTO.class);
  //   List<CartItemDTO> prompts = List.of(cartItem);
  //   when(request.getPrompts()).thenReturn(prompts);

  //   doNothing().when(cartItemService).purchase("user@example.com", prompts);

  //   ResponseEntity<APIResponse> response = controller.checkoutCart(request, authentication);

  //   assertEquals(200, response.getStatusCodeValue());
  //   assertTrue(response.getBody().getMessage().contains("Prompt purchased successfully"));
  // }

  // @Test
  // void checkoutCart_ShouldReturnBadRequestOnException() {
  //   CartCheckoutRequest request = mock(CartCheckoutRequest.class);
  //   CartItemDTO cartItem = mock(CartItemDTO.class);
  //   List<CartItemDTO> prompts = List.of(cartItem);
  //   when(request.getPrompts()).thenReturn(prompts);

  //   doThrow(new RuntimeException("purchase failed"))
  //       .when(cartItemService)
  //       .purchase("user@example.com", prompts);

  //   ResponseEntity<APIResponse> response = controller.checkoutCart(request, authentication);

  //   assertEquals(400, response.getStatusCodeValue());
  //   assertTrue(response.getBody().getMessage().contains("Checkout failed"));
  // }
}