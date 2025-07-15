package com.fiveOps.promptforge.cart.dto;

import java.util.List;

public class CartCheckoutRequest {
  private List<CartItemDTO> prompts;
  private String transactionID;

  // Default constructor for JSON deserialization
  public CartCheckoutRequest() {}

  public List<CartItemDTO> getPrompts() {
    return prompts;
  }
  
  public String getTransactionID() {
      return transactionID;
  }

  public void setPrompts(List<CartItemDTO> prompts) {
    this.prompts = prompts;
  }

  public void setTransactionID(String transactionID) {
    this.transactionID = transactionID;
  }
}
