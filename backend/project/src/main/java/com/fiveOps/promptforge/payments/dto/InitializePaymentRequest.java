package com.fiveOps.promptforge.payments.dto;

import java.util.List;

import com.fiveOps.promptforge.cart.dto.CartItemDTO;

public class InitializePaymentRequest {
  private List<CartItemDTO> prompts;
  private Double total;

  // Default constructor for JSON deserialization
  public InitializePaymentRequest() {}

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
