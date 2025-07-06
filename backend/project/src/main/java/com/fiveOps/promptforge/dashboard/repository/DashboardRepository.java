package com.fiveOps.promptforge.dashboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.fiveOps.promptforge.prompts.model.Prompt;

public interface DashboardRepository extends CrudRepository<Prompt, UUID> {

  // Count all prompts by user (public and private)
  @Query("SELECT COUNT(p) FROM Prompt p WHERE p.authorId = :userId")
  long countAllByUser(UUID userId);

  // Average rating for all user's prompts (public and private)
  @Query(
      """
    SELECT AVG(a.avgRating)
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
    """)
  Double averageRatingByUser(UUID userId);

  // Total downloads for all user's prompts (public and private)
  @Query(
      """
    SELECT SUM(a.downloadCount)
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
""")
  Long totalDownloadsByUser(UUID userId);

  // Top performing prompts by downloads (public and private)
  @Query(
      """
    SELECT p
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
    ORDER BY a.downloadCount DESC
""")
  List<Prompt> findTopPromptsByUser(UUID userId, Pageable pageable);

  @Query(
      """
    SELECT COUNT(p)
    FROM Prompt p
    WHERE p.authorId = :userId
      AND EXTRACT(YEAR FROM p.createdAt) = :year
      AND EXTRACT(MONTH FROM p.createdAt) = :month
""")
  Long monthlyPromptCountByUser(UUID userId, int year, int month);
}
