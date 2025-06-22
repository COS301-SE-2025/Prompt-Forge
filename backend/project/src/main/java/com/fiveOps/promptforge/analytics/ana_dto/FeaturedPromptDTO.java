package com.fiveOps.promptforge.analytics.ana_dto;

import java.util.UUID;

public class FeaturedPromptDTO {
    private UUID promptId;
    private String title;
    private String description;

    public FeaturedPromptDTO() {}

    public FeaturedPromptDTO(UUID promptId, String title, String description) {
        this.promptId = promptId;
        this.title = title;
        this.description = description;
    }

    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}