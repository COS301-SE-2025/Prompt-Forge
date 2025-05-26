// src/main/java/com/example/promptforge/prompt/Review.java
package com.example.promptforge.dashboard.prompt;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @Column(columnDefinition = "UUID")
    private UUID reviewId;
    
    @Column(columnDefinition = "UUID")
    private UUID promptId;
    
    @Column(columnDefinition = "UUID")
    private UUID userId;
    
    private Integer rating;
    private String comment;
    
    // Getters and Setters
    public UUID getReviewId() { return reviewId; }
    public void setReviewId(UUID reviewId) { this.reviewId = reviewId; }
    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}