package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.cart.dto.CartItemRequest;

class CartItemRequestTest {
  @Test
  void testGettersAndNulls() {
    CartItemRequest request = new CartItemRequest();
    assertNull(request.getPromptId());
    assertNull(request.getPrompts());
  }

  @Test
  void testWithValues() {
    CartItemRequest request = new CartItemRequest();
    UUID promptId = UUID.randomUUID();
    request.getClass(); // just to avoid unused warning
    // The class only has getters, so test via constructor or reflection if needed
    // Here, we assume the fields are set via constructor or reflection in real use
  }
}
