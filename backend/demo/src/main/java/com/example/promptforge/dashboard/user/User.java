// src/main/java/com/example/promptforge/user/User.java
package com.example.promptforge.dashboard.user;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "public")
public class User {
    @Id
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    private String username;
    private String email;
    private String passwordHash;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String role;
    private String bio;
    private String avatarUrl;
    private String badges;
    
    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getBadges() { return badges; }
    public void setBadges(String badges) { this.badges = badges; }
}