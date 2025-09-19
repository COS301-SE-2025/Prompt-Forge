package com.fiveOps.promptforge.dashboard.services;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.dashboard.repository.DashboardRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.service.PromptInteractionService;

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
  @Autowired private PromptInteractionService promptInteractionService;

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
    Long count = dashboardRepository.totalDownloadsByUser(userId);
    return (count != null && count > 0) ? count : null;
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

  // Average bounce rate for all prompts by a user
  public Double getAverageBounceRate(UUID userId) {
    List<Prompt> userPrompts = dashboardRepository.findAllByUser(userId);
    if (userPrompts.isEmpty()) {
      return 0.0;
    }
    
    double totalBounceRate = 0.0;
    int promptsWithViews = 0;
    
    for (Prompt prompt : userPrompts) {
      long views = promptInteractionService.getPromptViews(prompt);
      if (views > 0) {
        double bounceRate = promptInteractionService.getPromptBounceRate(prompt);
        totalBounceRate += bounceRate;
        promptsWithViews++;
      }
    }
    
    return promptsWithViews > 0 ? totalBounceRate / promptsWithViews : 0.0;
  }

  // Get engagement funnel data for dashboard analytics
  public Map<String, Object> getEngagementFunnelData(UUID userId) {
    List<Prompt> userPrompts = dashboardRepository.findAllByUser(userId);
    Map<String, Object> funnelData = new HashMap<>();
    
    if (userPrompts.isEmpty()) {
      funnelData.put("totalViews", 0L);
      funnelData.put("totalCartAdds", 0L);
      funnelData.put("totalPurchases", 0L);
      funnelData.put("viewToCartRate", 0.0);
      funnelData.put("cartToPurchaseRate", 0.0);
      return funnelData;
    }
    
    long totalViews = 0;
    long totalCartAdds = 0;
    long totalPurchases = 0;
    
    for (Prompt prompt : userPrompts) {
      totalViews += promptInteractionService.getPromptViews(prompt);
      totalCartAdds += promptInteractionService.getPromptActions(prompt, "ADD_TO_CART");
      totalPurchases += promptInteractionService.getPromptActions(prompt, "PURCHASE");
    }
    
    double viewToCartRate = totalViews > 0 ? ((double) totalCartAdds / totalViews) * 100.0 : 0.0;
    double cartToPurchaseRate = totalCartAdds > 0 ? ((double) totalPurchases / totalCartAdds) * 100.0 : 0.0;
    
    funnelData.put("totalViews", totalViews);
    funnelData.put("totalCartAdds", totalCartAdds);
    funnelData.put("totalPurchases", totalPurchases);
    funnelData.put("viewToCartRate", viewToCartRate);
    funnelData.put("cartToPurchaseRate", cartToPurchaseRate);
    
    return funnelData;
  }
}
