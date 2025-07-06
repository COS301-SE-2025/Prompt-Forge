package com.fiveOps.promptforge.analytics.services;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.repository.PromptAnalyticsRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@Service
public class PromptAnalyticsServiceImpl implements PromptAnalyticsService {

  private final PromptAnalyticsRepository analyticsRepository;
  private final PromptRepository promptRepository;

  public PromptAnalyticsServiceImpl(
      PromptAnalyticsRepository analyticsRepository, PromptRepository promptRepository) {
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
    org.springframework.data.domain.Pageable pageable =
        org.springframework.data.domain.PageRequest.of(0, 3);
    return analyticsRepository.findTopRankingPrompts(pageable);
  }
}
