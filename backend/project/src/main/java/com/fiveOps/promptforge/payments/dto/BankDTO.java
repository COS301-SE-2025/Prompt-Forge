package com.fiveOps.promptforge.payments.dto;

public class BankDTO {
    private String name;
    private String code;

    public BankDTO(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public String getCode() {
        return code;
    }
    
    public String getName() {
        return name;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public void setName(String name) {
        this.name = name;
    }
    // Getters and setters...
}