package com.fiveOps.promptforge.badges.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.badges.dto.BadgeDto;
import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.model.UserBadge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;
import com.fiveOps.promptforge.badges.repository.UserBadgeRepository;

@Service
public class BadgeService {

  @Autowired private BadgeRepository badgeRepository;

  @Autowired private UserBadgeRepository userBadgeRepository;

  // Get all active badges
  public List<BadgeDto> getAllActiveBadges() {
    return badgeRepository.findAllActiveOrderByRarity().stream()
        .map(this::mapToDto)
        .collect(Collectors.toList());
  }

  // Get badges for a specific user (with progress and earned status)
  public List<BadgeDto> getUserBadges(UUID userId) {
    List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
    List<Badge> allBadges = badgeRepository.findByIsActiveTrue();

    return allBadges.stream()
        .map(
            badge -> {
              BadgeDto dto = mapToDto(badge);

              // Find user's progress for this badge
              UserBadge userBadge =
                  userBadges.stream()
                      .filter(ub -> ub.getBadgeId().equals(badge.getBadgeId()))
                      .findFirst()
                      .orElse(null);

              if (userBadge != null) {
                dto.setProgress(userBadge.getProgress());
                dto.setIsVisible(userBadge.getIsVisible());
                if (userBadge.getProgress() >= 100) {
                  dto.setEarnedAt(userBadge.getEarnedAt());
                }
              } else {
                dto.setProgress(0);
                dto.setIsVisible(true);
              }

              return dto;
            })
        .collect(Collectors.toList());
  }

  // Get only earned and visible badges for a user (for profile display)
  public List<BadgeDto> getUserEarnedBadges(UUID userId) {
    List<UserBadge> earnedBadges = userBadgeRepository.findEarnedVisibleBadgesByUserId(userId);

    return earnedBadges.stream()
        .map(
            userBadge -> {
              Badge badge = badgeRepository.findById(userBadge.getBadgeId()).orElse(null);
              if (badge != null) {
                BadgeDto dto = mapToDto(badge);
                dto.setProgress(userBadge.getProgress());
                dto.setEarnedAt(userBadge.getEarnedAt());
                dto.setIsVisible(userBadge.getIsVisible());
                return dto;
              }
              return null;
            })
        .filter(dto -> dto != null)
        .collect(Collectors.toList());
  }

  // Award a badge to a user
  public boolean awardBadge(UUID userId, UUID badgeId) {
    // Check if badge exists and is active
    Badge badge = badgeRepository.findById(badgeId).orElse(null);
    if (badge == null || !badge.getIsActive()) {
      return false;
    }

    // Check if user already has this badge
    UserBadge existingUserBadge =
        userBadgeRepository.findByUserIdAndBadgeId(userId, badgeId).orElse(null);

    if (existingUserBadge != null) {
      // Update progress to 100% if not already earned
      if (existingUserBadge.getProgress() < 100) {
        existingUserBadge.setProgress(100);
        existingUserBadge.setEarnedAt(LocalDateTime.now());
        userBadgeRepository.save(existingUserBadge);
        return true;
      }
      return false; // Already earned
    } else {
      // Create new user badge
      UserBadge userBadge = new UserBadge(userId, badgeId);
      userBadge.setProgress(100);
      userBadge.setEarnedAt(LocalDateTime.now());
      userBadgeRepository.save(userBadge);
      return true;
    }
  }

  // Update badge progress for a user
  public void updateBadgeProgress(UUID userId, UUID badgeId, int progress) {
    UserBadge userBadge =
        userBadgeRepository
            .findByUserIdAndBadgeId(userId, badgeId)
            .orElse(new UserBadge(userId, badgeId));

    userBadge.setProgress(Math.min(100, Math.max(0, progress)));
    if (userBadge.getProgress() >= 100 && userBadge.getEarnedAt() == null) {
      userBadge.setEarnedAt(LocalDateTime.now());
    }

    userBadgeRepository.save(userBadge);
  }

  // Toggle badge visibility for a user
  public void toggleBadgeVisibility(UUID userId, UUID badgeId) {
    UserBadge userBadge = userBadgeRepository.findByUserIdAndBadgeId(userId, badgeId).orElse(null);
    if (userBadge != null) {
      userBadge.setIsVisible(!userBadge.getIsVisible());
      userBadgeRepository.save(userBadge);
    }
  }

  // Get badge count for user
  public Long getUserBadgeCount(UUID userId) {
    return userBadgeRepository.countEarnedBadgesByUserId(userId);
  }

  // Helper method to map Badge to BadgeDto
  private BadgeDto mapToDto(Badge badge) {
    BadgeDto dto = new BadgeDto();
    dto.setBadgeId(badge.getBadgeId());
    dto.setName(badge.getName());
    dto.setDescription(badge.getDescription());
    dto.setIcon(badge.getIcon());
    dto.setColor(badge.getColor());
    dto.setCategory(badge.getCategory());
    dto.setRarity(badge.getRarity());
    dto.setIsActive(badge.getIsActive());
    dto.setCreatedAt(badge.getCreatedAt());
    dto.setUpdatedAt(badge.getUpdatedAt());
    return dto;
  }
}
