// src/main/java/com/example/promptforge/dashboard_dto/ActivityDTO.java
package com.example.promptforge.dashboard.dashboard_dto;


import java.time.LocalDateTime;

public class ActivityDTO {
    private String username;
    private String action;
    private String promptTitle;
    private LocalDateTime timestamp;

    // Constructors, Getters and Setters
    public ActivityDTO() {}
    
    public ActivityDTO(String username, String action, String promptTitle, LocalDateTime timestamp) {
        this.username = username;
        this.action = action;
        this.promptTitle = promptTitle;
        this.timestamp = timestamp;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getPromptTitle() { return promptTitle; }
    public void setPromptTitle(String promptTitle) { this.promptTitle = promptTitle; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
