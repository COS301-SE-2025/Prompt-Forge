package com.fiveOps.promptforge.dashboard.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fiveOps.promptforge.dashboard.services.DashboardService;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

  @Mock private DashboardService dashboardService;

  @Mock private UserRepository userRepository;

  @Mock private Principal principal;

  @InjectMocks private DashboardController dashboardController;

  private final UUID testUserId = UUID.randomUUID();
  private final String testEmail = "test@example.com";

  @Test
  void getDashboard_shouldReturnDataForAuthenticatedUser() {
    // Setup
    User testUser = new User();
    testUser.setUserId(testUserId);

    // Allow multiple calls to principal.getName()
    when(principal.getName()).thenReturn(testEmail);

    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

    when(dashboardService.getTotalPrompts(testUserId)).thenReturn(10L);
    when(dashboardService.getAverageRating(testUserId)).thenReturn(4.5);
    when(dashboardService.getTotalDownloads(testUserId)).thenReturn(100L);
    when(dashboardService.getTopPrompts(testUserId, 5)).thenReturn(List.of(new Prompt()));
    when(dashboardService.getMonthlyPromptCount(testUserId)).thenReturn(5L);

    // Execute
    Map<String, Object> result = dashboardController.getDashboard(principal);

    // Verify
    assertEquals(10L, result.get("totalPrompts"));
    assertEquals(4.5, result.get("averageRating"));
    assertEquals(100L, result.get("totalDownloads"));
    assertNotNull(result.get("topPrompts"));
    assertEquals(5L, result.get("monthlyUsage"));

    // Verify principal.getName() was called (don't specify exact count)
    verify(principal, atLeastOnce()).getName();
    verify(userRepository).findByEmail(testEmail);
    verify(dashboardService).getTotalPrompts(testUserId);
    verify(dashboardService).getAverageRating(testUserId);
    verify(dashboardService).getTotalDownloads(testUserId);
    verify(dashboardService).getTopPrompts(testUserId, 5);
    verify(dashboardService).getMonthlyPromptCount(testUserId);
  }

  @Test
  void getDashboard_shouldReturnDummyDataWhenUserNotFound() {
    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

    Map<String, Object> result = dashboardController.getDashboard(principal);

    assertEquals(12, result.get("totalPrompts"));
    assertEquals(4.6, result.get("averageRating"));
    assertEquals(3847, result.get("totalDownloads"));
    assertTrue(((List<?>) result.get("topPrompts")).isEmpty());
    assertEquals(1250, result.get("monthlyUsage"));
  }

  @Test
  void getDashboard_shouldReturnDummyDataWhenPrincipalNull() {
    Map<String, Object> result = dashboardController.getDashboard(null);

    assertEquals(12, result.get("totalPrompts"));
    assertEquals(4.6, result.get("averageRating"));
    assertEquals(3847, result.get("totalDownloads"));
    assertTrue(((List<?>) result.get("topPrompts")).isEmpty());
    assertEquals(1250, result.get("monthlyUsage"));
  }

  @Test
  void getDashboard_shouldReturnDummyDataWhenServiceThrowsException() {
    User testUser = new User();
    testUser.setUserId(testUserId);

    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
    when(dashboardService.getTotalPrompts(testUserId))
        .thenThrow(new RuntimeException("Test exception"));

    Map<String, Object> result = dashboardController.getDashboard(principal);

    assertEquals(12, result.get("totalPrompts"));
    assertEquals(4.6, result.get("averageRating"));
    assertEquals(3847, result.get("totalDownloads"));
    assertTrue(((List<?>) result.get("topPrompts")).isEmpty());
    assertEquals(1250, result.get("monthlyUsage"));
  }

  @Test
  void getCategoryBreakdown_WithValidUser_ShouldReturnBreakdown() {
    // Setup
    User testUser = new User();
    testUser.setUserId(testUserId);
    List<Object[]> mockData =
        List.of(new Object[] {"Category1", 5L}, new Object[] {"Category2", 3L});

    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
    when(dashboardService.getCategoryBreakdown(testUserId)).thenReturn(mockData);

    // Execute
    Map<String, Long> result = dashboardController.getCategoryBreakdown(principal);

    // Verify
    assertEquals(2, result.size());
    assertEquals(5L, result.get("Category1"));
    assertEquals(3L, result.get("Category2"));
    verify(dashboardService).getCategoryBreakdown(testUserId);
  }

  @Test
  void getCategoryBreakdown_WithNullData_ShouldHandleGracefully() {
    // Setup
    User testUser = new User();
    testUser.setUserId(testUserId);
    List<Object[]> mockData =
        (List<Object[]>) List.of(new Object[] {"Unknown", 0L}, new Object[] {"Unknown", 0L});

    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
    when(dashboardService.getCategoryBreakdown(testUserId)).thenReturn(mockData);

    // Execute
    Map<String, Long> result = dashboardController.getCategoryBreakdown(principal);

    // Verify
    assertNotNull(result);
    assertTrue(result.containsKey("Unknown"));
    assertEquals(Long.valueOf(0L), result.get("Unknown"));
  }

  @Test
  void getCategoryBreakdown_WithUnauthenticatedUser_ShouldReturnEmptyMap() {
    // Setup
    when(principal.getName()).thenReturn(null);

    // Execute
    Map<String, Long> result = dashboardController.getCategoryBreakdown(principal);

    // Verify
    assertTrue(result.isEmpty());
    // No service calls should be made for unauthenticated user
  }

  @Test
  void getMonthlyPromptCounts_WithValidUser_ShouldReturnCounts() {
    // Setup
    User testUser = new User();
    testUser.setUserId(testUserId);
    List<Object[]> mockData = List.of(new Object[] {1, 10L}, new Object[] {2, 15L});

    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
    when(dashboardService.getMonthlyPromptCounts(testUserId, java.time.LocalDate.now().getYear()))
        .thenReturn(mockData);

    // Execute
    Map<Integer, Long> result = dashboardController.getMonthlyPromptCounts(principal);

    // Verify
    assertEquals(2, result.size());
    assertEquals(10L, result.get(1));
    assertEquals(15L, result.get(2));
    verify(dashboardService)
        .getMonthlyPromptCounts(testUserId, java.time.LocalDate.now().getYear());
  }

  @Test
  void getMonthlyPromptCounts_WithNullData_ShouldHandleGracefully() {
    // Setup
    User testUser = new User();
    testUser.setUserId(testUserId);
    List<Object[]> mockData = List.of(new Object[] {null, null}, new Object[] {null, null});

    when(principal.getName()).thenReturn(testEmail);
    when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
    when(dashboardService.getMonthlyPromptCounts(testUserId, java.time.LocalDate.now().getYear()))
        .thenReturn(mockData);

    // Execute
    Map<Integer, Long> result = dashboardController.getMonthlyPromptCounts(principal);

    // Verify
    assertTrue(result.isEmpty());
  }

  @Test
  void getMonthlyPromptCounts_WithUnauthenticatedUser_ShouldReturnEmptyMap() {
    // Setup
    when(principal.getName()).thenReturn(null);

    // Execute
    Map<Integer, Long> result = dashboardController.getMonthlyPromptCounts(principal);

    // Verify
    assertTrue(result.isEmpty());
  }
}
