package com.fiveOps.promptforge.payments.dto;

public class PaystackErrorResponseDTO<T> extends PaystackResponseDTO<T> {
    private String type;
    private String code;

    public PaystackErrorResponseDTO(
            Boolean status, String message, T data, String type, String code) {
        super(status, message, data);
        this.type = type;
        this.code = code;
    }

    // Getters and Setters
    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}