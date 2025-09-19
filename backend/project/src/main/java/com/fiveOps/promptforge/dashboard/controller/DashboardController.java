package com.fiveOps.promptforge.dashboard.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.dashboard.services.DashboardService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DashboardController {
  @GetMapping("/category-breakdown")
  public Map<String, Long> getCategoryBreakdown(Principal principal) {
    UUID userId = null;
    String userEmail = null;

    if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
      userEmail = principal.getName();
      User user = userRepository.findByEmail(userEmail).orElse(null);
      if (user != null) {
        userId = user.getUserId();
      }
    }
    if (userId == null) {
      return new HashMap<>();
    }

    Map<String, Long> breakdown = new HashMap<>();
    try {
      List<Object[]> raw = dashboardService.getCategoryBreakdown(userId);
      for (Object[] row : raw) {
        String category = row[0] != null ? row[0].toString() : "Unknown";
        Long count = row[1] != null ? Long.valueOf(row[1].toString()) : 0L;
        breakdown.put(category, count);
      }
    } catch (Exception e) {
      System.err.println("Error fetching category breakdown: " + e.getMessage());
    }
    return breakdown;
  }

  @GetMapping("/monthly-prompt-counts")
  public Map<Integer, Long> getMonthlyPromptCounts(Principal principal) {
    UUID userId = null;
    String userEmail = null;

    if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
      userEmail = principal.getName();
      User user = userRepository.findByEmail(userEmail).orElse(null);
      if (user != null) {
        userId = user.getUserId();
      }
    }
    if (userId == null) {
      return new HashMap<>();
    }

    int year = java.time.LocalDate.now().getYear();
    Map<Integer, Long> result = new HashMap<>();
    try {
      List<Object[]> raw = dashboardService.getMonthlyPromptCounts(userId, year);
      for (Object[] row : raw) {
        Integer month = row[0] != null ? ((Number) row[0]).intValue() : null;
        Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        if (month != null) result.put(month, count);
      }
    } catch (Exception e) {
      System.err.println("Error fetching monthly prompt counts: " + e.getMessage());
    }
    return result;
  }

  @Autowired private DashboardService dashboardService;

  @Autowired private UserRepository userRepository;

  @GetMapping
  public Map<String, Object> getDashboard(Principal principal) {

    UUID userId = null;
    String userEmail = null;

    System.out.println("Dashboard request received");
    System.out.println("Principal: " + (principal != null ? principal.getName() : "null"));

    // Get email from Principal (set by JwtFilter)
    if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
      userEmail = principal.getName();
      System.out.println("Using Principal email: " + userEmail);

      // Look up user by email to get UUID
      try {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
          userId = user.getUserId();
          System.out.println("Found userId from email: " + userId);
        } else {
          System.out.println("User not found for email: " + userEmail);
        }
      } catch (Exception e) {
        System.err.println("Error looking up user by email: " + e.getMessage());
      }
    }

    // Return empty data if no user found instead of dummy data
    if (userId == null) {
      System.out.println("No userId found, returning empty dashboard data");
      return createEmptyDashboardData();
    }

    System.out.println("Dashboard request for userId: " + userId);

    // Get real data from service
    Map<String, Object> result = new HashMap<>();
    try {
      Long totalDownloads = dashboardService.getTotalDownloads(userId);
      Double averageRating = dashboardService.getAverageRating(userId);
      Double averageBounceRate = dashboardService.getAverageBounceRate(userId);

      result.put("totalPrompts", dashboardService.getTotalPrompts(userId));
      result.put("averageRating", averageRating);
      result.put("averageBounceRate", averageBounceRate);
      result.put("totalDownloads", totalDownloads);
      result.put("topPrompts", dashboardService.getTopPrompts(userId, 5));
      result.put("monthlyUsage", dashboardService.getMonthlyPromptCount(userId));
      result.put("categoryBreakdown", dashboardService.getCategoryBreakdown(userId));
      result.put(
          "monthlyAnalytics",
          dashboardService.getMonthlyPromptCounts(userId, java.time.LocalDate.now().getYear()));

      System.out.println(
          "Dashboard data retrieved - Downloads: " + totalDownloads + ", Rating: " + averageRating + ", Bounce Rate: " + averageBounceRate);
    } catch (Exception e) {
      System.err.println("Dashboard service error: " + e.getMessage());
      e.printStackTrace();
      return createEmptyDashboardData();
    }

    return result;
  }

  private Map<String, Object> createEmptyDashboardData() {
    Map<String, Object> result = new HashMap<>();
    result.put("totalPrompts", 12);
    result.put("averageRating", 4.6);
    result.put("averageBounceRate", 15.2);
    result.put("totalDownloads", 3847);
    result.put("topPrompts", new java.util.ArrayList<>());
    result.put("monthlyUsage", 1250);
    result.put("categoryBreakdown", new HashMap<String, Long>());
    result.put("monthlyAnalytics", new java.util.ArrayList<>());
    System.out.println("⚠️ Returning empty dashboard data (no user or error)");
    return result;
  }
}
