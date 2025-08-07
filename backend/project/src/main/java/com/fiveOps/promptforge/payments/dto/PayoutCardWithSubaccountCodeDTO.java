package com.fiveOps.promptforge.payments.dto;

public class PayoutCardWithSubaccountCodeDTO extends PayoutCardDTO {

  private String paystackSubaccountCode;

  public PayoutCardWithSubaccountCodeDTO(
      String bankCode,
      String bankName,
      String accountNumber,
      String accountHolder,
      String paystackSubaccountCode) {
    super(bankCode, bankName, accountNumber, accountHolder);
    this.paystackSubaccountCode = paystackSubaccountCode;
  }

  public String getPaystackSubaccountCode() {
    return paystackSubaccountCode;
  }

  public void setSubaccountCode(String paystackSubaccountCode) {
    this.paystackSubaccountCode = paystackSubaccountCode;
  }
}