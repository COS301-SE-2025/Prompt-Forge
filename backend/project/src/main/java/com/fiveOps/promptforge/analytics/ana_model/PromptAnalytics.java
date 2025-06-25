package com.fiveOps.promptforge.analytics.ana_model;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "prompt_analytics", indexes = {
    // Primary lookup indexes
    @Index(name = "idx_analytics_prompt", columnList = "prompt_id"),
    @Index(name = "idx_analytics_date", columnList = "date"),
    @Index(name = "idx_analytics_created_at", columnList = "created_at"),
    
    // Composite indexes for common query patterns
    @Index(name = "idx_analytics_prompt_date", columnList = "prompt_id, date"),
    @Index(name = "idx_analytics_date_views", columnList = "date, view_count"),
    @Index(name = "idx_analytics_date_purchases", columnList = "date, purchase_count"),
    @Index(name = "idx_analytics_prompt_metrics", columnList = "prompt_id, view_count, purchase_count, avg_rating"),
    
    // Time-series indexes (most recent first)
    @Index(name = "idx_analytics_date_desc", columnList = "date DESC"),
    @Index(name = "idx_analytics_prompt_date_desc", columnList = "prompt_id, date DESC"),
    
    // Metric-specific indexes for filtering and sorting
    @Index(name = "idx_analytics_view_count", columnList = "view_count"),
    @Index(name = "idx_analytics_unique_visitors", columnList = "unique_visitors"),
    @Index(name = "idx_analytics_purchase_count", columnList = "purchase_count"),
    @Index(name = "idx_analytics_avg_rating", columnList = "avg_rating"),
    @Index(name = "idx_analytics_download_count", columnList = "download_count"),
    
    // Analytics aggregation indexes
    @Index(name = "idx_analytics_monthly", columnList = "prompt_id, date"), // For monthly rollups
    @Index(name = "idx_analytics_performance", columnList = "view_count, purchase_count, avg_rating") // For performance analysis
})
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