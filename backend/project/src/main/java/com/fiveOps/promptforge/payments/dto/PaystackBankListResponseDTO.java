package com.fiveOps.promptforge.payments.dto;

import java.util.List;

public class PaystackBankListResponseDTO {
  private Boolean status;
  private String message;
  private List<BankDTO> data;

  public PaystackBankListResponseDTO(Boolean status, String message, List<BankDTO> data) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  public Boolean getStatus() {
    return status;
  }

  public String getMessage() {
    return message;
  }

  public List<BankDTO> getData() {
    return data;
  }

  public void setStatus(Boolean status) {
    this.status = status;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public void setData(List<BankDTO> data) {
    this.data = data;
  }
}
