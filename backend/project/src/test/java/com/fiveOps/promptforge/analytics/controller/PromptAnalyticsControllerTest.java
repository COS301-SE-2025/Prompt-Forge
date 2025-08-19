package com.fiveOps.promptforge.analytics.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.services.PromptAnalyticsService;

class PromptAnalyticsControllerTest {

  @Test
  void testEndpoints_basicResponses() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    when(service.getTrendingPrompts())
        .thenReturn(List.of(new TrendingPromptDTO(UUID.randomUUID(), "T", 1)));
    when(service.getFeaturedPrompts())
        .thenReturn(List.of(new FeaturedPromptDTO(UUID.randomUUID(), "F", "D")));
    when(service.getTopRankingPrompts())
        .thenReturn(List.of(new TopRankingPromptDTO(UUID.randomUUID(), "R", 5.0)));

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/trending").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/api/analytics/featured").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/api/analytics/top-ranking").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void testEndpoints() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    when(service.getTrendingPrompts())
        .thenReturn(List.of(new TrendingPromptDTO(UUID.randomUUID(), "T", 1)));
    when(service.getFeaturedPrompts())
        .thenReturn(List.of(new FeaturedPromptDTO(UUID.randomUUID(), "F", "D")));
    when(service.getTopRankingPrompts())
        .thenReturn(List.of(new TopRankingPromptDTO(UUID.randomUUID(), "R", 5.0)));

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/trending").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/api/analytics/featured").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
    mockMvc
        .perform(get("/api/analytics/top-ranking").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void testTrendingPromptsReturnsCorrectData() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    TrendingPromptDTO dto = new TrendingPromptDTO(UUID.randomUUID(), "TrendingTitle", 42);
    when(service.getTrendingPrompts()).thenReturn(List.of(dto));

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/trending").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("TrendingTitle"))
        .andExpect(jsonPath("$[0].viewCount").value(42));
  }

  @Test
  void testFeaturedPromptsReturnsCorrectData() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    FeaturedPromptDTO dto =
        new FeaturedPromptDTO(UUID.randomUUID(), "FeaturedTitle", "Description");
    when(service.getFeaturedPrompts()).thenReturn(List.of(dto));

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/featured").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("FeaturedTitle"))
        .andExpect(jsonPath("$[0].description").value("Description"));
  }

  @Test
  void testTopRankingPromptsReturnsCorrectData() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    TopRankingPromptDTO dto = new TopRankingPromptDTO(UUID.randomUUID(), "TopRank", 4.5);
    when(service.getTopRankingPrompts()).thenReturn(List.of(dto));

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/top-ranking").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("TopRank"))
        .andExpect(jsonPath("$[0].avgRating").value(4.5));
  }

  @Test
  void testEmptyTrendingPrompts() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    when(service.getTrendingPrompts()).thenReturn(List.of());

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/trending").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }

  //   @Test
  //   void testEmptyFeaturedPrompts() throws Exception {
  //     PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
  //     when(service.getFeaturedPrompts()).thenReturn(List.of());

  //     PromptAnalyticsController controller = new PromptAnalyticsController(service);
  //     MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

  //     mockMvc
  //         .perform(get("/api/analytics/featured").accept(MediaType.APPLICATION_JSON))
  //         .andExpect(status().isOk())
  //         .andExpect(jsonPath("$").isEmpty());
  //   }

  @Test
  void testEmptyTopRankingPrompts() throws Exception {
    PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
    when(service.getTopRankingPrompts()).thenReturn(List.of());

    PromptAnalyticsController controller = new PromptAnalyticsController(service);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/analytics/top-ranking").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }
}
