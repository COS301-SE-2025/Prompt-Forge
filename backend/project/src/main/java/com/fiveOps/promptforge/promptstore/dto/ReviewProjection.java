package com.fiveOps.promptforge.promptstore.dto;
import java.time.LocalDateTime;
import java.util.UUID;

public interface ReviewProjection {
    UUID getId();
    UUID getPromptId();
    UUID getUserId();
    String getUserName();
    Double getRating();
    String getComment();
    LocalDateTime getCreatedAt();
}
