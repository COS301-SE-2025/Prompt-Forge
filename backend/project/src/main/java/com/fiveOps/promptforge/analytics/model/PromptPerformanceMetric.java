package com.fiveOps.promptforge.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prompt_performance_metrics")
public class PromptPerformanceMetric {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "prompt_id", nullable = false)
    private UUID promptId;
    
    @Column(name = "views_count")
    private Long viewsCount = 0L;
    
    @Column(name = "downloads_count")
    private Long downloadsCount = 0L;
    
    @Column(name = "ratings_count")
    private Long ratingsCount = 0L;
    
    @Column(name = "shares_count")
    private Long sharesCount = 0L;
    
    @Column(name = "average_session_duration")
    private Double averageSessionDuration;
    
    @Column(name = "bounce_rate")
    private Double bounceRate;
    
    @Column(name = "engagement_score")
    private Double engagementScore;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    public PromptPerformanceMetric() {}
    
    public PromptPerformanceMetric(UUID promptId) {
        this.promptId = promptId;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }
    
    public Long getViewsCount() { return viewsCount; }
    public void setViewsCount(Long viewsCount) { this.viewsCount = viewsCount; }
    
    public Long getDownloadsCount() { return downloadsCount; }
    public void setDownloadsCount(Long downloadsCount) { this.downloadsCount = downloadsCount; }
    
    public Long getRatingsCount() { return ratingsCount; }
    public void setRatingsCount(Long ratingsCount) { this.ratingsCount = ratingsCount; }
    
    public Long getSharesCount() { return sharesCount; }
    public void setSharesCount(Long sharesCount) { this.sharesCount = sharesCount; }
    
    public Double getAverageSessionDuration() { return averageSessionDuration; }
    public void setAverageSessionDuration(Double averageSessionDuration) { 
        this.averageSessionDuration = averageSessionDuration; 
    }
    
    public Double getBounceRate() { return bounceRate; }
    public void setBounceRate(Double bounceRate) { this.bounceRate = bounceRate; }
    
    public Double getEngagementScore() { return engagementScore; }
    public void setEngagementScore(Double engagementScore) { this.engagementScore = engagementScore; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    // Helper methods
    public void incrementViews() {
        this.viewsCount++;
        this.lastUpdated = LocalDateTime.now();
        calculateEngagementScore();
    }
    
    public void incrementDownloads() {
        this.downloadsCount++;
        this.lastUpdated = LocalDateTime.now();
        calculateEngagementScore();
    }
    
    public void incrementRatings() {
        this.ratingsCount++;
        this.lastUpdated = LocalDateTime.now();
        calculateEngagementScore();
    }
    
    public void incrementShares() {
        this.sharesCount++;
        this.lastUpdated = LocalDateTime.now();
        calculateEngagementScore();
    }
    
    private void calculateEngagementScore() {
        // Weighted engagement score calculation
        double viewsWeight = 1.0;
        double ratingsWeight = 3.0;
        double downloadsWeight = 5.0;
        double sharesWeight = 4.0;
        
        this.engagementScore = (viewsCount * viewsWeight + 
                               ratingsCount * ratingsWeight + 
                               downloadsCount * downloadsWeight + 
                               sharesCount * sharesWeight) / 13.0;
    }
}
