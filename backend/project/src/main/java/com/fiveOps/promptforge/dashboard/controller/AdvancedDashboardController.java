package com.fiveOps.promptforge.dashboard.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.fiveOps.promptforge.analytics.dto.*;
import com.fiveOps.promptforge.analytics.services.AdvancedAnalyticsService;
import com.fiveOps.promptforge.dashboard.services.DashboardService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "https://prompt-forge.co.za"}, allowCredentials = "true")
public class AdvancedDashboardController {

    @Autowired 
    private DashboardService dashboardService;

    @Autowired 
    private AdvancedAnalyticsService analyticsService;

    @Autowired 
    private UserRepository userRepository;

    @GetMapping
    public Map<String, Object> getDashboard(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyDashboardData();
        }

        Map<String, Object> result = new HashMap<>();
        try {
            // Basic dashboard data
            result.put("totalPrompts", dashboardService.getTotalPrompts(userId));
            result.put("averageRating", dashboardService.getAverageRating(userId));
            result.put("totalDownloads", dashboardService.getTotalDownloads(userId));
            result.put("topPrompts", dashboardService.getTopPrompts(userId, 5));
            result.put("monthlyUsage", dashboardService.getMonthlyPromptCount(userId));

            System.out.println("Dashboard data retrieved successfully");
        } catch (Exception e) {
            System.err.println("Dashboard service error: " + e.getMessage());
            return createDummyDashboardData();
        }

