package com.fiveOps.promptforge.analytics.repository;

import com.fiveOps.promptforge.analytics.model.PromptPerformanceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromptPerformanceMetricRepository extends JpaRepository<PromptPerformanceMetric, UUID> {
    
    Optional<PromptPerformanceMetric> findByPromptId(UUID promptId);
    
    @Query("SELECT p FROM PromptPerformanceMetric p JOIN Prompt pr ON p.promptId = pr.promptId WHERE pr.userId = :userId ORDER BY p.engagementScore DESC")
    List<PromptPerformanceMetric> findByUserIdOrderByEngagementScore(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM PromptPerformanceMetric p ORDER BY p.engagementScore DESC")
    List<PromptPerformanceMetric> findTopPerformingPrompts();
    
    @Query("SELECT AVG(p.engagementScore) FROM PromptPerformanceMetric p JOIN Prompt pr ON p.promptId = pr.promptId WHERE pr.userId = :userId")
    Double getAverageEngagementScoreForUser(@Param("userId") UUID userId);
    
    @Query("SELECT SUM(p.viewsCount) FROM PromptPerformanceMetric p JOIN Prompt pr ON p.promptId = pr.promptId WHERE pr.userId = :userId")
    Long getTotalViewsForUser(@Param("userId") UUID userId);
    
    @Query("SELECT SUM(p.downloadsCount) FROM PromptPerformanceMetric p JOIN Prompt pr ON p.promptId = pr.promptId WHERE pr.userId = :userId")
    Long getTotalDownloadsForUser(@Param("userId") UUID userId);
    
    @Query("SELECT AVG(p.bounceRate) FROM PromptPerformanceMetric p JOIN Prompt pr ON p.promptId = pr.promptId WHERE pr.userId = :userId")
    Double getAverageBounceRateForUser(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM PromptPerformanceMetric p WHERE p.lastUpdated BETWEEN :start AND :end ORDER BY p.engagementScore DESC")
    List<PromptPerformanceMetric> findTrendingPrompts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
