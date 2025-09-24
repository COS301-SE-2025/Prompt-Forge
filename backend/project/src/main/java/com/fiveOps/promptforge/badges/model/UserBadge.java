package com.fiveOps.promptforge.badges.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_badges")
public class UserBadge {

  @Id
  @Column(name = "user_badge_id", nullable = false, updatable = false)
  private UUID userBadgeId;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "badge_id", nullable = false)
  private UUID badgeId;

  @Column(name = "earned_at", nullable = false)
  private LocalDateTime earnedAt = LocalDateTime.now();

  @Column(name = "progress", nullable = false)
  private Integer progress = 0; // Progress towards earning the badge (0-100)

  @Column(name = "is_visible", nullable = false)
  private Boolean isVisible = true; // User can choose to hide badges

  @Column(name = "metadata", columnDefinition = "TEXT")
  private String metadata; // JSON metadata about how the badge was earned

  // Default constructor
  public UserBadge() {
    this.userBadgeId = UUID.randomUUID();
  }

  // Constructor with required fields
  public UserBadge(UUID userId, UUID badgeId) {
    this();
    this.userId = userId;
    this.badgeId = badgeId;
  }

  // Getters
  public UUID getUserBadgeId() {
    return userBadgeId;
  }

  public UUID getUserId() {
    return userId;
  }

  public UUID getBadgeId() {
    return badgeId;
  }

  public LocalDateTime getEarnedAt() {
    return earnedAt;
  }

  public Integer getProgress() {
    return progress;
  }

  public Boolean getIsVisible() {
    return isVisible;
  }

  public String getMetadata() {
    return metadata;
  }

  // Setters
  public void setUserBadgeId(UUID userBadgeId) {
    this.userBadgeId = userBadgeId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public void setBadgeId(UUID badgeId) {
    this.badgeId = badgeId;
  }

  public void setEarnedAt(LocalDateTime earnedAt) {
    this.earnedAt = earnedAt;
  }

  public void setProgress(Integer progress) {
    this.progress = progress;
  }

  public void setIsVisible(Boolean isVisible) {
    this.isVisible = isVisible;
  }

  public void setMetadata(String metadata) {
    this.metadata = metadata;
  }
}
