package com.fiveOps.promptforge.analytics.ana_controller;
// package com.fiveOps.promptforge.analytics.ana_controller;

// import com.fiveOps.promptforge.analytics.ana_dto.*;
// import com.fiveOps.promptforge.analytics.ana_services.PromptAnalyticsService;
// import org.junit.jupiter.api.Test;
// import org.mockito.Mockito;
// import org.springframework.http.MediaType;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.setup.MockMvcBuilders;

// import java.util.List;
// import java.util.UUID;

// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// class PromptAnalyticsControllerTest {

//     @Test
//     void testEndpoints() throws Exception {
//         PromptAnalyticsService service = Mockito.mock(PromptAnalyticsService.class);
//         when(service.getTrendingPrompts()).thenReturn(List.of(new TrendingPromptDTO(UUID.randomUUID(), "T", 1)));
//         when(service.getFeaturedPrompts()).thenReturn(List.of(new FeaturedPromptDTO(UUID.randomUUID(), "F", "D")));
//         when(service.getTopRankingPrompts()).thenReturn(List.of(new TopRankingPromptDTO(UUID.randomUUID(), "R", 5.0)));

//         PromptAnalyticsController controller = new PromptAnalyticsController(service);
//         MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

//         mockMvc.perform(get("/api/analytics/trending").accept(MediaType.APPLICATION_JSON))
//                 .andExpect(status().isOk());
//         mockMvc.perform(get("/api/analytics/featured").accept(MediaType.APPLICATION_JSON))
//                 .andExpect(status().isOk());
//         mockMvc.perform(get("/api/analytics/top-ranking").accept(MediaType.APPLICATION_JSON))
//                 .andExpect(status().isOk());
//     }
// }