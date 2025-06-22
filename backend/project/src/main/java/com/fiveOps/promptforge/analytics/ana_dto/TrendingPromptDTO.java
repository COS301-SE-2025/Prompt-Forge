package com.fiveOps.promptforge.analytics.ana_dto;

import java.util.UUID;

public class TrendingPromptDTO {
    private UUID promptId;
    private String title;
    private int viewCount;

    public TrendingPromptDTO() {}

    public TrendingPromptDTO(UUID promptId, String title, int viewCount) {
        this.promptId = promptId;
        this.title = title;
        this.viewCount = viewCount;
    }

    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
}