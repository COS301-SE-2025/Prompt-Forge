package com.fiveOps.promptforge.notifications.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {
    private Long id;
    private UUID promptId;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String metadata;

    public NotificationDto() {}

    public NotificationDto(Long id, UUID promptId, String type, String title, 
                          String message, Boolean isRead, LocalDateTime createdAt, 
                          LocalDateTime readAt, String metadata) {
        this.id = id;
        this.promptId = promptId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.readAt = readAt;
        this.metadata = metadata;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}
