package com.fiveOps.promptforge.analytics.ana_services;

import com.fiveOps.promptforge.analytics.ana_dto.*;
import com.fiveOps.promptforge.analytics.ana_repository.PromptAnalyticsRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromptAnalyticsServiceImpl implements PromptAnalyticsService {

    private final PromptAnalyticsRepository analyticsRepository;
    private final PromptRepository promptRepository;

    public PromptAnalyticsServiceImpl(PromptAnalyticsRepository analyticsRepository, PromptRepository promptRepository) {
        this.analyticsRepository = analyticsRepository;
        this.promptRepository = promptRepository;
    }

    @Override
    public List<TrendingPromptDTO> getTrendingPrompts() {
    // Calculate the date 7 days ago
    // This is used to filter prompts that have been trending in the last week
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
    return analyticsRepository.findTrendingPrompts(sevenDaysAgo);
    }

    @Override
    public List<FeaturedPromptDTO> getFeaturedPrompts() {
        return promptRepository.findByFeaturedTrue().stream()
            .map(p -> new FeaturedPromptDTO(p.getId(), p.getTitle(), p.getDescription()))
            .collect(Collectors.toList());
    }

    @Override
    public List<TopRankingPromptDTO> getTopRankingPrompts() {
        return analyticsRepository.findTopRankingPrompts();
    }
}