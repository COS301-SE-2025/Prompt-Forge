package com.fiveOps.promptforge.analytics.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class PromptAnalyticsDTO {
    private Map<String, Integer> performanceHeatmap; // day/hour -> engagement count
    private Map<String, Double> categoryPerformance;
    private Map<LocalDateTime, Double> promptEvolution;
    private Double averageSessionDuration;
    private Double bounceRate;
    private Map<String, Long> interactionFunnel; // views, ratings, shares

    public PromptAnalyticsDTO() {}

    public PromptAnalyticsDTO(Map<String, Integer> performanceHeatmap,
                             Map<String, Double> categoryPerformance,
                             Map<LocalDateTime, Double> promptEvolution,
                             Double averageSessionDuration,
                             Double bounceRate,
                             Map<String, Long> interactionFunnel) {
        this.performanceHeatmap = performanceHeatmap;
        this.categoryPerformance = categoryPerformance;
        this.promptEvolution = promptEvolution;
        this.averageSessionDuration = averageSessionDuration;
        this.bounceRate = bounceRate;
        this.interactionFunnel = interactionFunnel;
    }

    // Getters and setters
    public Map<String, Integer> getPerformanceHeatmap() { return performanceHeatmap; }
    public void setPerformanceHeatmap(Map<String, Integer> performanceHeatmap) { 
        this.performanceHeatmap = performanceHeatmap; 
    }

    public Map<String, Double> getCategoryPerformance() { return categoryPerformance; }
    public void setCategoryPerformance(Map<String, Double> categoryPerformance) { 
        this.categoryPerformance = categoryPerformance; 
    }

    public Map<LocalDateTime, Double> getPromptEvolution() { return promptEvolution; }
    public void setPromptEvolution(Map<LocalDateTime, Double> promptEvolution) { 
        this.promptEvolution = promptEvolution; 
    }

    public Double getAverageSessionDuration() { return averageSessionDuration; }
    public void setAverageSessionDuration(Double averageSessionDuration) { 
        this.averageSessionDuration = averageSessionDuration; 
    }

    public Double getBounceRate() { return bounceRate; }
    public void setBounceRate(Double bounceRate) { this.bounceRate = bounceRate; }

    public Map<String, Long> getInteractionFunnel() { return interactionFunnel; }
    public void setInteractionFunnel(Map<String, Long> interactionFunnel) { 
        this.interactionFunnel = interactionFunnel; 
    }
}
