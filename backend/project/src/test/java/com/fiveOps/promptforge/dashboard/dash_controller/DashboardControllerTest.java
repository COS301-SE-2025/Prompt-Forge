package com.fiveOps.promptforge.dashboard.dash_controller;

import com.fiveOps.promptforge.dashboard.dash_services.DashboardService;
import com.fiveOps.promptforge.prompts.model.Prompt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(DashboardController.class)
@WebMvcTest(
    controllers = DashboardController.class,
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, classes = com.fiveOps.promptforge.securityConfig.JwtFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    private UUID userId;
    private Prompt prompt;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        prompt = new Prompt();
        prompt.setId(UUID.randomUUID());
        prompt.setTitle("Test Prompt");
        prompt.setAuthorId(userId);
    }

    @Test
    void testGetDashboardReturnsDashboardData() throws Exception {
        Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(10L);
        Mockito.when(dashboardService.getAverageRating(any())).thenReturn(4.5);
        Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(100L);
        Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(prompt));
        Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(2L);

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPrompts").value(10))
                .andExpect(jsonPath("$.averageRating").value(4.5))
                .andExpect(jsonPath("$.totalDownloads").value(100))
                .andExpect(jsonPath("$.topPrompts[0].title").value("Test Prompt"))
                .andExpect(jsonPath("$.monthlyUsage").value(2));
    }

    @Test
    void testGetDashboardReturnsEmptyTopPrompts() throws Exception {
        Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(0L);
        Mockito.when(dashboardService.getAverageRating(any())).thenReturn(null);
        Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(null);
        Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(Collections.emptyList());
        Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(0L);

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPrompts").value(0))
                .andExpect(jsonPath("$.averageRating").doesNotExist())
                .andExpect(jsonPath("$.totalDownloads").doesNotExist())
                .andExpect(jsonPath("$.topPrompts").isArray())
                .andExpect(jsonPath("$.topPrompts").isEmpty())
                .andExpect(jsonPath("$.monthlyUsage").value(0));
    }

       
    
        @Test
        void testGetDashboardWithNullDashboardServiceResults() throws Exception {
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(0L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(null);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(null);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(null);
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(null);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalPrompts").value(0))
                    .andExpect(jsonPath("$.averageRating").doesNotExist())
                    .andExpect(jsonPath("$.totalDownloads").doesNotExist())
                    .andExpect(jsonPath("$.topPrompts").doesNotExist())
                    .andExpect(jsonPath("$.monthlyUsage").doesNotExist());
        }
    
        @Test
        void testGetDashboardWithMultipleTopPrompts() throws Exception {
            Prompt prompt2 = new Prompt();
            prompt2.setId(UUID.randomUUID());
            prompt2.setTitle("Prompt 2");
            prompt2.setAuthorId(userId);
    
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(2L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(5.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(200L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(prompt, prompt2));
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(1L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topPrompts[0].title").value("Test Prompt"))
                    .andExpect(jsonPath("$.topPrompts[1].title").value("Prompt 2"))
                    .andExpect(jsonPath("$.totalPrompts").value(2))
                    .andExpect(jsonPath("$.averageRating").value(5.0))
                    .andExpect(jsonPath("$.totalDownloads").value(200))
                    .andExpect(jsonPath("$.monthlyUsage").value(1));
        }
    
        @Test
        void testGetDashboardWithZeroMonthlyUsage() throws Exception {
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(5L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(3.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(50L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(prompt));
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(0L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.monthlyUsage").value(0));
        }
    
        @Test
        void testGetDashboardWithNegativeValues() throws Exception {
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(-1L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(-2.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(-3L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of());
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(-4L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalPrompts").value(-1))
                    .andExpect(jsonPath("$.averageRating").value(-2.0))
                    .andExpect(jsonPath("$.totalDownloads").value(-3))
                    .andExpect(jsonPath("$.monthlyUsage").value(-4));
        }
    
        @Test
        void testGetDashboardWithLargeNumbers() throws Exception {
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(1000000L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(9999.99);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(123456789L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(prompt));
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(50000L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalPrompts").value(1000000))
                    .andExpect(jsonPath("$.averageRating").value(9999.99))
                    .andExpect(jsonPath("$.totalDownloads").value(123456789))
                    .andExpect(jsonPath("$.monthlyUsage").value(50000));
        }
    
        @Test
        void testGetDashboardWithNullPromptFields() throws Exception {
            Prompt nullPrompt = new Prompt();
            nullPrompt.setId(null);
            nullPrompt.setTitle(null);
            nullPrompt.setAuthorId(null);
    
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(1L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(1.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(1L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(nullPrompt));
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(1L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topPrompts[0].id").doesNotExist())
                    .andExpect(jsonPath("$.topPrompts[0].title").doesNotExist())
                    .andExpect(jsonPath("$.topPrompts[0].authorId").doesNotExist());
        }
    
        @Test
        void testGetDashboardWithEmptyPromptList() throws Exception {
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(0L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(0.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(0L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(Collections.emptyList());
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(0L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topPrompts").isArray())
                    .andExpect(jsonPath("$.topPrompts").isEmpty());
        }
    
        @Test
        void testGetDashboardWithFiveTopPrompts() throws Exception {
            Prompt prompt2 = new Prompt();
            prompt2.setId(UUID.randomUUID());
            prompt2.setAuthorId(userId);
            prompt2.setTitle("Prompt 2");

            Prompt prompt3 = new Prompt();
            prompt3.setId(UUID.randomUUID());
            prompt3.setAuthorId(userId);
            prompt3.setTitle("Prompt 3");

            Prompt prompt4 = new Prompt();
            prompt4.setId(UUID.randomUUID());
            prompt4.setAuthorId(userId);
            prompt4.setTitle("Prompt 4");

            Prompt prompt5 = new Prompt();
            prompt5.setId(UUID.randomUUID());
            prompt5.setAuthorId(userId);
            prompt5.setTitle("Prompt 5");

            List<Prompt> prompts = List.of(
                    prompt,
                    prompt2,
                    prompt3,
                    prompt4,
                    prompt5
            );
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(5L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(5.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(5L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(prompts);
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(5L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topPrompts.length()").value(5));
        }
    
        @Test
        void testGetDashboardWithSpecialCharactersInPromptTitle() throws Exception {
            Prompt specialPrompt = new Prompt();
            specialPrompt.setId(UUID.randomUUID());
            specialPrompt.setTitle("!@#$%^&*()_+|~=`{}[]:\";'<>?,./");
            specialPrompt.setAuthorId(userId);
    
            Mockito.when(dashboardService.getTotalPrompts(any())).thenReturn(1L);
            Mockito.when(dashboardService.getAverageRating(any())).thenReturn(1.0);
            Mockito.when(dashboardService.getTotalDownloads(any())).thenReturn(1L);
            Mockito.when(dashboardService.getTopPrompts(any(), eq(5))).thenReturn(List.of(specialPrompt));
            Mockito.when(dashboardService.getMonthlyPromptCount(any())).thenReturn(1L);
    
            mockMvc.perform(get("/api/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topPrompts[0].title").value("!@#$%^&*()_+|~=`{}[]:\";'<>?,./"));
}
}