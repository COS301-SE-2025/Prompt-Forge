package com.fiveOps.promptforge.analytics.ana_controller;

// import com.yourapp.analytics.dto.*;
// import com.yourapp.analytics.service.PromptAnalyticsService;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

// @RestController
// @RequestMapping("/api/analytics")
// public class PromptAnalyticsController {

//     private final PromptAnalyticsService analyticsService;

//     public PromptAnalyticsController(PromptAnalyticsService analyticsService) {
//         this.analyticsService = analyticsService;
//     }

//     @GetMapping("/trending")
//     public List<TrendingPromptDTO> getTrendingPrompts() {
//         return analyticsService.getTrendingPrompts();
//     }

//     @GetMapping("/featured")
//     public List<FeaturedPromptDTO> getFeaturedPrompts() {
//         return analyticsService.getFeaturedPrompts();
//     }

//     @GetMapping("/top-ranking")
//     public List<TopRankingPromptDTO> getTopRankingPrompts() {
//         return analyticsService.getTopRankingPrompts();
//     }
// }

import com.fiveOps.promptforge.analytics.dto.*;
import com.fiveOps.promptforge.analytics.service.PromptAnalyticsService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class PromptAnalyticsController {

    private final PromptAnalyticsService analyticsService;

    public PromptAnalyticsController(PromptAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/trending")
    public List<TrendingPromptDTO> getTrendingPrompts() {
        return analyticsService.getTrendingPrompts();
    }

    @GetMapping("/featured")
    public List<FeaturedPromptDTO> getFeaturedPrompts() {
        return analyticsService.getFeaturedPrompts();
    }

    @GetMapping("/top-ranking")
    public List<TopRankingPromptDTO> getTopRankingPrompts() {
        return analyticsService.getTopRankingPrompts();
    }
}