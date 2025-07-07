package com.fiveOps.promptforge.cart.dto;

import java.util.List;
import java.util.UUID;

public class CartItemRequest {
  private UUID promptId;
  private List<CartItemDTO> prompts;

  // Getters and setters
  public UUID getPromptId() {
    return promptId;
  }

  public List<CartItemDTO> getPrompts() {
    return prompts;
  }
}
