package com.fiveOps.promptforge.analytics.ana_repository;

import com.fiveOps.promptforge.analytics.ana_model.PromptAnalytics;
import com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO;
import com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface PromptAnalyticsRepository extends CrudRepository<PromptAnalytics, UUID> {

    // @Query("SELECT new com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO(a.promptId, p.title, CAST(SUM(a.viewCount) AS int)) " +
    //        "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.id " +
    //        "WHERE a.date >= :sevenDaysAgo " +
    //        "GROUP BY a.promptId, p.title " +
    //        "ORDER BY SUM(a.viewCount) DESC")
    // List<TrendingPromptDTO> findTrendingPrompts(LocalDate sevenDaysAgo);

    // // @Query("SELECT new com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO(a.promptId, p.title, AVG(a.avgRating)) " +
    // //    "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.id " +
    // //    "GROUP BY a.promptId, p.title " +
    // //    "ORDER BY AVG(a.avgRating) DESC")
    // // List<TopRankingPromptDTO> findTopRankingPrompts();

    // @Query("SELECT new com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO(a.promptId, p.title, AVG(a.avgRating)) " +
    //     "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.id " +
    //     "GROUP BY a.promptId, p.title " +
    //     "ORDER BY AVG(a.avgRating) DESC")
    // List<TopRankingPromptDTO> findTopRankingPrompts(Pageable pageable);
//////////////////////////////////////////////////
/// NOW PUBLIC PROMPTS ONLY
    @Query("SELECT new com.fiveOps.promptforge.analytics.ana_dto.TrendingPromptDTO(a.promptId, p.title, CAST(SUM(a.viewCount) AS int)) " +
       "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.id " +
       "WHERE a.date >= :sevenDaysAgo AND p.visibility = 'public' " +
       "GROUP BY a.promptId, p.title " +
       "ORDER BY SUM(a.viewCount) DESC")
List<TrendingPromptDTO> findTrendingPrompts(LocalDate sevenDaysAgo);

@Query("SELECT new com.fiveOps.promptforge.analytics.ana_dto.TopRankingPromptDTO(a.promptId, p.title, AVG(a.avgRating)) " +
    "FROM PromptAnalytics a JOIN Prompt p ON a.promptId = p.id " +
    "WHERE p.visibility = 'public' " +
    "GROUP BY a.promptId, p.title " +
    "ORDER BY AVG(a.avgRating) DESC")
List<TopRankingPromptDTO> findTopRankingPrompts(Pageable pageable);
}