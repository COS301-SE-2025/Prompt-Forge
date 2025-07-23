package com.fiveOps.promptforge.analytics.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.services.PromptAnalyticsService;

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
