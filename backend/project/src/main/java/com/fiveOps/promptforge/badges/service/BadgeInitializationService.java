package com.fiveOps.promptforge.badges.service;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;

@Service
@Profile("!test") // Don't run in test profile to avoid context loading issues
public class BadgeInitializationService {

  @Autowired private BadgeRepository badgeRepository;

  @PostConstruct
  @Transactional
  public void initializeDefaultBadges() {
    try {
      // Check if badges table exists and is accessible
      long existingBadges = badgeRepository.count();
      System.out.println("Found " + existingBadges + " existing badges");

      if (existingBadges == 0) {
        System.out.println("No badges found - creating default badges...");

        // Create all default badges by category
        createMilestoneBadges();
        createAchievementBadges();
        createSocialBadges();
        createSpecialBadges();
        createStreakBadges();
        createContributionBadges();
        createExplorationBadges();
        createViralBadges();

        System.out.println("Badge initialization completed successfully");
      } else {
        System.out.println(
            "Badge system initialized successfully with " + existingBadges + " badges");
      }

    } catch (Exception e) {
      System.err.println("Failed to initialize badges: " + e.getMessage());
      // Don't rethrow - let the application continue without badges
    }
  }

  private void createMilestoneBadges() {
    createBadgeIfNotExists(
        "First Steps", "Created your first prompt", "Star", "#10B981", "milestone", "common");
    createBadgeIfNotExists(
        "Productive", "Created 10 prompts", "Zap", "#F59E0B", "milestone", "common");
    createBadgeIfNotExists(
        "Prolific", "Created 50 prompts", "Flame", "#EF4444", "milestone", "uncommon");
    createBadgeIfNotExists(
        "Master Creator", "Created 100 prompts", "Crown", "#8B5CF6", "milestone", "rare");
  }

  private void createAchievementBadges() {
    createBadgeIfNotExists(
        "Highly Rated", "Average rating above 4.0", "Award", "#10B981", "achievement", "uncommon");
    createBadgeIfNotExists(
        "Excellence", "Average rating above 4.5", "Medal", "#F59E0B", "achievement", "rare");
    createBadgeIfNotExists(
        "Perfection", "Average rating of 5.0", "Gem", "#8B5CF6", "achievement", "legendary");
  }

  private void createSocialBadges() {
    createBadgeIfNotExists(
        "Social Butterfly", "Following 25+ users", "Users", "#06B6D4", "social", "common");
    createBadgeIfNotExists(
        "Influencer", "Has 50+ followers", "Megaphone", "#EC4899", "social", "uncommon");
    createBadgeIfNotExists(
        "Community Leader", "Has 100+ followers", "Shield", "#F59E0B", "social", "rare");
  }

  private void createSpecialBadges() {
    createBadgeIfNotExists(
        "Early Adopter", "One of the first 100 users", "Calendar", "#6366F1", "special", "rare");
    createBadgeIfNotExists(
        "Verified Creator",
        "Verified account",
        "CheckCircle",
        "#10B981",
        "verification",
        "uncommon");
    createBadgeIfNotExists(
        "Beta Tester", "Participated in beta testing", "TestTube", "#8B5CF6", "special", "rare");
  }

  private void createStreakBadges() {
    createBadgeIfNotExists(
        "Consistent Creator",
        "Created prompts for 7 consecutive days",
        "Target",
        "#F97316",
        "streak",
        "uncommon");
    createBadgeIfNotExists(
        "Marathon Creator",
        "Created prompts for 30 consecutive days",
        "Flame",
        "#EF4444",
        "streak",
        "rare");
  }

  private void createContributionBadges() {
    createBadgeIfNotExists(
        "Helpful Reviewer",
        "Left 25+ helpful reviews",
        "MessageCircle",
        "#06B6D4",
        "contribution",
        "common");
    createBadgeIfNotExists(
        "Top Reviewer",
        "Left 100+ helpful reviews",
        "ThumbsUp",
        "#10B981",
        "contribution",
        "uncommon");
  }

  private void createExplorationBadges() {
    createBadgeIfNotExists(
        "Category Explorer",
        "Created prompts in 5+ categories",
        "Compass",
        "#8B5CF6",
        "exploration",
        "common");
    createBadgeIfNotExists(
        "Renaissance Creator",
        "Created prompts in all categories",
        "BookOpen",
        "#F59E0B",
        "exploration",
        "rare");
  }

  private void createViralBadges() {
    createBadgeIfNotExists(
        "Popular Creator",
        "One prompt reached 1000+ uses",
        "TrendingUp",
        "#EC4899",
        "viral",
        "rare");
    createBadgeIfNotExists(
        "Viral Sensation", "One prompt reached 10000+ uses", "Bolt", "#EF4444", "viral", "epic");
  }

  private void createBadgeIfNotExists(
      String name, String description, String icon, String color, String category, String rarity) {
    try {
      if (!badgeRepository.findByName(name).isPresent()) {
        Badge badge = new Badge(name, description, icon, color, category);
        badge.setRarity(rarity);
        badgeRepository.save(badge);
        System.out.println("Created badge: " + name);
      }
    } catch (Exception e) {
      System.err.println("Failed to create badge '" + name + "': " + e.getMessage());
    }
  }
}
