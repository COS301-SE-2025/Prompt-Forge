package com.fiveOps.promptforge.analytics.ana_services;

import com.fiveOps.promptforge.analytics.ana_dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO;
import java.util.List;

public interface PromptAnalyticsService {
    List<TrendingPromptDTO> getTrendingPrompts();
    List<FeaturedPromptDTO> getFeaturedPrompts();
    List<TopRankingPromptDTO> getTopRankingPrompts();
}