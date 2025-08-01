package com.fiveOps.promptforge.payments.dto;

public class PaystackAddSubaccountResponseDTO {
  private Boolean is_verified;
  private String subaccount_code;

  public PaystackAddSubaccountResponseDTO(Boolean is_verified, String subaccount_code) {
    this.is_verified = is_verified;
    this.subaccount_code = subaccount_code;
  }

  public Boolean getVerification() {
    return is_verified;
  }

  public void setIs_Verified(Boolean is_verified) {
    this.is_verified = is_verified;
  }

  public String getSubaccount_code() {
    return subaccount_code;
  }

  public void setSubaccount_code(String subaccount_code) {
    this.subaccount_code = subaccount_code;
  }

}
