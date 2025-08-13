package com.fiveOps.promptforge.dashboard.controller;

import java.security.Principal;
import java.util.HashMap;
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

    System.out.println("🎯 Dashboard request for userId: " + userId);

    // Get real data from service
    Map<String, Object> result = new HashMap<>();
    try {
      Long totalDownloads = dashboardService.getTotalDownloads(userId);
      Double averageRating = dashboardService.getAverageRating(userId);
      
      result.put("totalPrompts", dashboardService.getTotalPrompts(userId));
      result.put("averageRating", averageRating != null ? averageRating : 0.0);
      result.put("totalDownloads", totalDownloads != null ? totalDownloads : 0L);
      result.put("topPrompts", dashboardService.getTopPrompts(userId, 5));
      result.put("monthlyUsage", dashboardService.getMonthlyPromptCount(userId));

      System.out.println("✅ Dashboard data retrieved - Downloads: " + totalDownloads 
          + ", Rating: " + averageRating);
    } catch (Exception e) {
      System.err.println("❌ Dashboard service error: " + e.getMessage());
      e.printStackTrace();
      return createEmptyDashboardData();
    }

    return result;
  }

  private Map<String, Object> createEmptyDashboardData() {
    Map<String, Object> result = new HashMap<>();
    result.put("totalPrompts", 0);
    result.put("averageRating", 0.0);
    result.put("totalDownloads", 0L);
    result.put("topPrompts", new java.util.ArrayList<>());
    result.put("monthlyUsage", 0);
    System.out.println("⚠️ Returning empty dashboard data (no user or error)");
    return result;
  }
}
