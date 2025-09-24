package com.fiveOps.promptforge.badges.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
public class BadgeAwardingService {

  @Autowired private BadgeService badgeService;

  @Autowired private BadgeRepository badgeRepository;

  @Autowired private PromptRepository promptRepository;

  @Autowired private UserRepository userRepository;

  // Check and award badges after a prompt is created
  @Transactional
  public void checkAndAwardBadgesAfterPromptCreation(UUID userId) {
    try {
      if (userId == null) {
        System.err.println("Cannot award badges: userId is null");
        return;
      }
      checkAndAwardAllBadges(userId);
    } catch (Exception e) {
      System.err.println("Error in checkAndAwardBadgesAfterPromptCreation: " + e.getMessage());
    }
  }

  // Check and award ALL qualifying badges based on current user stats
  @Transactional
  public void checkAndAwardAllBadges(UUID userId) {
    try {
      if (userId == null) {
        System.err.println("Cannot check badges: userId is null");
        return;
      }

      System.out.println("🚀 Starting badge check for user: " + userId);

      // Check if repositories are available
      if (promptRepository == null || badgeRepository == null || userRepository == null) {
        System.err.println("Required repositories not available for badge checking");
        return;
      }

      // Get user's prompt count
      long promptCount = promptRepository.countByAuthorId(userId);
      System.out.println("📊 User " + userId + " has authored " + promptCount + " prompts");

      // Check total badges in database
      long totalBadges = badgeRepository.count();
      System.out.println("🏆 Total badges in database: " + totalBadges);

      // Check for milestone badges - award ALL that qualify
      if (promptCount >= 100) {
        System.out.println("🎯 User qualifies for ALL milestone badges (100+ prompts)");
        awardBadgeByName(userId, "Community Legend");
        awardBadgeByName(userId, "Prompt Master");
        awardBadgeByName(userId, "Prolific Creator");
        awardBadgeByName(userId, "First Prompt");
      } else if (promptCount >= 50) {
        System.out.println("🎯 User qualifies for 50+ prompt badges");
        awardBadgeByName(userId, "Prompt Master");
        awardBadgeByName(userId, "Prolific Creator");
        awardBadgeByName(userId, "First Prompt");
      } else if (promptCount >= 10) {
        System.out.println("🎯 User qualifies for 10+ prompt badges");
        awardBadgeByName(userId, "Prolific Creator");
        awardBadgeByName(userId, "First Prompt");
      } else if (promptCount >= 1) {
        System.out.println("🎯 User qualifies for first prompt badge");
        awardBadgeByName(userId, "First Prompt");
      } else {
        System.out.println("⚠️ User has no prompts, no badges to award");
      }

      System.out.println("✅ Completed badge check for user " + userId);
    } catch (Exception e) {
      System.err.println("❌ Error checking badges for user " + userId + ": " + e.getMessage());
      e.printStackTrace();
    }
  }

  // Award early adopter badge (call this for first 100 users)
  public void checkAndAwardEarlyAdopterBadge(UUID userId) {
    try {
      if (userId == null || userRepository == null) {
        return;
      }
      long totalUsers = userRepository.count();
      if (totalUsers <= 100) {
        awardBadgeByName(userId, "Early Adopter");
      }
    } catch (Exception e) {
      System.err.println("Error checking early adopter badge: " + e.getMessage());
    }
  }

  // Helper method to award badge by name
  private void awardBadgeByName(UUID userId, String badgeName) {
    try {
      if (userId == null || badgeName == null || badgeRepository == null || badgeService == null) {
        System.err.println("Cannot award badge: missing required parameters or services");
        return;
      }

      System.out.println("🔍 Looking for badge: " + badgeName);
      Badge badge = badgeRepository.findByName(badgeName).orElse(null);
      if (badge != null) {
        System.out.println("📋 Found badge: " + badgeName + " (ID: " + badge.getBadgeId() + ")");
        boolean awarded = badgeService.awardBadge(userId, badge.getBadgeId());
        if (awarded) {
          System.out.println("✅ Successfully awarded badge '" + badgeName + "' to user: " + userId);
        } else {
          System.out.println("⚠️ Badge '" + badgeName + "' already awarded to user: " + userId);
        }
      } else {
        System.err.println("❌ Badge not found in database: " + badgeName);

        // Debug: List all available badges
        try {
          System.out.println("📝 Available badges in database:");
          badgeRepository
              .findAll()
              .forEach(
                  b ->
                      System.out.println(
                          "  - "
                              + b.getName()
                              + " (ID: "
                              + b.getBadgeId()
                              + ", Active: "
                              + b.getIsActive()
                              + ")"));
        } catch (Exception debugE) {
          System.err.println("Could not list available badges: " + debugE.getMessage());
        }
      }
    } catch (Exception e) {
      System.err.println("💥 Error awarding badge '" + badgeName + "': " + e.getMessage());
      e.printStackTrace();
    }
  }
}
