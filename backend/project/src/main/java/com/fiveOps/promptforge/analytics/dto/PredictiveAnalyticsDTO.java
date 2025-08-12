package com.fiveOps.promptforge.analytics.dto;

import java.time.LocalDateTime;

public class PredictiveAnalyticsDTO {
    private Double predictedEngagement;
    private Double engagementTrend;
    private Double successProbability;
    private String trendDirection; // "increasing", "decreasing", "stable"
    private LocalDateTime forecastDate;
    private Double confidence;

    public PredictiveAnalyticsDTO() {}

    public PredictiveAnalyticsDTO(Double predictedEngagement, Double engagementTrend,
                                 Double successProbability, String trendDirection,
                                 LocalDateTime forecastDate, Double confidence) {
        this.predictedEngagement = predictedEngagement;
        this.engagementTrend = engagementTrend;
        this.successProbability = successProbability;
        this.trendDirection = trendDirection;
        this.forecastDate = forecastDate;
        this.confidence = confidence;
    }

    // Getters and setters
    public Double getPredictedEngagement() { return predictedEngagement; }
    public void setPredictedEngagement(Double predictedEngagement) { 
        this.predictedEngagement = predictedEngagement; 
    }

    public Double getEngagementTrend() { return engagementTrend; }
    public void setEngagementTrend(Double engagementTrend) { this.engagementTrend = engagementTrend; }

    public Double getSuccessProbability() { return successProbability; }
    public void setSuccessProbability(Double successProbability) { 
        this.successProbability = successProbability; 
    }

    public String getTrendDirection() { return trendDirection; }
    public void setTrendDirection(String trendDirection) { this.trendDirection = trendDirection; }

    public LocalDateTime getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDateTime forecastDate) { this.forecastDate = forecastDate; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}
