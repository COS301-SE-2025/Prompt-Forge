// src/main/java/com/example/promptforge/activity/Activity.java
package com.example.promptforge.dashboard.activity;


import java.time.LocalDateTime;
import java.util.UUID;

import com.example.promptforge.promptstore.model.Prompt;
import com.example.promptforge.user_profile.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "activities", schema = "public")
public class Activity {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;
    
    private String actionType;
    private LocalDateTime timestamp;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "prompt_id")
    private Prompt prompt;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Prompt getPrompt() { return prompt; }
    public void setPrompt(Prompt prompt) { this.prompt = prompt; }
}
