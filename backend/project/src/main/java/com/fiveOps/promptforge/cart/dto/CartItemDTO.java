package com.fiveOps.promptforge.cart.dto;

import java.util.UUID;

public class CartItemDTO {
  private UUID cartItemId;
  private UUID userId;
  private String authorName;
  private UUID promptId;
  private String promptTitle;
  private String[] promptTags;
  private double promptPrice;

  // Constructor
  public CartItemDTO(
      UUID cartItemId,
      UUID userId,
      String authorName,
      UUID promptId,
      String promptTitle,
      String[] promptTags,
      double promptPrice) {
    this.cartItemId = cartItemId;
    this.userId = userId;
    this.authorName = authorName;
    this.promptId = promptId;
    this.promptTitle = promptTitle;
    this.promptTags = promptTags;
    this.promptPrice = promptPrice;
  }

  // Default constructor for JSON deserialization
  public CartItemDTO() {}

  public UUID getCartItemId() {
    return cartItemId;
  }

  public void setCartItemId(UUID cartItemId) {
    this.cartItemId = cartItemId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public String getAuthorName() {
    return authorName;
  }

  public void setAuthorName(String authorName) {
    this.authorName = authorName;
  }

  public UUID getPromptId() {
    return promptId;
  }

  public void setPromptId(UUID promptId) {
    this.promptId = promptId;
  }

  public String getPromptTitle() {
    return promptTitle;
  }

  public void setPromptTitle(String promptTitle) {
    this.promptTitle = promptTitle;
  }

  public String[] getPromptTags() {
    return promptTags;
  }

  public void setPromptTags(String[] promptTags) {
    this.promptTags = promptTags;
  }

  public double getPromptPrice() {
    return promptPrice;
  }

  public void setPromptPrice(double promptPrice) {
    this.promptPrice = promptPrice;
  }
}
