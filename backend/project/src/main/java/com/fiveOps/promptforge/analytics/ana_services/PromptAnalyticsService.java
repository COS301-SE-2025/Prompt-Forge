package com.fiveOps.promptforge.analytics.ana_services;

// import com.yourapp.analytics.dto.*;
// import com.yourapp.analytics.repository.PromptAnalyticsRepository;
// import com.yourapp.prompts.repository.PromptRepository;
// import org.springframework.stereotype.Service;
// import java.util.List;

// @Service
// public class PromptAnalyticsServiceImpl implements PromptAnalyticsService {

//     private final PromptAnalyticsRepository analyticsRepository;
//     private final PromptRepository promptRepository;

//     public PromptAnalyticsServiceImpl(PromptAnalyticsRepository analyticsRepository, PromptRepository promptRepository) {
//         this.analyticsRepository = analyticsRepository;
//         this.promptRepository = promptRepository;
//     }

//     @Override
//     public List<TrendingPromptDTO> getTrendingPrompts() {
//         return analyticsRepository.findTrendingPrompts();
//     }

//     @Override
//     public List<FeaturedPromptDTO> getFeaturedPrompts() {
//         return promptRepository.findFeaturedPrompts();
//     }

//     @Override
//     public List<TopRankingPromptDTO> getTopRankingPrompts() {
//         return analyticsRepository.findTopRankingPrompts();
//     }
// }

import com.fiveOps.promptforge.analytics.ana_dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO;
import java.util.List;

public interface PromptAnalyticsService {
    List<TrendingPromptDTO> getTrendingPrompts();
    List<FeaturedPromptDTO> getFeaturedPrompts();
    List<TopRankingPromptDTO> getTopRankingPrompts();
}