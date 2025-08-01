package com.fiveOps.promptforge.payments.dto;

public class PayoutCardDTO {
  protected BankDTO bank;
  protected String accountNumber;
  protected String accountHolder;

  public PayoutCardDTO(
      String bankCode, String bankName, String accountNumber, String accountHolder) {
    bank = new BankDTO(bankName, bankCode);
    this.accountNumber = accountNumber;
    this.accountHolder = accountHolder;
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public String getAccountHolder() {
    return accountHolder;
  }

  public BankDTO getBank() {
    return this.bank;
  }

  public void setBank(BankDTO bank) {
    this.bank = bank;
  }

  public void setAccountNumber(String accountNumber) {
    this.accountNumber = accountNumber;
  }

  public void setAccountHolderName(String accountHolder) {
    this.accountHolder = accountHolder;
  }
}
