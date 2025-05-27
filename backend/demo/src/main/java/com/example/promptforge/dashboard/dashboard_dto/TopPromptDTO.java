// src/main/java/com/example/promptforge/dashboard_dto/TopPromptDTO.java
package com.example.promptforge.dashboard.dashboard_dto;

public class TopPromptDTO {
    private String title;
    private Integer usageCount;
    private Double averageRating;

    // Constructors, Getters and Setters
    public TopPromptDTO() {}
    
    public TopPromptDTO(String title, Integer usageCount, Double averageRating) {
        this.title = title;
        this.usageCount = usageCount;
        this.averageRating = averageRating;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}