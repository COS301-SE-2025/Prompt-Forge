package com.fiveOps.promptforge.cart.dto;


public class APIResponse {

  private String message;
  private String status;
  private Object data;

  public APIResponse(String status,String message) {
    this.status = status;
    this.message = message;
    this.data = null;
  }

  public APIResponse(String status,String message, Object data) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  // Getters and setters
  public String getStatus() {
    return status;
  }

  public Object getData() {
    return data;
  }

  public String getMessage() {
      return message;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public void setData(Object data) {
      this.data = data;
  }

  public void setMessage(String message) {
      this.message = message;
  }
}
