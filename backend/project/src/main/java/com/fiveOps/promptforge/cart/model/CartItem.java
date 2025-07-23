package com.fiveOps.promptforge.cart.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.user_profile.model.User;

@Entity
@Table(name = "cart_items")
public class CartItem {
  @Id @GeneratedValue private UUID id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "prompt_id", nullable = false)
  private Prompt prompt;

  public CartItem() {}

  public void setUser(User user) {
    this.user = user;
  }

  public void setPrompt(Prompt prompt) {
    this.prompt = prompt;
  }
}
