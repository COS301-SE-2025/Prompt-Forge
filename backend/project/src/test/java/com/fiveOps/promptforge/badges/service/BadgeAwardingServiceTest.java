package com.fiveOps.promptforge.badges.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class BadgeAwardingServiceTest {

  @Mock private BadgeRepository badgeRepository;

  @Mock private BadgeService badgeService;

  @Mock private PromptRepository promptRepository;

  @Mock private UserRepository userRepository;

  @InjectMocks private BadgeAwardingService badgeAwardingService;

  private UUID testUserId;
  private Badge firstPromptBadge;
  private Badge prolificCreatorBadge;
  private Badge promptMasterBadge;
  private Badge communityLegendBadge;

  @BeforeEach
  void setUp() {
    testUserId = UUID.randomUUID();

    // First Prompt Badge
    firstPromptBadge = new Badge();
    firstPromptBadge.setBadgeId(UUID.randomUUID());
    firstPromptBadge.setName("First Prompt");
    firstPromptBadge.setDescription("Created your first prompt");
    firstPromptBadge.setCategory("milestone");
    firstPromptBadge.setIsActive(true);

    // Prolific Creator Badge (10 prompts)
    prolificCreatorBadge = new Badge();
    prolificCreatorBadge.setBadgeId(UUID.randomUUID());
    prolificCreatorBadge.setName("Prolific Creator");
    prolificCreatorBadge.setDescription("Created 10 prompts");
    prolificCreatorBadge.setCategory("achievement");
    prolificCreatorBadge.setIsActive(true);

    // Prompt Master Badge (50 prompts)
    promptMasterBadge = new Badge();
    promptMasterBadge.setBadgeId(UUID.randomUUID());
    promptMasterBadge.setName("Prompt Master");
    promptMasterBadge.setDescription("Created 50 prompts");
    promptMasterBadge.setCategory("mastery");
    promptMasterBadge.setIsActive(true);

    // Community Legend Badge (100 prompts)
    communityLegendBadge = new Badge();
    communityLegendBadge.setBadgeId(UUID.randomUUID());
    communityLegendBadge.setName("Community Legend");
    communityLegendBadge.setDescription("Created 100 prompts");
    communityLegendBadge.setCategory("legendary");
    communityLegendBadge.setIsActive(true);
  }

  @Test
  void checkAndAwardAllBadges_WithOnePrompt_ShouldAwardFirstPromptBadge() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(1L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.of(firstPromptBadge));
    when(badgeService.awardBadge(testUserId, firstPromptBadge.getBadgeId())).thenReturn(true);

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).count();
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeService, times(1)).awardBadge(testUserId, firstPromptBadge.getBadgeId());
  }

  @Test
  void checkAndAwardAllBadges_WithTenPrompts_ShouldAwardMultipleBadges() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(10L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.of(firstPromptBadge));
    when(badgeRepository.findByName("Prolific Creator"))
        .thenReturn(Optional.of(prolificCreatorBadge));
    when(badgeService.awardBadge(any(UUID.class), any(UUID.class))).thenReturn(true);

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeRepository, times(1)).findByName("Prolific Creator");
    verify(badgeService, times(1)).awardBadge(testUserId, firstPromptBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, prolificCreatorBadge.getBadgeId());
  }

  @Test
  void checkAndAwardAllBadges_WithNoPrompts_ShouldNotAwardAnyBadges() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(0L);
    when(badgeRepository.count()).thenReturn(5L);

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).count();
    verify(badgeRepository, never()).findByName(anyString());
    verify(badgeService, never()).awardBadge(any(), any());
  }

  @Test
  void checkAndAwardAllBadges_WithFiftyPrompts_ShouldAwardMasterLevelBadges() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(50L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.of(firstPromptBadge));
    when(badgeRepository.findByName("Prolific Creator"))
        .thenReturn(Optional.of(prolificCreatorBadge));
    when(badgeRepository.findByName("Prompt Master")).thenReturn(Optional.of(promptMasterBadge));
    when(badgeService.awardBadge(any(UUID.class), any(UUID.class))).thenReturn(true);

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeRepository, times(1)).findByName("Prolific Creator");
    verify(badgeRepository, times(1)).findByName("Prompt Master");
    verify(badgeService, times(1)).awardBadge(testUserId, firstPromptBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, prolificCreatorBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, promptMasterBadge.getBadgeId());
  }

  @Test
  void checkAndAwardAllBadges_WithHundredPrompts_ShouldAwardAllBadges() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(100L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.of(firstPromptBadge));
    when(badgeRepository.findByName("Prolific Creator"))
        .thenReturn(Optional.of(prolificCreatorBadge));
    when(badgeRepository.findByName("Prompt Master")).thenReturn(Optional.of(promptMasterBadge));
    when(badgeRepository.findByName("Community Legend"))
        .thenReturn(Optional.of(communityLegendBadge));
    when(badgeService.awardBadge(any(UUID.class), any(UUID.class))).thenReturn(true);

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).findByName("Community Legend");
    verify(badgeRepository, times(1)).findByName("Prompt Master");
    verify(badgeRepository, times(1)).findByName("Prolific Creator");
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeService, times(1)).awardBadge(testUserId, communityLegendBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, promptMasterBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, prolificCreatorBadge.getBadgeId());
    verify(badgeService, times(1)).awardBadge(testUserId, firstPromptBadge.getBadgeId());
  }

  @Test
  void checkAndAwardEarlyAdopterBadge_WithFewUsers_ShouldAwardBadge() {
    // Arrange
    Badge earlyAdopterBadge = new Badge();
    earlyAdopterBadge.setBadgeId(UUID.randomUUID());
    earlyAdopterBadge.setName("Early Adopter");
    earlyAdopterBadge.setDescription("Joined in the first month");

    when(userRepository.count()).thenReturn(50L);
    when(badgeRepository.findByName("Early Adopter")).thenReturn(Optional.of(earlyAdopterBadge));
    when(badgeService.awardBadge(testUserId, earlyAdopterBadge.getBadgeId())).thenReturn(true);

    // Act
    badgeAwardingService.checkAndAwardEarlyAdopterBadge(testUserId);

    // Assert
    verify(userRepository, times(1)).count();
    verify(badgeRepository, times(1)).findByName("Early Adopter");
    verify(badgeService, times(1)).awardBadge(testUserId, earlyAdopterBadge.getBadgeId());
  }

  @Test
  void checkAndAwardEarlyAdopterBadge_WithManyUsers_ShouldNotAwardBadge() {
    // Arrange
    when(userRepository.count()).thenReturn(150L);

    // Act
    badgeAwardingService.checkAndAwardEarlyAdopterBadge(testUserId);

    // Assert
    verify(userRepository, times(1)).count();
    verify(badgeRepository, never()).findByName(anyString());
    verify(badgeService, never()).awardBadge(any(), any());
  }

  @Test
  void checkAndAwardAllBadges_WithNonExistentBadge_ShouldHandleGracefully() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(1L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.empty());

    // Act
    badgeAwardingService.checkAndAwardAllBadges(testUserId);

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeService, never()).awardBadge(any(), any());
  }

  @Test
  void checkAndAwardAllBadges_WithBadgeServiceException_ShouldContinueProcessing() {
    // Arrange
    when(promptRepository.countByAuthorId(testUserId)).thenReturn(1L);
    when(badgeRepository.count()).thenReturn(5L);
    when(badgeRepository.findByName("First Prompt")).thenReturn(Optional.of(firstPromptBadge));
    when(badgeService.awardBadge(testUserId, firstPromptBadge.getBadgeId()))
        .thenThrow(new RuntimeException("Award failed"));

    // Act - Should not throw exception
    assertDoesNotThrow(
        () -> {
          badgeAwardingService.checkAndAwardAllBadges(testUserId);
        });

    // Assert
    verify(promptRepository, times(1)).countByAuthorId(testUserId);
    verify(badgeRepository, times(1)).findByName("First Prompt");
    verify(badgeService, times(1)).awardBadge(testUserId, firstPromptBadge.getBadgeId());
  }
}
