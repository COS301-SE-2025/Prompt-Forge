package com.fiveOps.promptforge.analytics.dto;

import java.util.Map;

public class TechnicalPerformanceDTO {
    private Double averageApiResponseTime;
    private Map<String, Double> modelPerformance; // model -> accuracy score
    private Double errorRate;
    private Long totalApiCalls;
    private Long successfulCalls;
    private Long failedCalls;
    private Map<String, Long> errorBreakdown; // error type -> count

    public TechnicalPerformanceDTO() {}

    public TechnicalPerformanceDTO(Double averageApiResponseTime,
                                  Map<String, Double> modelPerformance,
                                  Double errorRate,
                                  Long totalApiCalls,
                                  Long successfulCalls,
                                  Long failedCalls,
                                  Map<String, Long> errorBreakdown) {
        this.averageApiResponseTime = averageApiResponseTime;
        this.modelPerformance = modelPerformance;
        this.errorRate = errorRate;
        this.totalApiCalls = totalApiCalls;
        this.successfulCalls = successfulCalls;
        this.failedCalls = failedCalls;
        this.errorBreakdown = errorBreakdown;
    }

    // Getters and setters
    public Double getAverageApiResponseTime() { return averageApiResponseTime; }
    public void setAverageApiResponseTime(Double averageApiResponseTime) { 
        this.averageApiResponseTime = averageApiResponseTime; 
    }

    public Map<String, Double> getModelPerformance() { return modelPerformance; }
    public void setModelPerformance(Map<String, Double> modelPerformance) { 
        this.modelPerformance = modelPerformance; 
    }

    public Double getErrorRate() { return errorRate; }
    public void setErrorRate(Double errorRate) { this.errorRate = errorRate; }

    public Long getTotalApiCalls() { return totalApiCalls; }
    public void setTotalApiCalls(Long totalApiCalls) { this.totalApiCalls = totalApiCalls; }

    public Long getSuccessfulCalls() { return successfulCalls; }
    public void setSuccessfulCalls(Long successfulCalls) { this.successfulCalls = successfulCalls; }

    public Long getFailedCalls() { return failedCalls; }
    public void setFailedCalls(Long failedCalls) { this.failedCalls = failedCalls; }

    public Map<String, Long> getErrorBreakdown() { return errorBreakdown; }
    public void setErrorBreakdown(Map<String, Long> errorBreakdown) { 
        this.errorBreakdown = errorBreakdown; 
    }
}
