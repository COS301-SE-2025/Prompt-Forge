package com.fiveOps.promptforge.dashboard.dash_controller;


import com.fiveOps.promptforge.dashboard.dash_services.DashboardService;
import com.fiveOps.promptforge.prompts.model.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

        @GetMapping
        public Map<String, Object> getDashboard(
            Principal principal,
            @CookieValue(value = "token", required = false) String jwtToken) {
        UUID userId = null;
    
        if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
            userId = UUID.fromString(principal.getName());
        } else if (jwtToken != null) {
            // Parse the JWT and extract the user ID (pseudo-code, use your JWT library)
            // Simple JWT parsing for userId claim (replace with your actual JWT library in production)
            String userIdStr = extractUserIdFromJwt(jwtToken);
            userId = UUID.fromString(userIdStr);
        } else {
            // fallback for dev
            userId = UUID.fromString("706d87a3-b874-4b37-a041-e67201f4ed22");
        }
    
        Map<String, Object> result = new HashMap<>();
        result.put("totalPrompts", dashboardService.getTotalPrompts(userId));
        result.put("averageRating", dashboardService.getAverageRating(userId));
        result.put("totalDownloads", dashboardService.getTotalDownloads(userId));
        result.put("topPrompts", dashboardService.getTopPrompts(userId, 5));
        result.put("monthlyUsage", dashboardService.getMonthlyPromptCount(userId));
        // If you implement recent activity in your service, add it here:
        // result.put("recentActivity", dashboardService.getRecentActivity(userId, 5));
        return result;
    }

    // Minimal JWT parser for extracting "sub" claim as userId (for development only)
    private String extractUserIdFromJwt(String jwtToken) {
        try {
            String[] parts = jwtToken.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            // Simple extraction, assumes {"sub":"user-uuid", ...}
            int subIndex = payload.indexOf("\"sub\":\"");
            if (subIndex == -1) return null;
            int start = subIndex + 7;
            int end = payload.indexOf("\"", start);
            return payload.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }
}   