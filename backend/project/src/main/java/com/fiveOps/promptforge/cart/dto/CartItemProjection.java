package com.fiveOps.promptforge.cart.dto;

import java.util.UUID;

public interface CartItemProjection {
  UUID getCartItemId();

  UUID getUserId();

  String getAuthorName();

  UUID getPromptId();

  String getPromptTitle();

  String[] getPromptTags();

  Double getPromptPrice();

  String getAuthorUsername();
}
