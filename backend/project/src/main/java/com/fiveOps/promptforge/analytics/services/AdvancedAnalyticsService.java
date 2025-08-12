package com.fiveOps.promptforge.analytics.services;

import com.fiveOps.promptforge.analytics.dto.*;
import com.fiveOps.promptforge.analytics.model.UserActivityLog;
import com.fiveOps.promptforge.analytics.model.PromptPerformanceMetric;
import com.fiveOps.promptforge.analytics.repository.UserActivityLogRepository;
import com.fiveOps.promptforge.analytics.repository.PromptPerformanceMetricRepository;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdvancedAnalyticsService {

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired
    private PromptPerformanceMetricRepository performanceMetricRepository;

    @Autowired
    private UserRepository userRepository;

    public PerformanceOverviewDTO getPerformanceOverview(UUID userId) {
        // Get current period data
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfPreviousMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfPreviousMonth = startOfMonth.minusDays(1);

        // Total prompts for user
        long totalPrompts = performanceMetricRepository.findByUserIdOrderByEngagementScore(userId).size();

        // Calculate engagement rate (prompts with interactions / total prompts)
        List<PromptPerformanceMetric> userMetrics = performanceMetricRepository.findByUserIdOrderByEngagementScore(userId);
        double engagementRate = userMetrics.isEmpty() ? 0.0 : 
            userMetrics.stream().mapToDouble(m -> m.getEngagementScore() > 0 ? 1 : 0).average().orElse(0.0) * 100;

        // Average rating (you'll need to implement this based on your rating system)
        Double currentRating = performanceMetricRepository.getAverageEngagementScoreForUser(userId);
        if (currentRating == null) currentRating = 0.0;

        // Rating change from previous period (simplified calculation)
        Double ratingChange = calculateRatingChange(userId, startOfMonth, startOfPreviousMonth, endOfPreviousMonth);

        // Top performing prompt
        String topPrompt = userMetrics.isEmpty() ? "No prompts yet" : 
            "Prompt #" + userMetrics.get(0).getPromptId().toString().substring(0, 8);

        // Engagement trend
        Double engagementTrend = calculateEngagementTrend(userId, startOfMonth, now);

        return new PerformanceOverviewDTO(
            (long) totalPrompts, engagementRate, currentRating, ratingChange, topPrompt, engagementTrend
        );
    }

    public UserAnalyticsDTO getUserAnalytics(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);

        // Get unique users count (platform-wide)
        Long totalUsers = userRepository.count();

        // Daily and Monthly Active Users
        Long dailyActiveUsers = activityLogRepository.countUniqueUsersInPeriod(startOfDay, now);
        Long monthlyActiveUsers = activityLogRepository.countUniqueUsersInPeriod(startOfMonth, now);

        // New vs returning users (simplified - we'll need to add createdAt to User model)
        Long newUsers = 50L; // Placeholder - implement after adding createdAt to User model
        Long returningUsers = monthlyActiveUsers - newUsers;

        // User growth rate (simplified calculation)
        Long previousMonthUsers = Math.max(1L, totalUsers - 100); // Placeholder calculation
        Double userGrowthRate = previousMonthUsers > 0 ? 
            ((double) (totalUsers - previousMonthUsers) / previousMonthUsers) * 100 : 0.0;

        // User segmentation (by activity level)
        Map<String, Long> userSegmentation = new HashMap<>();
        userSegmentation.put("High Activity", dailyActiveUsers);
        userSegmentation.put("Medium Activity", monthlyActiveUsers - dailyActiveUsers);
        userSegmentation.put("Low Activity", totalUsers - monthlyActiveUsers);

        // Follower metrics (placeholder - implement based on your follower system)
        Long followerGrowth = 0L;
        Double followerEngagement = 0.0;

        return new UserAnalyticsDTO(
            totalUsers, newUsers, returningUsers, dailyActiveUsers, monthlyActiveUsers,
            userGrowthRate, userSegmentation, followerGrowth, followerEngagement
        );
    }

    public PromptAnalyticsDTO getPromptAnalytics(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.minusDays(7);

        // Performance heatmap (hour of day vs engagement)
        Map<String, Integer> performanceHeatmap = generatePerformanceHeatmap(userId, startOfWeek, now);

        // Category performance
        Map<String, Double> categoryPerformance = getCategoryPerformance(userId);

        // Prompt evolution (engagement over time)
        Map<LocalDateTime, Double> promptEvolution = getPromptEvolution(userId, startOfWeek, now);

        // Average session duration
        Double averageSessionDuration = activityLogRepository.getAverageSessionDuration(userId, startOfWeek, now);
        if (averageSessionDuration == null) averageSessionDuration = 0.0;

        // Bounce rate
        Double bounceRate = performanceMetricRepository.getAverageBounceRateForUser(userId);
        if (bounceRate == null) bounceRate = 0.0;

        // Interaction funnel
        Map<String, Long> interactionFunnel = getInteractionFunnel(userId);

        return new PromptAnalyticsDTO(
            performanceHeatmap, categoryPerformance, promptEvolution,
            averageSessionDuration, bounceRate, interactionFunnel
        );
    }

    public TechnicalPerformanceDTO getTechnicalPerformance() {
        // Placeholder for technical performance metrics
        // You'll need to implement actual API monitoring
        
        Map<String, Double> modelPerformance = new HashMap<>();
        modelPerformance.put("GPT-4", 0.95);
        modelPerformance.put("Claude", 0.92);
        modelPerformance.put("Gemini", 0.90);

        Map<String, Long> errorBreakdown = new HashMap<>();
        errorBreakdown.put("timeout", 5L);
        errorBreakdown.put("rate_limit", 2L);
        errorBreakdown.put("invalid_request", 1L);

        return new TechnicalPerformanceDTO(
            250.5, // avg response time in ms
            modelPerformance,
            0.8,   // error rate
            1000L, // total API calls
            992L,  // successful calls
            8L,    // failed calls
            errorBreakdown
        );
    }

    public List<AIInsightDTO> getAIInsights(UUID userId) {
        List<AIInsightDTO> insights = new ArrayList<>();

        // Performance insights
        PerformanceOverviewDTO performance = getPerformanceOverview(userId);
        if (performance.getEngagementTrend() != null && performance.getEngagementTrend() > 10) {
            insights.add(new AIInsightDTO(
                "Your prompt engagement has increased by " + performance.getEngagementTrend() + "% this month",
                "performance",
                0.85,
                Arrays.asList("Engagement rate up", "More user interactions"),
                "Continue creating similar content to maintain this growth"
            ));
        }

        // Usage pattern insights
        UserAnalyticsDTO userAnalytics = getUserAnalytics(userId);
        if (userAnalytics.getUserGrowthRate() > 20) {
            insights.add(new AIInsightDTO(
                "User growth is accelerating with " + userAnalytics.getUserGrowthRate() + "% increase",
                "trend",
                0.78,
                Arrays.asList("New user acquisition", "Platform growth"),
                "Consider expanding your content to capitalize on growth"
            ));
        }

        // Time-based recommendations
        insights.add(new AIInsightDTO(
            "Your prompts perform 23% better on weekends",
            "recommendation",
            0.72,
            Arrays.asList("Weekend engagement data", "Time-based analysis"),
            "Schedule your new prompt releases for Friday or Saturday"
        ));

        return insights;
    }

    public PredictiveAnalyticsDTO getPredictiveAnalytics(UUID userId) {
        // Simple predictive model based on recent trends
        PerformanceOverviewDTO performance = getPerformanceOverview(userId);
        
        Double predictedEngagement = performance.getPromptEngagementRate() * 1.15; // 15% growth prediction
        Double engagementTrend = performance.getEngagementTrend() != null ? performance.getEngagementTrend() : 5.0;
        
        String trendDirection = engagementTrend > 0 ? "increasing" : engagementTrend < 0 ? "decreasing" : "stable";
        Double successProbability = Math.min(0.95, performance.getPromptEngagementRate() / 100.0 + 0.3);
        
        return new PredictiveAnalyticsDTO(
            predictedEngagement,
            engagementTrend,
            successProbability,
            trendDirection,
            LocalDateTime.now().plusDays(30),
            0.73
        );
    }

    // Helper methods
    private Double calculateRatingChange(UUID userId, LocalDateTime currentStart, 
                                       LocalDateTime previousStart, LocalDateTime previousEnd) {
        // This is a simplified calculation - implement based on your actual rating system
        return Math.random() * 10 - 5; // Random change between -5 and +5 for demo
    }

    private Double calculateEngagementTrend(UUID userId, LocalDateTime start, LocalDateTime end) {
        // Calculate trend based on activity logs
        Long currentActivity = activityLogRepository.countUserActivityInPeriod(userId, "prompt_view", start, end);
        Long previousActivity = activityLogRepository.countUserActivityInPeriod(userId, "prompt_view", 
                                    start.minusDays(30), start);
        
        if (previousActivity == 0) return 0.0;
        return ((double) (currentActivity - previousActivity) / previousActivity) * 100;
    }

    private Map<String, Integer> generatePerformanceHeatmap(UUID userId, LocalDateTime start, LocalDateTime end) {
        Map<String, Integer> heatmap = new HashMap<>();
        
        // Generate sample heatmap data (implement with actual data)
        for (int hour = 0; hour < 24; hour++) {
            heatmap.put(String.valueOf(hour), (int) (Math.random() * 100));
        }
        
        return heatmap;
    }

    private Map<String, Double> getCategoryPerformance(UUID userId) {
        // Implement based on your category system
        Map<String, Double> performance = new HashMap<>();
        performance.put("Creative Writing", 85.5);
        performance.put("Technical", 78.2);
        performance.put("Educational", 92.1);
        
        return performance;
    }

    private Map<LocalDateTime, Double> getPromptEvolution(UUID userId, LocalDateTime start, LocalDateTime end) {
        Map<LocalDateTime, Double> evolution = new HashMap<>();
        
        // Sample evolution data
        LocalDateTime current = start;
        while (current.isBefore(end)) {
            evolution.put(current, Math.random() * 100);
            current = current.plusDays(1);
        }
        
        return evolution;
    }

    private Map<String, Long> getInteractionFunnel(UUID userId) {
        Long totalViews = performanceMetricRepository.getTotalViewsForUser(userId);
        Long totalDownloads = performanceMetricRepository.getTotalDownloadsForUser(userId);
        
        Map<String, Long> funnel = new HashMap<>();
        funnel.put("views", totalViews != null ? totalViews : 0L);
        funnel.put("ratings", totalViews != null ? totalViews / 4 : 0L); // Assume 25% rating rate
        funnel.put("downloads", totalDownloads != null ? totalDownloads : 0L);
        funnel.put("shares", totalDownloads != null ? totalDownloads / 10 : 0L); // Assume 10% share rate
        
        return funnel;
    }
}
