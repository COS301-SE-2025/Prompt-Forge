package main.java.com.fiveOps.promptforge.analytics.ana_model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "prompt_analytics")
public class PromptAnalytics {
    @Id
    @Column(name = "analytics_id", nullable = false)
    private UUID analyticsId;

    @Column(name = "prompt_id", nullable = false)
    private UUID promptId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "unique_visitors")
    private Integer uniqueVisitors = 0;

    @Column(name = "purchase_count")
    private Integer purchaseCount = 0;

    @Column(name = "avg_rating")
    private Double avgRating;

    @Column(name = "download_count")
    private Double downloadCount;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    // Getters and Setters

    public UUID getAnalyticsId() { return analyticsId; }
    public void setAnalyticsId(UUID analyticsId) { this.analyticsId = analyticsId; }

    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getUniqueVisitors() { return uniqueVisitors; }
    public void setUniqueVisitors(Integer uniqueVisitors) { this.uniqueVisitors = uniqueVisitors; }

    public Integer getPurchaseCount() { return purchaseCount; }
    public void setPurchaseCount(Integer purchaseCount) { this.purchaseCount = purchaseCount; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Double getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Double downloadCount) { this.downloadCount = downloadCount; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}