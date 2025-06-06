package com.example.promptforge.dashboard.dashboard_controller;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.promptforge.dashboard.activity.ActivityRepository;
import com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO;
import com.example.promptforge.dashboard.dashboard_repo.DashboardRepository;
import com.example.promptforge.dashboard.dashboard_services.DashboardService;
import com.example.promptforge.dashboard.prompt.PromptMetadataRepo;
import com.example.promptforge.dashboard.prompt.PromptRepo;
import com.example.promptforge.promptstore.repository.PromptRepository;
import com.example.promptforge.user_profile.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private DashboardRepository dashboardRepository;
    
    @Mock
    private ActivityRepository activityRepository;
    
    // @Mock
    // private PromptRepo promptRepository;
    @Mock
    private PromptRepository promptRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PromptMetadataRepo promptMetadataRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getTotalPrompts_ShouldReturnCorrectCount() {
        when(promptRepository.count()).thenReturn(42L);
        long count = dashboardService.getTotalPrompts();
        assertEquals(42L, count);
    }

    @Test
    void getAverageRating_ShouldReturnCalculatedAverage() {
        when(promptMetadataRepository.calculateAverageRating()).thenReturn(4.5);
        double rating = dashboardService.getAverageRating();
        assertEquals(4.5, rating);
    }

    @Test
    void getAverageRating_ShouldReturnZeroWhenNull() {
        when(promptMetadataRepository.calculateAverageRating()).thenReturn(null);
        double rating = dashboardService.getAverageRating();
        assertEquals(0.0, rating);
    }

    @Test
    void getTopPrompts_ShouldReturnListOfTopPrompts() {
        // Arrange
        TopPromptDTO dto1 = new TopPromptDTO("Prompt 1", 100, 4.5);
        TopPromptDTO dto2 = new TopPromptDTO("Prompt 2", 80, 4.2);
        when(dashboardRepository.findTopPrompts()).thenReturn(Arrays.asList(dto1, dto2));

        // Act
        List<TopPromptDTO> result = dashboardService.getTopPrompts();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Prompt 1", result.get(0).getTitle());
        // assertEquals(100, result.get(0).getViewCount());
        // assertEquals(4.5, result.get(0).getAverageRating());
    }

    @Test
    void getTotalUsers_ShouldReturnCorrectCount() {
        when(userRepository.count()).thenReturn(10L);
        long count = dashboardService.getTotalUsers();
        assertEquals(10L, count);
    }

    // @Test
    // void getTotalActivities_ShouldReturnCorrectCount() {
    //     // when(activityRepository.count()).thenReturn(50L);
    //     // long count = dashboardService.getTotalActivities();
    //     // assertEquals(50L, count);
    // }
    
    // @Test
    // void testMethod1() {
    //     // Dummy test
    //     assertTrue(true);
    // }
     
}