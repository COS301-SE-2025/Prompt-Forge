package com.fiveOps.promptforge.badges.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fiveOps.promptforge.badges.dto.BadgeDto;
import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.model.UserBadge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;
import com.fiveOps.promptforge.badges.repository.UserBadgeRepository;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

  @Mock private BadgeRepository badgeRepository;

  @Mock private UserBadgeRepository userBadgeRepository;

  @InjectMocks private BadgeService badgeService;

  private Badge testBadge;
  private UserBadge testUserBadge;
  private UUID testUserId;
  private UUID testBadgeId;

  @BeforeEach
  void setUp() {
    testUserId = UUID.randomUUID();
    testBadgeId = UUID.randomUUID();

    testBadge = new Badge();
    testBadge.setBadgeId(testBadgeId);
    testBadge.setName("Test Badge");
    testBadge.setDescription("A test badge for unit testing");
    testBadge.setIcon("award"); // Using Lucide icon name instead of URL
    testBadge.setColor("#3ebb9e");
    testBadge.setCategory("achievement");
    testBadge.setRarity("common");
    testBadge.setIsActive(true);
    testBadge.setCreatedAt(LocalDateTime.now());
    testBadge.setUpdatedAt(LocalDateTime.now());

    testUserBadge = new UserBadge();
    testUserBadge.setUserBadgeId(UUID.randomUUID());
    testUserBadge.setUserId(testUserId);
    testUserBadge.setBadgeId(testBadgeId);
    testUserBadge.setProgress(75);
    testUserBadge.setIsVisible(true);
    testUserBadge.setEarnedAt(LocalDateTime.now()); // All UserBadges have earnedAt by default
  }

  @Test
  void getAllActiveBadges_ShouldReturnAllActiveBadges() {
    // Arrange
    List<Badge> badges = Arrays.asList(testBadge);
    when(badgeRepository.findByIsActiveTrue()).thenReturn(badges);

    // Act
    List<BadgeDto> result = badgeService.getAllActiveBadges();

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Test Badge", result.get(0).getName());
    assertEquals("A test badge for unit testing", result.get(0).getDescription());
    assertEquals("#3ebb9e", result.get(0).getColor());
    verify(badgeRepository, times(1)).findByIsActiveTrue();
  }

  @Test
  void getUserBadges_ShouldReturnUserBadgesWithProgress() {
    // Arrange
    List<UserBadge> userBadges = Arrays.asList(testUserBadge);
    when(userBadgeRepository.findByUserId(testUserId)).thenReturn(userBadges);

    // Act
    List<BadgeDto> result = badgeService.getUserBadges(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    BadgeDto badgeDto = result.get(0);
    assertEquals("Test Badge", badgeDto.getName());
    assertEquals(75, badgeDto.getProgress().intValue());
    assertNotNull(badgeDto.getEarnedAt()); // Has earnedAt timestamp
    verify(userBadgeRepository, times(1)).findByUserId(testUserId);
  }

  @Test
  void getUserEarnedBadges_ShouldReturnOnlyEarnedBadges() {
    // Arrange
    testUserBadge.setProgress(100);
    testUserBadge.setEarnedAt(LocalDateTime.now());
    List<UserBadge> earnedBadges = Arrays.asList(testUserBadge);
    when(userBadgeRepository.findEarnedVisibleBadgesByUserId(testUserId)).thenReturn(earnedBadges);

    // Act
    List<BadgeDto> result = badgeService.getUserEarnedBadges(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    BadgeDto badgeDto = result.get(0);
    assertEquals("Test Badge", badgeDto.getName());
    assertEquals(100, badgeDto.getProgress().intValue());
    assertNotNull(badgeDto.getEarnedAt());
    verify(userBadgeRepository, times(1)).findEarnedVisibleBadgesByUserId(testUserId);
  }

  @Test
  void getUserBadgeCount_ShouldReturnCorrectCount() {
    // Arrange
    Long expectedCount = 5L;
    when(userBadgeRepository.countEarnedBadgesByUserId(testUserId)).thenReturn(expectedCount);

    // Act
    Long result = badgeService.getUserBadgeCount(testUserId);

    // Assert
    assertEquals(expectedCount, result);
    verify(userBadgeRepository, times(1)).countEarnedBadgesByUserId(testUserId);
  }

  @Test
  void toggleBadgeVisibility_ShouldToggleVisibility() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.of(testUserBadge));
    when(userBadgeRepository.save(any(UserBadge.class))).thenReturn(testUserBadge);

    // Act
    badgeService.toggleBadgeVisibility(testUserId, testBadgeId);

    // Assert
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(userBadgeRepository, times(1)).save(testUserBadge);
    assertFalse(testUserBadge.getIsVisible()); // Should be toggled from true to false
  }

  @Test
  void toggleBadgeVisibility_WithNonExistentBadge_ShouldThrowException() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.empty());

    // Act & Assert
    RuntimeException exception =
        assertThrows(
            RuntimeException.class,
            () -> {
              badgeService.toggleBadgeVisibility(testUserId, testBadgeId);
            });

    assertEquals("User badge not found", exception.getMessage());
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(userBadgeRepository, never()).save(any(UserBadge.class));
  }

  @Test
  void updateBadgeProgress_ShouldUpdateProgress() {
    // Arrange
    int newProgress = 90;
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.of(testUserBadge));
    when(userBadgeRepository.save(any(UserBadge.class))).thenReturn(testUserBadge);

    // Act
    badgeService.updateBadgeProgress(testUserId, testBadgeId, newProgress);

    // Assert
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(userBadgeRepository, times(1)).save(testUserBadge);
    assertEquals(newProgress, testUserBadge.getProgress().intValue());
  }

  @Test
  void updateBadgeProgress_WithNonExistentBadge_ShouldThrowException() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.empty());

    // Act & Assert
    RuntimeException exception =
        assertThrows(
            RuntimeException.class,
            () -> {
              badgeService.updateBadgeProgress(testUserId, testBadgeId, 50);
            });

    assertEquals("User badge not found", exception.getMessage());
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(userBadgeRepository, never()).save(any(UserBadge.class));
  }

  @Test
  void awardBadge_WithNewBadge_ShouldCreateAndAwardBadge() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.empty());
    when(badgeRepository.findById(testBadgeId)).thenReturn(Optional.of(testBadge));
    when(userBadgeRepository.save(any(UserBadge.class))).thenReturn(testUserBadge);

    // Act
    boolean result = badgeService.awardBadge(testUserId, testBadgeId);

    // Assert
    assertTrue(result);
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(badgeRepository, times(1)).findById(testBadgeId);
    verify(userBadgeRepository, times(1)).save(any(UserBadge.class));
  }

  @Test
  void awardBadge_WithExistingBadge_ShouldReturnFalse() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.of(testUserBadge));

    // Act
    boolean result = badgeService.awardBadge(testUserId, testBadgeId);

    // Assert
    assertFalse(result);
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(badgeRepository, never()).findById(any(UUID.class));
    verify(userBadgeRepository, never()).save(any(UserBadge.class));
  }

  @Test
  void awardBadge_WithNonExistentBadge_ShouldReturnFalse() {
    // Arrange
    when(userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId))
        .thenReturn(Optional.empty());
    when(badgeRepository.findById(testBadgeId)).thenReturn(Optional.empty());

    // Act
    boolean result = badgeService.awardBadge(testUserId, testBadgeId);

    // Assert
    assertFalse(result);
    verify(userBadgeRepository, times(1)).findByUserIdAndBadgeId(testUserId, testBadgeId);
    verify(badgeRepository, times(1)).findById(testBadgeId);
    verify(userBadgeRepository, never()).save(any(UserBadge.class));
  }
}
