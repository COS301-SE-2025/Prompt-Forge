// src/main/java/com/example/promptforge/dashboard_dto/MonthlyUsageDTO.java
package com.example.promptforge.dashboard.dashboard_dto;


public class MonthlyUsageDTO {
    private String month;
    private Long usageCount;

    // Constructors, Getters and Setters
    public MonthlyUsageDTO() {}
    
    public MonthlyUsageDTO(String month, Long usageCount) {
        this.month = month;
        this.usageCount = usageCount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Long getUsageCount() { return usageCount; }
    public void setUsageCount(Long usageCount) { this.usageCount = usageCount; }
}