package com.fiveOps.promptforge.cart.dto;

import java.util.List;

public class CartCheckoutRequest {
  private List<CartItemDTO> prompts;
  private Double total;

  // Default constructor for JSON deserialization
  public CartCheckoutRequest() {}

  public List<CartItemDTO> getPrompts() {
    return prompts;
  }
  public Double getTotal() {
    return total;
  }
  public void setPrompts(List<CartItemDTO> prompts) {
    this.prompts = prompts;
  }

  public void setTotal(Double total) {
    this.total = total;
  }
}
