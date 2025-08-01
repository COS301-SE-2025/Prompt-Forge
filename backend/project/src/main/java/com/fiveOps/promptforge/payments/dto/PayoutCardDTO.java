package com.fiveOps.promptforge.payments.dto;

public class PayoutCardDTO {
  private BankDTO bank;
  private String accountNumber;
  private String cardHolderName;

  public String getBankCode() {
    return bank.getCode();
  }

  public String getBankName() {
    return bank.getName();
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public String getCardHolderName() {
    return cardHolderName;
  }

  public void setBank(BankDTO bank) {
    this.bank = bank;
  }

  public void setAccountNumber(String accountNumber) {
    this.accountNumber = accountNumber;
  }

  public void setCardHolderName(String cardHolderName) {
    this.cardHolderName = cardHolderName;
  }
}
