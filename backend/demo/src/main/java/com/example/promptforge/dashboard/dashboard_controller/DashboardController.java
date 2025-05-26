// src/main/java/com/example/promptforge/dashboard/dashboard_controller/DashboardController.java
package com.example.promptforge.dashboard.dashboard_controller;

import com.example.promptforge.dashboard.dashboard_dto.ActivityDTO;
import com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO;
import com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO;
import com.example.promptforge.dashboard.dashboard_services.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {
        return Map.of(
            "totalPrompts", dashboardService.getTotalPrompts(),
            "totalUsers", dashboardService.getTotalUsers(),
            "averageRating", dashboardService.getAverageRating()
        );
    }
    
    @GetMapping("/monthly-usage")
    public List<MonthlyUsageDTO> getMonthlyUsage() {
        return dashboardService.getMonthlyUsage();
    }
    
    @GetMapping("/top-prompts")
    public List<TopPromptDTO> getTopPrompts() {
        return dashboardService.getTopPrompts();
    }
    
    @GetMapping("/recent-activities")
    public List<ActivityDTO> getRecentActivities() {
        return dashboardService.getRecentActivities();
    }
}