package com.fiveOps.promptforge.dashboard.dash_services;


import com.fiveOps.promptforge.dashboard.dash_repository.DashboardRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    // public long getTotalPrompts(UUID userId) {
    //     return dashboardRepository.countPublishedByUser(userId);
    // }

    // public Double getAverageRating(UUID userId) {
    //     return dashboardRepository.averageRatingByUser(userId);
    // }

    // public Long getTotalDownloads(UUID userId) {
    //     return dashboardRepository.totalDownloadsByUser(userId);
    // }

    // public List<Prompt> getTopPrompts(UUID userId, int limit) {
    //     return dashboardRepository.findTopPromptsByUser(userId, PageRequest.of(0, limit));
    // }

    // public Long getMonthlyUsage(UUID userId) {
    // LocalDate now = LocalDate.now();
    // return dashboardRepository.monthlyUsageByUser(userId, now.getYear(), now.getMonthValue());
    // }

        // Now counts all prompts (public and private)
    public long getTotalPrompts(UUID userId) {
        return dashboardRepository.countAllByUser(userId);
    }

    // Average rating for all prompts (public and private)
    public Double getAverageRating(UUID userId) {
        return dashboardRepository.averageRatingByUser(userId);
    }

    // Total downloads for all prompts (public and private)
    public Long getTotalDownloads(UUID userId) {
        return dashboardRepository.totalDownloadsByUser(userId);
    }

    // Top performing prompts by downloads (public and private)
    public List<Prompt> getTopPrompts(UUID userId, int limit) {
        return dashboardRepository.findTopPromptsByUser(userId, PageRequest.of(0, limit));
    }

    // Monthly usage for all prompts (public and private)
    public Long getMonthlyPromptCount(UUID userId) {
    LocalDate now = LocalDate.now();
    Long count = dashboardRepository.monthlyPromptCountByUser(userId, now.getYear(), now.getMonthValue());
    return count != null ? count : 0L;
    }

}
