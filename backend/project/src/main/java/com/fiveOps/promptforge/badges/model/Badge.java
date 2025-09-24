package com.fiveOps.promptforge.badges.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "badges")
public class Badge {

  @Id
  @Column(name = "badge_id", nullable = false, updatable = false)
  private UUID badgeId;

  @Column(name = "name", length = 100, nullable = false, unique = true)
  private String name;

  @Column(name = "description", length = 500)
  private String description;

  @Column(name = "icon", length = 50)
  private String icon; // Lucide icon name

  @Column(name = "color", length = 20)
  private String color; // Hex color code

  @Column(name = "category", length = 50)
  private String category; // e.g., "achievement", "contribution", "milestone"

  @Column(name = "criteria", columnDefinition = "TEXT")
  private String criteria; // JSON criteria for automatic badge assignment

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name = "rarity", length = 20)
  private String rarity; // "common", "uncommon", "rare", "epic", "legendary"

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt = LocalDateTime.now();

  // Default constructor
  public Badge() {
    this.badgeId = UUID.randomUUID();
  }

  // Constructor with required fields
  public Badge(String name, String description, String icon, String color, String category) {
    this();
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.color = color;
    this.category = category;
  }

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

  public String getCriteria() {
    return criteria;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public String getRarity() {
    return rarity;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
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

  public void setCriteria(String criteria) {
    this.criteria = criteria;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  public void setRarity(String rarity) {
    this.rarity = rarity;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
