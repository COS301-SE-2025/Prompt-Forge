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
    public Map<String, Object> getDashboard(Principal principal) {
        // Replace this with your actual user ID resolution logic
        UUID userId = UUID.fromString(principal.getName());

        Map<String, Object> result = new HashMap<>();
        result.put("totalPrompts", dashboardService.getTotalPrompts(userId));
        result.put("averageRating", dashboardService.getAverageRating(userId));
        result.put("totalDownloads", dashboardService.getTotalDownloads(userId));
        result.put("topPrompts", dashboardService.getTopPrompts(userId, 5));
        return result;
    }
}
