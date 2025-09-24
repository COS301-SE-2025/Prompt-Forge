package com.fiveOps.promptforge.badges.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.model.UserBadge;

@DataJpaTest
class UserBadgeRepositoryTest {

  @Autowired private TestEntityManager entityManager;

  @Autowired private UserBadgeRepository userBadgeRepository;

  private UUID testUserId;
  private UUID testBadgeId;
  private Badge testBadge;
  private UserBadge testUserBadge;

  @BeforeEach
  void setUp() {
    testUserId = UUID.randomUUID();

    // Create and persist a test badge
    testBadge = new Badge();
    testBadge.setName("Test Badge");
    testBadge.setDescription("A test badge for unit testing");
    testBadge.setColor("#3ebb9e");
    testBadge.setCategory("achievement");
    testBadge.setRarity("common");
    testBadge.setIsActive(true);
    testBadge.setCreatedAt(LocalDateTime.now());
    testBadge.setUpdatedAt(LocalDateTime.now());
    testBadge = entityManager.persistAndFlush(testBadge);
    testBadgeId = testBadge.getBadgeId();

    // Create a test user badge
    testUserBadge = new UserBadge();
    testUserBadge.setUserId(testUserId);
    testUserBadge.setBadgeId(testBadgeId);
    testUserBadge.setProgress(75);
    testUserBadge.setIsVisible(true);
    testUserBadge.setEarnedAt(LocalDateTime.now().minusDays(1)); // Set as earned
  }

