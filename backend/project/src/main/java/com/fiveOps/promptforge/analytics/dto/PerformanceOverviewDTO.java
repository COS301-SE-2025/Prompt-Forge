package com.fiveOps.promptforge.analytics.dto;

import java.time.LocalDateTime;

public class PerformanceOverviewDTO {
    private Long totalPrompts;
    private Double promptEngagementRate;
    private Double averageRating;
    private Double ratingChange;
    private String topPerformingPrompt;
    private Double engagementTrend;
    private LocalDateTime lastUpdated;

    public PerformanceOverviewDTO() {}

    public PerformanceOverviewDTO(Long totalPrompts, Double promptEngagementRate, 
                                 Double averageRating, Double ratingChange, 
                                 String topPerformingPrompt, Double engagementTrend) {
        this.totalPrompts = totalPrompts;
        this.promptEngagementRate = promptEngagementRate;
        this.averageRating = averageRating;
        this.ratingChange = ratingChange;
        this.topPerformingPrompt = topPerformingPrompt;
        this.engagementTrend = engagementTrend;
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and setters
    public Long getTotalPrompts() { return totalPrompts; }
    public void setTotalPrompts(Long totalPrompts) { this.totalPrompts = totalPrompts; }

    public Double getPromptEngagementRate() { return promptEngagementRate; }
    public void setPromptEngagementRate(Double promptEngagementRate) { 
        this.promptEngagementRate = promptEngagementRate; 
    }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Double getRatingChange() { return ratingChange; }
    public void setRatingChange(Double ratingChange) { this.ratingChange = ratingChange; }

    public String getTopPerformingPrompt() { return topPerformingPrompt; }
    public void setTopPerformingPrompt(String topPerformingPrompt) { 
        this.topPerformingPrompt = topPerformingPrompt; 
    }

    public Double getEngagementTrend() { return engagementTrend; }
    public void setEngagementTrend(Double engagementTrend) { this.engagementTrend = engagementTrend; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
