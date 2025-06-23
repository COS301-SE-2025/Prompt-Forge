package com.fiveOps.promptforge.prompts.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


// Option 1: Traditional POJO
public class PromptWithAuthorDTO {
    private final UUID id;
    private final UUID authorId;
    private final String title;
    private final String slug;
    private final String description;
    private final Double price;
    private final LocalDateTime createdAt;
    private final LocalDateTime publishedAt;
    private final List<UUID> tagIds;
    private final String username;
    
    // Main constructor - takes username as separate parameter
    public PromptWithAuthorDTO(Prompt prompt, String username) {
        this.id = prompt.getId();
        this.authorId = prompt.getAuthorId();
        this.title = prompt.getTitle();
        this.slug = prompt.getSlug();
        this.description = prompt.getDescription();
        this.price = prompt.getPrice();
        this.createdAt = prompt.getCreatedAt();
        this.publishedAt = prompt.getPublishedAt();
        this.tagIds = prompt.getTagIds();
        this.username = username;
    }
    
    // Full constructor for manual creation
    public PromptWithAuthorDTO(UUID id, UUID authorId, String title, String slug, 
                              String description, Double price, LocalDateTime createdAt, 
                              LocalDateTime publishedAt, List<UUID> tagIds, String username) {
        this.id = id;
        this.authorId = authorId;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.createdAt = createdAt;
        this.publishedAt = publishedAt;
        this.tagIds = tagIds;
        this.username = username;
    }
    
    // Getters
    public UUID getId() { return id; }
    public UUID getAuthorId() { return authorId; }
    public String getTitle() { return title; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public List<UUID> getTagIds() { return tagIds; }
    public String getUsername() { return username; }
}

