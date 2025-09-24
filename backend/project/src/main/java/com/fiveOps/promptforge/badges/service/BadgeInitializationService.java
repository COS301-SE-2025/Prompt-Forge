package com.fiveOps.promptforge.badges.service;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.badges.model.Badge;
import com.fiveOps.promptforge.badges.repository.BadgeRepository;

@Service
public class BadgeInitializationService {

  @Autowired private BadgeRepository badgeRepository;

  @PostConstruct
  public void initializeDefaultBadges() {
    createBadgeIfNotExists(
        "First Prompt", "Created your first prompt", "Rocket", "#10B981", "milestone", "common");
    createBadgeIfNotExists(
        "Prolific Creator", "Created 10 prompts", "Zap", "#8B5CF6", "achievement", "uncommon");
    createBadgeIfNotExists(
        "Prompt Master", "Created 50 prompts", "Crown", "#F59E0B", "achievement", "rare");
    createBadgeIfNotExists(
        "Community Legend", "Created 100 prompts", "Trophy", "#EF4444", "achievement", "epic");

    createBadgeIfNotExists(
        "Rising Star", "Received 10 total ratings", "Star", "#3B82F6", "social", "common");
    createBadgeIfNotExists(
        "Highly Rated", "Average rating above 4.0", "Award", "#10B981", "achievement", "uncommon");
    createBadgeIfNotExists(
        "Excellence", "Average rating above 4.5", "Medal", "#F59E0B", "achievement", "rare");
    createBadgeIfNotExists(
        "Perfection", "Average rating of 5.0", "Gem", "#8B5CF6", "achievement", "legendary");

    createBadgeIfNotExists(
        "Social Butterfly", "Following 25+ users", "Users", "#06B6D4", "social", "common");
    createBadgeIfNotExists(
        "Influencer", "Has 50+ followers", "Megaphone", "#EC4899", "social", "uncommon");
    createBadgeIfNotExists(
        "Community Leader", "Has 100+ followers", "Shield", "#F59E0B", "social", "rare");

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
    if (!badgeRepository.findByName(name).isPresent()) {
      Badge badge = new Badge(name, description, icon, color, category);
      badge.setRarity(rarity);
      badgeRepository.save(badge);
    }
  }
}
