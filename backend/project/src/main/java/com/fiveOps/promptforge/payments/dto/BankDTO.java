package com.fiveOps.promptforge.payments.dto;

public class BankDTO {
  private String bankName;
  private String bankCode;

  public BankDTO(String bankName, String bankCode) {
    this.bankName = bankName;
    this.bankCode = bankCode;
  }

  public String getCode() {
    return bankCode;
  }

  public String getName() {
    return bankName;
  }

  public void setCode(String bankCode) {
    this.bankCode = bankCode;
  }

  public void setName(String bankName) {
    this.bankName = bankName;
  }
  // Getters and setters...
}
