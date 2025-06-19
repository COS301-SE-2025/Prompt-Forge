package com.fiveOps.promptforge.analytics.ana_dto;

import java.time.LocalDate;
import java.util.UUID;

public class PromptAnalyticsDTO {
    private UUID analyticsId;
    private UUID promptId;
    private LocalDate date;
    private int viewCount;
    private int uniqueVisitors;
    private int purchaseCount;
    private double avgRating;
    private double downloadCount;

    // Getters and setters
}