        return result;
    }

    @GetMapping("/performance-overview")
    public PerformanceOverviewDTO getPerformanceOverview(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyPerformanceOverview();
        }

        try {
            return analyticsService.getPerformanceOverview(userId);
        } catch (Exception e) {
            System.err.println("Error getting performance overview: " + e.getMessage());
            return createDummyPerformanceOverview();
        }
    }

    @GetMapping("/user-analytics")
    public UserAnalyticsDTO getUserAnalytics(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyUserAnalytics();
        }

        try {
            return analyticsService.getUserAnalytics(userId);
        } catch (Exception e) {
            System.err.println("Error getting user analytics: " + e.getMessage());
            return createDummyUserAnalytics();
        }
    }

    @GetMapping("/prompt-analytics")
    public PromptAnalyticsDTO getPromptAnalytics(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyPromptAnalytics();
        }

        try {
            return analyticsService.getPromptAnalytics(userId);
        } catch (Exception e) {
            System.err.println("Error getting prompt analytics: " + e.getMessage());
            return createDummyPromptAnalytics();
        }
    }

    @GetMapping("/technical-performance")
    public TechnicalPerformanceDTO getTechnicalPerformance() {
        try {
            return analyticsService.getTechnicalPerformance();
        } catch (Exception e) {
            System.err.println("Error getting technical performance: " + e.getMessage());
            return createDummyTechnicalPerformance();
        }
    }

    @GetMapping("/ai-insights")
    public java.util.List<AIInsightDTO> getAIInsights(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyAIInsights();
        }

        try {
            return analyticsService.getAIInsights(userId);
        } catch (Exception e) {
            System.err.println("Error getting AI insights: " + e.getMessage());
            return createDummyAIInsights();
        }
    }

    @GetMapping("/predictive-analytics")
    public PredictiveAnalyticsDTO getPredictiveAnalytics(Principal principal) {
        UUID userId = getUserIdFromPrincipal(principal);
        
        if (userId == null) {
            return createDummyPredictiveAnalytics();
        }

        try {
            return analyticsService.getPredictiveAnalytics(userId);
        } catch (Exception e) {
            System.err.println("Error getting predictive analytics: " + e.getMessage());
            return createDummyPredictiveAnalytics();
        }
    }

    // Widget-specific endpoints for modular dashboard
    @GetMapping("/widgets/total-users")
    public Map<String, Object> getTotalUsersWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Total Users");
        widget.put("value", 1547);
        widget.put("change", "+12.5%");
        widget.put("size", "small");
        return widget;
    }

    @GetMapping("/widgets/monthly-usage")
    public Map<String, Object> getMonthlyUsageWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Monthly Usage");
        widget.put("value", 2890);
        widget.put("change", "+8.2%");
        widget.put("size", "small");
        return widget;
    }

    @GetMapping("/widgets/analytics-overview")
    public Map<String, Object> getAnalyticsOverviewWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Analytics Overview");
        widget.put("chartData", generateSampleChartData());
        widget.put("size", "large");
        return widget;
    }

    @GetMapping("/widgets/performance-metrics")
    public Map<String, Object> getPerformanceMetricsWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Performance Metrics");
        widget.put("metrics", generateSampleMetrics());
        widget.put("size", "large");
        return widget;
    }

    @GetMapping("/widgets/category-breakdown")
    public Map<String, Object> getCategoryBreakdownWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Category Breakdown");
        widget.put("categories", generateSampleCategories());
        widget.put("size", "medium");
        return widget;
    }

    @GetMapping("/widgets/activity-calendar")
    public Map<String, Object> getActivityCalendarWidget(Principal principal) {
        Map<String, Object> widget = new HashMap<>();
        widget.put("title", "Activity Calendar");
        widget.put("activityData", generateSampleActivityData());
        widget.put("size", "large");
        return widget;
    }

    // Helper methods
    private UUID getUserIdFromPrincipal(Principal principal) {
        if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
            String userEmail = principal.getName();
            try {
                User user = userRepository.findByEmail(userEmail).orElse(null);
                if (user != null) {
                    return user.getUserId();
                }
            } catch (Exception e) {
                System.err.println("Error looking up user by email: " + e.getMessage());
            }
        }
        return null;
    }

    // Dummy data methods for fallback
    private Map<String, Object> createDummyDashboardData() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalPrompts", 12);
        result.put("averageRating", 4.6);
        result.put("totalDownloads", 3847);
        result.put("topPrompts", new java.util.ArrayList<>());
        result.put("monthlyUsage", 1250);
        return result;
    }

    private PerformanceOverviewDTO createDummyPerformanceOverview() {
        return new PerformanceOverviewDTO(12L, 76.5, 4.6, 8.2, "Creative Writing Prompt", 12.3);
    }

    private UserAnalyticsDTO createDummyUserAnalytics() {
        Map<String, Long> segmentation = new HashMap<>();
        segmentation.put("High Activity", 450L);
        segmentation.put("Medium Activity", 820L);
        segmentation.put("Low Activity", 277L);
        return new UserAnalyticsDTO(1547L, 234L, 1313L, 89L, 456L, 12.5, segmentation, 45L, 78.3);
    }

    private PromptAnalyticsDTO createDummyPromptAnalytics() {
        Map<String, Integer> heatmap = new HashMap<>();
        for (int i = 0; i < 24; i++) {
            heatmap.put(String.valueOf(i), (int) (Math.random() * 100));
        }
        
        Map<String, Double> categories = new HashMap<>();
        categories.put("Creative Writing", 85.5);
        categories.put("Technical", 78.2);
        categories.put("Educational", 92.1);
        
        Map<String, Long> funnel = new HashMap<>();
        funnel.put("views", 5420L);
        funnel.put("ratings", 1355L);
        funnel.put("downloads", 892L);
        funnel.put("shares", 89L);
        
        return new PromptAnalyticsDTO(heatmap, categories, new HashMap<>(), 4.7, 23.5, funnel);
    }

    private TechnicalPerformanceDTO createDummyTechnicalPerformance() {
        Map<String, Double> models = new HashMap<>();
        models.put("GPT-4", 0.95);
        models.put("Claude", 0.92);
        models.put("Gemini", 0.90);
        
        Map<String, Long> errors = new HashMap<>();
        errors.put("timeout", 5L);
        errors.put("rate_limit", 2L);
        errors.put("invalid_request", 1L);
        
        return new TechnicalPerformanceDTO(250.5, models, 0.8, 1000L, 992L, 8L, errors);
    }

    private java.util.List<AIInsightDTO> createDummyAIInsights() {
        java.util.List<AIInsightDTO> insights = new java.util.ArrayList<>();
        insights.add(new AIInsightDTO(
            "Your prompts perform 23% better on weekends",
            "recommendation",
            0.85,
            java.util.Arrays.asList("Weekend engagement data", "Time analysis"),
            "Schedule releases for Friday or Saturday"
        ));
        insights.add(new AIInsightDTO(
            "Creative writing category showing strong growth",
            "trend",
            0.78,
            java.util.Arrays.asList("Category performance", "User feedback"),
            "Focus more content on creative writing"
        ));
        return insights;
    }

    private PredictiveAnalyticsDTO createDummyPredictiveAnalytics() {
        return new PredictiveAnalyticsDTO(
            88.5, 15.3, 0.87, "increasing", 
            java.time.LocalDateTime.now().plusDays(30), 0.73
        );
    }

    private java.util.List<Map<String, Object>> generateSampleChartData() {
        java.util.List<Map<String, Object>> data = new java.util.ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("day", "Day " + (i + 1));
            point.put("value", (int) (Math.random() * 100) + 50);
            data.add(point);
        }
        return data;
    }

    private java.util.List<Map<String, Object>> generateSampleMetrics() {
        java.util.List<Map<String, Object>> metrics = new java.util.ArrayList<>();
        String[] metricNames = {"Response Time", "Success Rate", "User Satisfaction", "API Calls"};
        for (String name : metricNames) {
            Map<String, Object> metric = new HashMap<>();
            metric.put("name", name);
            metric.put("value", Math.random() * 100);
            metric.put("trend", Math.random() > 0.5 ? "up" : "down");
            metrics.add(metric);
        }
        return metrics;
    }

    private java.util.List<Map<String, Object>> generateSampleCategories() {
        java.util.List<Map<String, Object>> categories = new java.util.ArrayList<>();
        String[] categoryNames = {"Creative Writing", "Technical", "Educational", "Business", "Entertainment"};
        for (String name : categoryNames) {
            Map<String, Object> category = new HashMap<>();
            category.put("name", name);
            category.put("count", (int) (Math.random() * 50) + 10);
            category.put("percentage", Math.random() * 100);
            categories.add(category);
        }
        return categories;
    }

    private java.util.List<Map<String, Object>> generateSampleActivityData() {
        java.util.List<Map<String, Object>> activityData = new java.util.ArrayList<>();
        for (int i = 0; i < 365; i++) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", java.time.LocalDate.now().minusDays(i).toString());
            day.put("activity", (int) (Math.random() * 10));
            activityData.add(day);
        }
        return activityData;
    }
}
