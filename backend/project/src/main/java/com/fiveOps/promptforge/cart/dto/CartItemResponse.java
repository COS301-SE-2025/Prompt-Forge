package com.fiveOps.promptforge.cart.dto;

public class CartItemResponse {
  private String message;

  public CartItemResponse(String message) {
    this.message = message;
  }

  // Getters and setters
  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
