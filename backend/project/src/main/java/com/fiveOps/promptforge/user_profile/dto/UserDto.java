package com.fiveOps.promptforge.user_profile.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UserDto {
    private UUID userId;
    private String username;
    private String email;
    private String profilePicture;
    private String bio;
    private String role;
    private boolean isVerified;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<UUID> badges;
    private List<UUID> followers;
    private List<UUID> following;

    // Getters
    public UUID getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public String getBio() {
        return bio;
    }

    public String getRole() {
        return role;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public boolean isActive() {
        return isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<UUID> getBadges() {
        return badges;
    }

    public List<UUID> getFollowers() {
        return followers;
    }

    public List<UUID> getFollowing() {
        return following;
    }

    // Setters
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setBadges(List<UUID> badges) {
        this.badges = badges;
    }

    public void setFollowers(List<UUID> followers) {
        this.followers = followers;
    }

    public void setFollowing(List<UUID> following) {
        this.following = following;
    }
}
