package com.fiveOps.promptforge.dashboard.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.dashboard.repository.DashboardRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;

@Service
public class DashboardService {
  // Category breakdown for all prompts by a user
  public List<Object[]> getCategoryBreakdown(UUID userId) {
    return dashboardRepository.getCategoryBreakdownByUser(userId);
  }

    // Monthly prompt counts for each month of the year
    public List<Object[]> getMonthlyPromptCounts(UUID userId, int year) {
      return dashboardRepository.getMonthlyPromptCountsByUser(userId, year);
    }

  @Autowired private DashboardRepository dashboardRepository;

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
    Long count =
        dashboardRepository.monthlyPromptCountByUser(userId, now.getYear(), now.getMonthValue());
    return count != null ? count : 0L;
  }
}
