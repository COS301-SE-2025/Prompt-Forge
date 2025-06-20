package com.fiveOps.promptforge.dashboard.dash_services;


import com.fiveOps.promptforge.dashboard.dash_repository.DashboardRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    public long getTotalPrompts(UUID userId) {
        return dashboardRepository.countPublishedByUser(userId);
    }

    public Double getAverageRating(UUID userId) {
        return dashboardRepository.averageRatingByUser(userId);
    }

    public Long getTotalDownloads(UUID userId) {
        return dashboardRepository.totalDownloadsByUser(userId);
    }

    public List<Prompt> getTopPrompts(UUID userId, int limit) {
        return dashboardRepository.findTopPromptsByUser(userId, PageRequest.of(0, limit));
    }
}
