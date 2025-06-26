package com.fiveOps.promptforge.dashboard.dash_service;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.dashboard.dash_repository.DashboardRepository;
import com.fiveOps.promptforge.dashboard.dash_services.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private DashboardRepository dashboardRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private final UUID testUserId = UUID.randomUUID();
    private final Prompt testPrompt = new Prompt();

    @BeforeEach
    void setUp() {
        testPrompt.setId(UUID.randomUUID());
    }

    @Test
    void getTotalPrompts_shouldReturnCountFromRepository() {
        when(dashboardRepository.countAllByUser(testUserId)).thenReturn(10L);
        
        long result = dashboardService.getTotalPrompts(testUserId);
        
        assertEquals(10L, result);
        verify(dashboardRepository).countAllByUser(testUserId);
    }

    @Test
    void getAverageRating_shouldReturnValueFromRepository() {
        when(dashboardRepository.averageRatingByUser(testUserId)).thenReturn(4.5);
        
        Double result = dashboardService.getAverageRating(testUserId);
        
        assertEquals(4.5, result);
        verify(dashboardRepository).averageRatingByUser(testUserId);
    }

    @Test
    void getAverageRating_shouldHandleNullFromRepository() {
        when(dashboardRepository.averageRatingByUser(testUserId)).thenReturn(null);
        
        Double result = dashboardService.getAverageRating(testUserId);
        
        assertNull(result);
    }

    @Test
    void getTotalDownloads_shouldReturnValueFromRepository() {
        when(dashboardRepository.totalDownloadsByUser(testUserId)).thenReturn(100L);
        
        Long result = dashboardService.getTotalDownloads(testUserId);
        
        assertEquals(100L, result);
        verify(dashboardRepository).totalDownloadsByUser(testUserId);
    }

    @Test
    void getTopPrompts_shouldReturnPromptsFromRepository() {
        List<Prompt> prompts = List.of(testPrompt);
        PageRequest pageRequest = PageRequest.of(0, 5);
        when(dashboardRepository.findTopPromptsByUser(testUserId, pageRequest)).thenReturn(prompts);
        
        List<Prompt> result = dashboardService.getTopPrompts(testUserId, 5);
        
        assertEquals(1, result.size());
        assertEquals(testPrompt.getId(), result.get(0).getId());
        verify(dashboardRepository).findTopPromptsByUser(testUserId, pageRequest);
    }

    @Test
    void getMonthlyPromptCount_shouldReturnCountFromRepository() {
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        when(dashboardRepository.monthlyPromptCountByUser(testUserId, currentYear, currentMonth)).thenReturn(5L);
        
        Long result = dashboardService.getMonthlyPromptCount(testUserId);
        
        assertEquals(5L, result);
        verify(dashboardRepository).monthlyPromptCountByUser(testUserId, currentYear, currentMonth);
    }

    @Test
    void getMonthlyPromptCount_shouldReturnZeroWhenNull() {
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        when(dashboardRepository.monthlyPromptCountByUser(testUserId, currentYear, currentMonth)).thenReturn(null);
        
        Long result = dashboardService.getMonthlyPromptCount(testUserId);
        
        assertEquals(0L, result);
    }
}