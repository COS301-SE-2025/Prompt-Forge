package com.fiveOps.promptforge.badges.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class BadgeDto {
  private UUID badgeId;
  private String name;
  private String description;
  private String icon;
  private String color;
  private String category;
  private String rarity;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Progress fields for user context
  private Integer progress; // 0-100, only present when fetched for a specific user
  private LocalDateTime earnedAt; // Only present if user has earned the badge
  private Boolean isVisible; // User's visibility preference

  // Default constructor
  public BadgeDto() {}

  // Getters
  public UUID getBadgeId() {
    return badgeId;
  }

  public String getName() {
    return name;
  }

  public String getDescription() {
    return description;
  }

  public String getIcon() {
    return icon;
  }

  public String getColor() {
    return color;
  }

  public String getCategory() {
    return category;
  }

  public String getRarity() {
    return rarity;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public Integer getProgress() {
    return progress;
  }

  public LocalDateTime getEarnedAt() {
    return earnedAt;
  }

  public Boolean getIsVisible() {
    return isVisible;
  }

  // Setters
  public void setBadgeId(UUID badgeId) {
    this.badgeId = badgeId;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public void setIcon(String icon) {
    this.icon = icon;
  }

  public void setColor(String color) {
    this.color = color;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public void setRarity(String rarity) {
    this.rarity = rarity;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public void setProgress(Integer progress) {
    this.progress = progress;
  }

  public void setEarnedAt(LocalDateTime earnedAt) {
    this.earnedAt = earnedAt;
  }

  public void setIsVisible(Boolean isVisible) {
    this.isVisible = isVisible;
  }
}
