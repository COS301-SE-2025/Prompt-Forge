package com.fiveOps.promptforge.cart.dto;

import java.util.List;

public class CartCheckoutRequest {
    private List<CartItemDTO> prompts;

    // Default constructor for JSON deserialization
    public CartCheckoutRequest() {
    }

    public List<CartItemDTO> getPrompts() {
        return prompts;
    }

    public void setPrompts(List<CartItemDTO> prompts) {
        this.prompts = prompts;
    }
}
