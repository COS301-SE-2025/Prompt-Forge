package com.fiveOps.promptforge.analytics.ana_controller;

import com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.ana_services.PromptAnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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