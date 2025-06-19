package main.java.com.fiveOps.promptforge.analytics.ana_services;

import com.fiveOps.promptforge.analytics.dto.*;
import com.fiveOps.promptforge.analytics.repository.PromptAnalyticsRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PromptAnalyticsServiceImpl implements PromptAnalyticsService {

    private final PromptAnalyticsRepository analyticsRepository;

    public PromptAnalyticsServiceImpl(PromptAnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @Override
    public List<TrendingPromptDTO> getTrendingPrompts() {
        return analyticsRepository.findTrendingPrompts();
    }

    @Override
    public List<FeaturedPromptDTO> getFeaturedPrompts() {
        // TODO: Implement logic to fetch featured prompts, e.g. from PromptRepository
        return List.of(); // Placeholder
    }

    @Override
    public List<TopRankingPromptDTO> getTopRankingPrompts() {
        return analyticsRepository.findTopRankingPrompts();
    }
}