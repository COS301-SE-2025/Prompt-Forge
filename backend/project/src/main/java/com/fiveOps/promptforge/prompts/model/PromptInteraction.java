package com.fiveOps.promptforge.prompts.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "prompt_interaction")
public class PromptInteraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_id", nullable = false)
    private Prompt prompt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.fiveOps.promptforge.user_profile.model.User user;

    @Column(nullable = false)
    private String action; // e.g., VIEW, ADD_TO_CART, PURCHASE

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public PromptInteraction() {}

    public PromptInteraction(Prompt prompt, com.fiveOps.promptforge.user_profile.model.User user, String action, LocalDateTime timestamp) {
        this.prompt = prompt;
        this.user = user;
        this.action = action;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public Long getId() { return id; }
    public Prompt getPrompt() { return prompt; }
    public void setPrompt(Prompt prompt) { this.prompt = prompt; }
    public com.fiveOps.promptforge.user_profile.model.User getUser() { return user; }
    public void setUser(com.fiveOps.promptforge.user_profile.model.User user) { this.user = user; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
