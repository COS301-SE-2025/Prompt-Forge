package com.fiveOps.promptforge.analytics.ana_services;


// import com.fiveOps.promptforge.analytics.ana_dto.*;
// import com.fiveOps.promptforge.analytics.ana_repository.PromptAnalyticsRepository;
// import com.fiveOps.promptforge.prompts.repository.PromptRepository;
// import org.junit.jupiter.api.Test;
// import org.mockito.Mockito;

// import java.util.Collections;
// import java.util.List;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// class PromptAnalyticsServiceImplTest {

//     @Test
//     void testGetTrendingPrompts() {
//         PromptAnalyticsRepository analyticsRepo = mock(PromptAnalyticsRepository.class);
//         PromptRepository promptRepo = mock(PromptRepository.class);

//         TrendingPromptDTO dto = new TrendingPromptDTO(/* mock data */null, "Test", 10);
//         when(analyticsRepo.findTrendingPrompts()).thenReturn(List.of(dto));

//         PromptAnalyticsServiceImpl service = new PromptAnalyticsServiceImpl(analyticsRepo, promptRepo);

//         List<TrendingPromptDTO> result = service.getTrendingPrompts();
//         assertEquals(1, result.size());
//         assertEquals("Test", result.get(0).getTitle());
//     }

//     @Test
//     void testGetFeaturedPrompts() {
//         PromptAnalyticsRepository analyticsRepo = mock(PromptAnalyticsRepository.class);
//         PromptRepository promptRepo = mock(PromptRepository.class);

//         // Mock a prompt object with needed getters
//         Object prompt = mock(Object.class, invocation -> {
//             switch (invocation.getMethod().getName()) {
//                 case "getId": return java.util.UUID.randomUUID();
//                 case "getTitle": return "Featured";
//                 case "getDescription": return "Desc";
//                 default: return null;
//             }
//         });

//         when(promptRepo.findByFeaturedTrue()).thenReturn(List.of(prompt));

//         PromptAnalyticsServiceImpl service = new PromptAnalyticsServiceImpl(analyticsRepo, promptRepo);

//         List<FeaturedPromptDTO> result = service.getFeaturedPrompts();
//         assertEquals(1, result.size());
//         assertEquals("Featured", result.get(0).getTitle());
//     }

//     @Test
//     void testGetTopRankingPrompts() {
//         PromptAnalyticsRepository analyticsRepo = mock(PromptAnalyticsRepository.class);
//         PromptRepository promptRepo = mock(PromptRepository.class);

//         TopRankingPromptDTO dto = new TopRankingPromptDTO(/* mock data */null, "Top", 5.0);
//         when(analyticsRepo.findTopRankingPrompts()).thenReturn(List.of(dto));

//         PromptAnalyticsServiceImpl service = new PromptAnalyticsServiceImpl(analyticsRepo, promptRepo);

//         List<TopRankingPromptDTO> result = service.getTopRankingPrompts();
//         assertEquals(1, result.size());
//         assertEquals("Top", result.get(0).getTitle());
//     }
// }

import com.fiveOps.promptforge.analytics.ana_dto.*;
import com.fiveOps.promptforge.analytics.ana_repository.PromptAnalyticsRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    // @Test
    // void testGetTrendingPrompts() {
    //     TrendingPromptDTO dto = new TrendingPromptDTO(UUID.randomUUID(), "Trending", 100);
    //     java.time.LocalDate today = java.time.LocalDate.now();
    //     when(analyticsRepository.findTrendingPrompts(today)).thenReturn(List.of(dto));

    //     List<TrendingPromptDTO> result = service.getTrendingPrompts();

    //     assertEquals(1, result.size());
    //     assertEquals("Trending", result.get(0).getTitle());
    //     assertEquals(100, result.get(0).getViewCount());
    // }
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

    @Test
    void testGetTopRankingPrompts() {
        TopRankingPromptDTO dto = new TopRankingPromptDTO(UUID.randomUUID(), "Top", 4.5);
        when(analyticsRepository.findTopRankingPrompts()).thenReturn(List.of(dto));

        List<TopRankingPromptDTO> result = service.getTopRankingPrompts();

        assertEquals(1, result.size());
        assertEquals("Top", result.get(0).getTitle());
        assertEquals(4.5, result.get(0).getAvgRating());
    }
}