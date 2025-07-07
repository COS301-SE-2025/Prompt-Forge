package com.fiveOps.promptforge.cart.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.cart.dto.CartCheckoutRequest;
import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.dto.CartItemRequest;
import com.fiveOps.promptforge.cart.dto.CartItemResponse;
import com.fiveOps.promptforge.cart.service.CartItemService;
import com.fiveOps.promptforge.user_profile.service.UserService;

@RestController
@RequestMapping("/api/cart")
public class CartItemController {

  private final CartItemService cartItemService;
  private final UserService userService;

  public CartItemController(CartItemService cartItemService, UserService userService) {
    this.cartItemService = cartItemService;
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<Page<CartItemDTO>> getCartItems(
      @PageableDefault(size = 10) Pageable pageable, Authentication authentication) {
    System.out.println("getname" + authentication.getName());
    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);
    Page<CartItemDTO> cartItems = cartItemService.getCartItemsForUser(userId, pageable);
    return ResponseEntity.ok(cartItems);
  }

  @PostMapping("/add")
  public ResponseEntity<CartItemResponse> addItemToCart(
      @RequestBody CartItemRequest request, Authentication authentication) {

    try {
      String userEmail = authentication.getName();
      UUID userId = userService.getUserIdByEmail(userEmail);
      cartItemService.addItemToCart(userId, request.getPromptId());

      return ResponseEntity.ok(new CartItemResponse("Prompt added to cart."));
    } catch (Exception e) {
      if (e.getMessage().contains("already been added")) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new CartItemResponse("Prompt added to cart."));
      }
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new CartItemResponse("Failed to add item to cart."));
    }
  }

  @DeleteMapping("/remove/{promptId}")
  public ResponseEntity<CartItemResponse> removeItemFromCart(
      @PathVariable UUID promptId, Authentication authentication) {

    try {
      String userEmail = authentication.getName();
      UUID userId = userService.getUserIdByEmail(userEmail);
      cartItemService.removeItemFromCart(userId, promptId);
      return ResponseEntity.ok(new CartItemResponse("Item removed from cart."));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new CartItemResponse("Failed to add item to cart."));
    }
  }

  @GetMapping("/added/{promptId}")
  public ResponseEntity<Boolean> isPromptAddedToCart(
      @PathVariable UUID promptId, Authentication authentication) {
    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);
    return ResponseEntity.ok(cartItemService.isPromptAddedToCart(userId, promptId));
  }

  @PostMapping("/checkout")
  public ResponseEntity<CartItemResponse> checkoutCart(
      @RequestBody CartCheckoutRequest request, Authentication authentication) {
    try {
      String userEmail = authentication.getName();
      UUID userId = userService.getUserIdByEmail(userEmail);
      List<CartItemDTO> prompts = request.getPrompts();
      cartItemService.checkout(userId, prompts);
      String promptString = (prompts.size() > 1) ? "Prompts" : "Prompt";
      return ResponseEntity.ok(new CartItemResponse(promptString + " purchased successfully."));
    } catch (Exception e) {
      System.err.println("Checkout error: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(new CartItemResponse("Checkout failed: " + e.getMessage()));
    }
  }
}