  @Test
  void findByUserId_ShouldReturnUserBadges() {
    // Arrange
    testUserBadge = entityManager.persistAndFlush(testUserBadge);

    // Act
    List<UserBadge> result = userBadgeRepository.findByUserId(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(testUserId, result.get(0).getUserId());
    assertEquals(testBadgeId, result.get(0).getBadgeId());
    assertEquals(75, result.get(0).getProgress().intValue());
  }

  @Test
  void findEarnedVisibleBadgesByUserId_ShouldReturnOnlyEarnedBadges() {
    // Arrange
    // Create an earned badge (progress >= 100)
    UserBadge earnedBadge = new UserBadge();
    earnedBadge.setUserId(testUserId);
    earnedBadge.setBadgeId(testBadgeId);
    earnedBadge.setProgress(100);
    earnedBadge.setIsVisible(true);
    earnedBadge.setEarnedAt(LocalDateTime.now());
    entityManager.persistAndFlush(earnedBadge);

    // Create an unearned badge (progress < 100)
    UserBadge unearnedBadge = new UserBadge();
    unearnedBadge.setUserId(testUserId);
    unearnedBadge.setBadgeId(UUID.randomUUID());
    unearnedBadge.setProgress(50);
    unearnedBadge.setIsVisible(true);
    unearnedBadge.setEarnedAt(LocalDateTime.now());
    entityManager.persistAndFlush(unearnedBadge);

    // Act
    List<UserBadge> result = userBadgeRepository.findEarnedVisibleBadgesByUserId(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(100, result.get(0).getProgress().intValue());
    assertTrue(result.get(0).getIsVisible());
  }

  @Test
  void countEarnedBadgesByUserId_ShouldReturnCorrectCount() {
    // Arrange
    // Create multiple earned badges (progress >= 100)
    for (int i = 0; i < 3; i++) {
      UserBadge userBadge = new UserBadge();
      userBadge.setUserId(testUserId);
      userBadge.setBadgeId(UUID.randomUUID());
      userBadge.setProgress(100);
      userBadge.setIsVisible(true);
      userBadge.setEarnedAt(LocalDateTime.now());
      entityManager.persistAndFlush(userBadge);
    }

    // Create one unearned badge (progress < 100)
    UserBadge unearnedBadge = new UserBadge();
    unearnedBadge.setUserId(testUserId);
    unearnedBadge.setBadgeId(UUID.randomUUID());
    unearnedBadge.setProgress(50);
    unearnedBadge.setIsVisible(true);
    unearnedBadge.setEarnedAt(LocalDateTime.now());
    entityManager.persistAndFlush(unearnedBadge);

    // Act
    Long count = userBadgeRepository.countEarnedBadgesByUserId(testUserId);

    // Assert
    assertEquals(3L, count);
  }

  @Test
  void findByUserIdAndBadgeId_ShouldReturnSpecificUserBadge() {
    // Arrange
    testUserBadge = entityManager.persistAndFlush(testUserBadge);

    // Act
    Optional<UserBadge> result =
        userBadgeRepository.findByUserIdAndBadgeId(testUserId, testBadgeId);

    // Assert
    assertTrue(result.isPresent());
    assertEquals(testUserId, result.get().getUserId());
    assertEquals(testBadgeId, result.get().getBadgeId());
    assertEquals(75, result.get().getProgress().intValue());
  }

  @Test
  void findByUserIdAndBadgeId_WithNonExistentBadge_ShouldReturnEmpty() {
    // Arrange
    UUID nonExistentBadgeId = UUID.randomUUID();

    // Act
    Optional<UserBadge> result =
        userBadgeRepository.findByUserIdAndBadgeId(testUserId, nonExistentBadgeId);

    // Assert
    assertFalse(result.isPresent());
  }

  @Test
  void save_ShouldPersistUserBadge() {
    // Act
    UserBadge saved = userBadgeRepository.save(testUserBadge);

    // Assert
    assertNotNull(saved.getUserBadgeId());
    assertEquals(testUserId, saved.getUserId());
    assertEquals(testBadgeId, saved.getBadgeId());
    assertEquals(75, saved.getProgress().intValue());
    assertTrue(saved.getIsVisible());
    assertNotNull(saved.getEarnedAt());
  }

  @Test
  void save_WithEarnedBadge_ShouldPersistEarnedAt() {
    // Arrange
    LocalDateTime earnedTime = LocalDateTime.now();
    testUserBadge.setProgress(100);
    testUserBadge.setEarnedAt(earnedTime);

    // Act
    UserBadge saved = userBadgeRepository.save(testUserBadge);

    // Assert
    assertNotNull(saved.getUserBadgeId());
    assertEquals(100, saved.getProgress().intValue());
    assertNotNull(saved.getEarnedAt());
    assertTrue(
        saved.getEarnedAt().isEqual(earnedTime)
            || saved.getEarnedAt().isAfter(earnedTime.minusSeconds(1)));
  }

  @Test
  void findByUserId_WithMultipleBadges_ShouldReturnAllUserBadges() {
    // Arrange
    UUID secondBadgeId = UUID.randomUUID();

    UserBadge secondUserBadge = new UserBadge();
    secondUserBadge.setUserId(testUserId);
    secondUserBadge.setBadgeId(secondBadgeId);
    secondUserBadge.setProgress(100);
    secondUserBadge.setIsVisible(false);
    secondUserBadge.setEarnedAt(LocalDateTime.now());

    entityManager.persistAndFlush(testUserBadge);
    entityManager.persistAndFlush(secondUserBadge);

    // Act
    List<UserBadge> result = userBadgeRepository.findByUserId(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());

    // Verify both badges are present by their IDs
    boolean firstBadgeFound = result.stream().anyMatch(ub -> testBadgeId.equals(ub.getBadgeId()));
    boolean secondBadgeFound =
        result.stream().anyMatch(ub -> secondBadgeId.equals(ub.getBadgeId()));

    assertTrue(firstBadgeFound);
    assertTrue(secondBadgeFound);
  }

  @Test
  void findInProgressBadgesByUserId_ShouldReturnOnlyInProgressBadges() {
    // Arrange
    // Create an in-progress badge (progress < 100)
    UserBadge inProgressBadge = new UserBadge();
    inProgressBadge.setUserId(testUserId);
    inProgressBadge.setBadgeId(UUID.randomUUID());
    inProgressBadge.setProgress(50);
    inProgressBadge.setIsVisible(true);
    inProgressBadge.setEarnedAt(LocalDateTime.now());
    entityManager.persistAndFlush(inProgressBadge);

    // Create a completed badge (progress >= 100)
    UserBadge completedBadge = new UserBadge();
    completedBadge.setUserId(testUserId);
    completedBadge.setBadgeId(UUID.randomUUID());
    completedBadge.setProgress(100);
    completedBadge.setIsVisible(true);
    completedBadge.setEarnedAt(LocalDateTime.now());
    entityManager.persistAndFlush(completedBadge);

    // Act
    List<UserBadge> result = userBadgeRepository.findInProgressBadgesByUserId(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(50, result.get(0).getProgress().intValue());
  }
}
