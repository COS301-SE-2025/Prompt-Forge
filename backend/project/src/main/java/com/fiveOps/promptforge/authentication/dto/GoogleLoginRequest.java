package com.fiveOps.promptforge.authentication.dto;

public class GoogleLoginRequest {
    private String token;

    public GoogleLoginRequest() {}

    public GoogleLoginRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
