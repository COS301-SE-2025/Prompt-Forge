package com.fiveOps.promptforge.user_profile.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_user_email", columnList = "email", unique = true),
      @Index(name = "idx_user_username", columnList = "username", unique = true),
      @Index(name = "idx_user_verified", columnList = "is_verified"),
      @Index(name = "idx_user_active", columnList = "is_active")
    })
public class User {

  @Id
  @Column(name = "user_id", nullable = false, updatable = false)
  private UUID userId;

  @Column(length = 255, nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", length = 255, nullable = false)
  private String passwordHash;

  @Column(name = "is_verified", nullable = false)
  private Boolean isVerified = false;

  @Column(length = 50, unique = true)
  private String username;

  @Column(length = 500)
  private String bio;

  @Column(name = "profile_picture_url", length = 255)
  private String profilePictureUrl;

  @Column(length = 20, nullable = false)
  private String role = "buyer";

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt = LocalDateTime.now();

  @Column(columnDefinition = "uuid[]")
  private UUID[] badges = new UUID[] {};

  @Column(name = "is_active")
  private Boolean isActive = true;

  @Column(columnDefinition = "uuid[]")
  private UUID[] followers = new UUID[] {};

  @Column(columnDefinition = "uuid[]")
  private UUID[] following = new UUID[] {};

  // === Getters ===

  public UUID getUserId() {
    return userId;
  }

  public String getEmail() {
    return email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public Boolean getIsVerified() {
    return isVerified;
  }

  public String getUsername() {
    return username;
  }

  public String getBio() {
    return bio;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }

  public String getRole() {
    return role;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public UUID[] getBadges() {
    return badges;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public UUID[] getFollowers() {
    return followers;
  }

  public UUID[] getFollowing() {
    return followers;
  }

  public String getAvatarUrl() {
    return this.profilePictureUrl;
  }

  // === Setters ===

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public void setIsVerified(Boolean isVerified) {
    this.isVerified = isVerified;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public void setProfilePictureUrl(String profilePictureUrl) {
    this.profilePictureUrl = profilePictureUrl;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public void setBadges(UUID[] badges) {
    this.badges = badges;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  public void setFollowing(UUID[] following) {
    this.following = following;
  }

  public void setFollowers(UUID[] followers) {
    this.followers = followers;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.profilePictureUrl = avatarUrl;
  }
}
