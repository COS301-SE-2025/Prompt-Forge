package com.fiveOps.promptforge.payments.dto;

public class TransactionInitializationResponse {
  private int amount;
  private String customerEmail;
  private String reference;

  // Default constructor for JSON deserialization

  public TransactionInitializationResponse(int amount, String customerEmail, String reference) {
    this.amount = amount;
    this.customerEmail = customerEmail;
    this.reference = reference;
  }

  public int getAmount() {
    return amount;
  }

  public String getCustomerEmail() {
    return customerEmail;
  }

  public String getReference() {
    return reference;
  }

  public void setAmount(int amount) {
    this.amount = amount;
  }

  public void setCustomerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
  }

  public void setReference(String reference) {
    this.reference = reference;
  }
}
