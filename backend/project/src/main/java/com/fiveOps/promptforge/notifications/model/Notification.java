package com.fiveOps.promptforge.notifications.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.fiveOps.promptforge.user_profile.model.User user;

    @Column(name = "prompt_id")
    private UUID promptId;

    @Column(nullable = false)
    private String type; // BOUNCE_RATE_ALERT, PROMPT_VIEWED, PROMPT_PURCHASED, etc.

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime readAt;

    // Additional metadata as JSON string
    @Column(columnDefinition = "TEXT")
    private String metadata;

    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(com.fiveOps.promptforge.user_profile.model.User user, 
                       UUID promptId, String type, String title, String message) {
        this();
        this.user = user;
        this.promptId = promptId;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public Notification(com.fiveOps.promptforge.user_profile.model.User user, 
                       String type, String title, String message) {
        this();
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    // Getters and setters
    public Long getId() { return id; }

    public com.fiveOps.promptforge.user_profile.model.User getUser() { return user; }
    public void setUser(com.fiveOps.promptforge.user_profile.model.User user) { this.user = user; }

    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
