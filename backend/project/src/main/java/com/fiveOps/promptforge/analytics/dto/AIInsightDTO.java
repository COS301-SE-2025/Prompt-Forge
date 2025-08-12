package com.fiveOps.promptforge.analytics.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AIInsightDTO {
    private String insightText;
    private String category; // "performance", "trend", "recommendation"
    private Double confidence;
    private LocalDateTime generatedAt;
    private List<String> supportingData;
    private String actionRecommendation;

    public AIInsightDTO() {}

    public AIInsightDTO(String insightText, String category, Double confidence,
                       List<String> supportingData, String actionRecommendation) {
        this.insightText = insightText;
        this.category = category;
        this.confidence = confidence;
        this.generatedAt = LocalDateTime.now();
        this.supportingData = supportingData;
        this.actionRecommendation = actionRecommendation;
    }

    // Getters and setters
    public String getInsightText() { return insightText; }
    public void setInsightText(String insightText) { this.insightText = insightText; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public List<String> getSupportingData() { return supportingData; }
    public void setSupportingData(List<String> supportingData) { this.supportingData = supportingData; }

    public String getActionRecommendation() { return actionRecommendation; }
    public void setActionRecommendation(String actionRecommendation) { 
        this.actionRecommendation = actionRecommendation; 
    }
}
