package com.fiveOps.promptforge.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_activity_logs")
public class UserActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "activity_type", nullable = false)
    private String activityType; // "login", "prompt_view", "prompt_create", "prompt_download"
    
    @Column(name = "prompt_id")
    private UUID promptId;
    
    @Column(name = "session_duration")
    private Long sessionDuration; // in milliseconds
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data
    
    public UserActivityLog() {}
    
    public UserActivityLog(UUID userId, String activityType, UUID promptId, 
                          Long sessionDuration, String metadata) {
        this.userId = userId;
        this.activityType = activityType;
        this.promptId = promptId;
        this.sessionDuration = sessionDuration;
        this.metadata = metadata;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    
    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }
    
    public Long getSessionDuration() { return sessionDuration; }
    public void setSessionDuration(Long sessionDuration) { this.sessionDuration = sessionDuration; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
