package com.fiveOps.promptforge.analytics.services;

import java.util.List;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;

public interface PromptAnalyticsService {
  List<TrendingPromptDTO> getTrendingPrompts();

  List<FeaturedPromptDTO> getFeaturedPrompts();

  List<TopRankingPromptDTO> getTopRankingPrompts();
}
