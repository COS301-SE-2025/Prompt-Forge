package com.fiveOps.promptforge.cart;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.cart.dto.CartItemDTO;

class CartItemDTOTest {
  @Test
  void testAllGettersAndSetters() {
    UUID cartItemId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    String username = "user";
    UUID promptId = UUID.randomUUID();
    String promptTitle = "Prompt Title";
    String[] promptTags = new String[] {"tag1", "tag2"};
    double promptPrice = 9.99;

    CartItemDTO dto = new CartItemDTO();
    dto.setCartItemId(cartItemId);
    dto.setUserId(userId);
    dto.setAuthorName(username);
    dto.setPromptId(promptId);
    dto.setPromptTitle(promptTitle);
    dto.setPromptTags(promptTags);
    dto.setPromptPrice(promptPrice);

    assertEquals(cartItemId, dto.getCartItemId());
    assertEquals(userId, dto.getUserId());
    assertEquals(username, dto.getAuthorName());
    assertEquals(promptId, dto.getPromptId());
    assertEquals(promptTitle, dto.getPromptTitle());
    assertArrayEquals(promptTags, dto.getPromptTags());
    assertEquals(promptPrice, dto.getPromptPrice());
  }

  @Test
  void testAllArgsConstructor() {
    UUID cartItemId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    String username = "user";
    UUID promptId = UUID.randomUUID();
    String promptTitle = "Prompt Title";
    String[] promptTags = new String[] {"tag1", "tag2"};
    double promptPrice = 9.99;

    CartItemDTO dto =
        new CartItemDTO(
            cartItemId, userId, username, promptId, promptTitle, promptTags, promptPrice);
    assertEquals(cartItemId, dto.getCartItemId());
    assertEquals(userId, dto.getUserId());
    assertEquals(username, dto.getAuthorName());
    assertEquals(promptId, dto.getPromptId());
    assertEquals(promptTitle, dto.getPromptTitle());
    assertArrayEquals(promptTags, dto.getPromptTags());
    assertEquals(promptPrice, dto.getPromptPrice());
  }

  @Test
  void testNullAndEmptyValues() {
    CartItemDTO dto = new CartItemDTO();
    dto.setPromptTags(null);
    assertNull(dto.getPromptTags());
    dto.setPromptTags(new String[] {});
    assertEquals(0, dto.getPromptTags().length);
  }
}
