package com.fiveOps.promptforge.dashboard.dash_controller;

import com.fiveOps.promptforge.dashboard.dash_services.DashboardService;
import com.fiveOps.promptforge.prompts.model.Prompt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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

@WebMvcTest(DashboardController.class)
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
}