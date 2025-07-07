package com.fiveOps.promptforge.analytics.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.repository.PromptAnalyticsRepository;
import com.fiveOps.promptforge.analytics.services.PromptAnalyticsServiceImpl;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

class PromptAnalyticsServiceImplTest {

  private PromptAnalyticsRepository analyticsRepository;
  private PromptRepository promptRepository;
  private PromptAnalyticsServiceImpl service;

  @BeforeEach
  void setUp() {
    analyticsRepository = mock(PromptAnalyticsRepository.class);
    promptRepository = mock(PromptRepository.class);
    service = new PromptAnalyticsServiceImpl(analyticsRepository, promptRepository);
  }

  @Test
  void testGetTrendingPrompts() {
    TrendingPromptDTO dto = new TrendingPromptDTO(UUID.randomUUID(), "Trending", 100);
    when(analyticsRepository.findTrendingPrompts(any())).thenReturn(List.of(dto));

    List<TrendingPromptDTO> result = service.getTrendingPrompts();

    assertEquals(1, result.size());
    assertEquals("Trending", result.get(0).getTitle());
    assertEquals(100, result.get(0).getViewCount());
  }

  @Test
  void testGetFeaturedPrompts() {
    // Mock a prompt with needed getters
    var prompt = mock(com.fiveOps.promptforge.prompts.model.Prompt.class);
    UUID id = UUID.randomUUID();
    when(prompt.getId()).thenReturn(id);
    when(prompt.getTitle()).thenReturn("Featured");
    when(prompt.getDescription()).thenReturn("Desc");
    when(promptRepository.findByFeaturedTrue()).thenReturn(List.of(prompt));

    List<FeaturedPromptDTO> result = service.getFeaturedPrompts();

    assertEquals(1, result.size());
    assertEquals("Featured", result.get(0).getTitle());
    assertEquals("Desc", result.get(0).getDescription());
    assertEquals(id, result.get(0).getPromptId());
  }

  // @Test
  // void testGetTopRankingPrompts() {
  //     TopRankingPromptDTO dto = new TopRankingPromptDTO(UUID.randomUUID(), "Top", 4.5);
  //     org.springframework.data.domain.Pageable pageable =
  // org.springframework.data.domain.PageRequest.of(0, 10);
  //     // when(analyticsRepository.findTopRankingPrompts(pageable)).thenReturn(List.of(dto));
  //     when(analyticsRepository.findTopRankingPrompts(any(Pageable.class)))
  //             .thenReturn(List.of(dto));

  //     List<TopRankingPromptDTO> result = service.getTopRankingPrompts();

  //     assertEquals(1, result.size());
  //     assertEquals("Top", result.get(0).getTitle());
  //     assertEquals(4.5, result.get(0).getAvgRating());
  // }

  @Test
  void testGetTopRankingPrompts() {
    TopRankingPromptDTO dto = new TopRankingPromptDTO(UUID.randomUUID(), "Top", 4.5);
    org.springframework.data.domain.Pageable pageable =
        org.springframework.data.domain.PageRequest.of(0, 3);
    when(analyticsRepository.findTopRankingPrompts(any(Pageable.class))).thenReturn(List.of(dto));

    List<TopRankingPromptDTO> result = service.getTopRankingPrompts();

    assertEquals(1, result.size());
    assertEquals("Top", result.get(0).getTitle());
    assertEquals(4.5, result.get(0).getAvgRating());
  }
}
