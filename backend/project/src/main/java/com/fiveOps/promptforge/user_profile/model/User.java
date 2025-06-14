package com.fiveOps.promptforge.user_profile.model;
import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "user_id") // Map the Java field to the DB column
    private UUID userId;

    private String username;
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private Boolean isActive;

    private String role;
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String badges;

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

public String getPasswordHash() {
    return passwordHash;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public boolean isActive() {
    return isActive;
}

public String getRole() {
    return role;
}

public String getBio() {
    return bio;
}

public String getAvatarUrl() {
    return avatarUrl;
}

public String getBadges() {
    return badges;
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

public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

public void setActive(boolean active) {
    isActive = active;
}

public void setRole(String role) {
    this.role = role;
}

public void setBio(String bio) {
    this.bio = bio;
}

public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
}

public void setBadges(String badges) {
    this.badges = badges;
}
}
