package main.java.com.fiveOps.promptforge.analytics.ana_dto;

import java.util.UUID;

public class TopRankingPromptDTO {
    private UUID promptId;
    private String title;
    private double avgRating;

    public TopRankingPromptDTO() {}

    public TopRankingPromptDTO(UUID promptId, String title, double avgRating) {
        this.promptId = promptId;
        this.title = title;
        this.avgRating = avgRating;
    }

    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
}