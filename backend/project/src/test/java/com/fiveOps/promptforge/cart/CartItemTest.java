package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.cart.model.CartItem;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.user_profile.model.User;

class CartItemTest {
  @Test
  void testSettersAndNulls() {
    CartItem cartItem = new CartItem();
    User user = new User();
    Prompt prompt = new Prompt();
    cartItem.setUser(user);
    cartItem.setPrompt(prompt);
    assertNotNull(cartItem);
    cartItem.setUser(null);
    cartItem.setPrompt(null);
    assertNotNull(cartItem); // Should not throw
  }
}
