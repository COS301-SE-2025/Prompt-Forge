package com.fiveOps.promptforge.payments.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaystackAddSubaccountResponseDTO {
  @JsonProperty("is_verified")
  private Boolean isVerified;
  
  @JsonProperty("subaccount_code")
  private String subaccountCode;

  public PaystackAddSubaccountResponseDTO(Boolean isVerified, String subaccountCode) {
    this.isVerified = isVerified;
    this.subaccountCode = subaccountCode;
  }

  public Boolean getVerification() {
    return isVerified;
  }

  public void setIsVerified(Boolean isVerified) {
    this.isVerified = isVerified;
  }

  public String getSubaccountCode() {
    return subaccountCode;
  }

  public void setSubaccountCode(String subaccountCode) {
    this.subaccountCode = subaccountCode;
  }
}
