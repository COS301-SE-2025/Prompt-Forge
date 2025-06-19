package com.fiveOps.promptforge.analytics.ana_repository;

import com.yourapp.analytics.dto.TrendingPromptDTO;
import com.yourapp.analytics.dto.TopRankingPromptDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import com.yourapp.analytics.entity.PromptAnalytics;
import java.util.List;
import java.util.UUID;

public interface PromptAnalyticsRepository extends CrudRepository<PromptAnalytics, UUID> {

    @Query("SELECT new com.yourapp.analytics.dto.TrendingPromptDTO(a.promptId, p.title, SUM(a.viewCount)) " +
           "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.promptId " +
           "WHERE a.date >= CURRENT_DATE - 7 " +
           "GROUP BY a.promptId, p.title " +
           "ORDER BY SUM(a.viewCount) DESC")
    List<TrendingPromptDTO> findTrendingPrompts();

    @Query("SELECT new com.yourapp.analytics.dto.TopRankingPromptDTO(a.promptId, p.title, AVG(a.avgRating)) " +
           "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.promptId " +
           "GROUP BY a.promptId, p.title " +
           "ORDER BY AVG(a.avgRating) DESC")
    List<TopRankingPromptDTO> findTopRankingPrompts();
}