package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.cart.dto.APIResponse;

class CartItemResponseTest {
  @Test
  void testConstructorAndGetter() {
    APIResponse response = new APIResponse("Success", "Testing");
    assertEquals("Testing", response.getMessage());
    assertEquals("Success", response.getStatus());
  }

  @Test
  void testSetter() {
    APIResponse response = new APIResponse("Initial", "Testing");
    response.setMessage("Updated");
    assertEquals("Updated", response.getMessage());
    assertEquals("Initial", response.getStatus());
  }

  @Test
  void testNullAndEmpty() {
    APIResponse response = new APIResponse(null, null);
    assertNull(response.getMessage());
    response.setMessage("");
    assertEquals("", response.getMessage());
    assertEquals(null, response.getData());
  }
}
