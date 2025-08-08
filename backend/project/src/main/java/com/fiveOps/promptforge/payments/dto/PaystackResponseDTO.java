package com.fiveOps.promptforge.payments.dto;

public class PaystackResponseDTO<T> {
  protected Boolean status;
  protected String message;
  protected T data;

  public PaystackResponseDTO(Boolean status, String message, T data) {
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

  public T getData() {
    return data;
  }

  public void setStatus(Boolean status) {
    this.status = status;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public void setData(T data) {
    this.data = data;
  }
}
