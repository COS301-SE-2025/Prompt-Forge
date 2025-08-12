package com.fiveOps.promptforge.analytics.services;

import com.fiveOps.promptforge.analytics.model.UserActivityLog;
import com.fiveOps.promptforge.analytics.model.PromptPerformanceMetric;
import com.fiveOps.promptforge.analytics.repository.UserActivityLogRepository;
import com.fiveOps.promptforge.analytics.repository.PromptPerformanceMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;

@Service
public class ActivityTrackingService {

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired
    private PromptPerformanceMetricRepository performanceMetricRepository;

    @Async
    public void trackUserActivity(UUID userId, String activityType, UUID promptId, 
                                 Long sessionDuration, String metadata) {
        try {
            UserActivityLog log = new UserActivityLog(userId, activityType, promptId, sessionDuration, metadata);
            activityLogRepository.save(log);
            
            // Update prompt performance metrics if prompt-related activity
            if (promptId != null) {
                updatePromptMetrics(promptId, activityType, sessionDuration);
            }
        } catch (Exception e) {
            System.err.println("Error tracking user activity: " + e.getMessage());
        }
    }

    @Async
    public void trackPromptView(UUID userId, UUID promptId, Long sessionDuration) {
        trackUserActivity(userId, "prompt_view", promptId, sessionDuration, null);
    }

    @Async
    public void trackPromptDownload(UUID userId, UUID promptId) {
        trackUserActivity(userId, "prompt_download", promptId, null, null);
    }

    @Async
    public void trackPromptRating(UUID userId, UUID promptId, Double rating) {
        String metadata = "{\"rating\":" + rating + "}";
        trackUserActivity(userId, "prompt_rating", promptId, null, metadata);
    }

    @Async
    public void trackPromptShare(UUID userId, UUID promptId, String platform) {
        String metadata = "{\"platform\":\"" + platform + "\"}";
        trackUserActivity(userId, "prompt_share", promptId, null, metadata);
    }

    @Async
    public void trackUserLogin(UUID userId, String loginMethod) {
        String metadata = "{\"loginMethod\":\"" + loginMethod + "\"}";
        trackUserActivity(userId, "login", null, null, metadata);
    }

    @Async
    public void trackPromptCreation(UUID userId, UUID promptId, String category) {
        String metadata = "{\"category\":\"" + category + "\"}";
        trackUserActivity(userId, "prompt_create", promptId, null, metadata);
    }

    private void updatePromptMetrics(UUID promptId, String activityType, Long sessionDuration) {
        try {
            PromptPerformanceMetric metric = performanceMetricRepository.findByPromptId(promptId)
                    .orElse(new PromptPerformanceMetric(promptId));

            switch (activityType) {
                case "prompt_view":
                    metric.incrementViews();
                    if (sessionDuration != null) {
                        updateSessionDuration(metric, sessionDuration);
                    }
                    break;
                case "prompt_download":
                    metric.incrementDownloads();
                    break;
                case "prompt_rating":
                    metric.incrementRatings();
                    break;
                case "prompt_share":
                    metric.incrementShares();
                    break;
            }

            performanceMetricRepository.save(metric);
        } catch (Exception e) {
            System.err.println("Error updating prompt metrics: " + e.getMessage());
        }
    }

    private void updateSessionDuration(PromptPerformanceMetric metric, Long sessionDuration) {
        if (metric.getAverageSessionDuration() == null) {
            metric.setAverageSessionDuration(sessionDuration.doubleValue());
        } else {
            // Simple moving average - in production, you might want a more sophisticated approach
            double currentAvg = metric.getAverageSessionDuration();
            long views = metric.getViewsCount();
            double newAvg = ((currentAvg * (views - 1)) + sessionDuration) / views;
            metric.setAverageSessionDuration(newAvg);
        }
    }

    public void calculateBounceRate(UUID promptId) {
        try {
            // Calculate bounce rate based on session durations
            // Users who view for less than 30 seconds are considered "bounced"
            // This is a simplified calculation - implement based on your specific requirements
            
            PromptPerformanceMetric metric = performanceMetricRepository.findByPromptId(promptId)
                    .orElse(null);
            
            if (metric != null && metric.getViewsCount() > 0) {
                // Get recent activity for this prompt
                LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
                
                // This would need a more complex query to calculate actual bounce rate
                // For now, we'll use a simplified calculation
                double bounceRate = Math.max(0, 100 - (metric.getEngagementScore() * 2));
                metric.setBounceRate(bounceRate);
                
                performanceMetricRepository.save(metric);
            }
        } catch (Exception e) {
            System.err.println("Error calculating bounce rate: " + e.getMessage());
        }
    }
}
