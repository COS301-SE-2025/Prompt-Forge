package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.cart.dto.CartItemResponse;

class CartItemResponseTest {
  @Test
  void testConstructorAndGetter() {
    CartItemResponse response = new CartItemResponse("Success");
    assertEquals("Success", response.getMessage());
  }

  @Test
  void testSetter() {
    CartItemResponse response = new CartItemResponse("Initial");
    response.setMessage("Updated");
    assertEquals("Updated", response.getMessage());
  }

  @Test
  void testNullAndEmpty() {
    CartItemResponse response = new CartItemResponse(null);
    assertNull(response.getMessage());
    response.setMessage("");
    assertEquals("", response.getMessage());
  }
}
