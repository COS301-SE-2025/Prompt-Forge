package com.fiveOps.promptforge.dashboard.dash_repository;

import com.fiveOps.promptforge.prompts.model.Prompt;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface DashboardRepository extends CrudRepository<Prompt, UUID> {

    // Count all prompts by user (public and private)
@Query("SELECT COUNT(p) FROM Prompt p WHERE p.authorId = :userId")
long countAllByUser(UUID userId);

// Average rating for all user's prompts (public and private)
@Query("""
    SELECT AVG(a.avgRating)
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
""")
Double averageRatingByUser(UUID userId);

// Total downloads for all user's prompts (public and private)
@Query("""
    SELECT SUM(a.downloadCount)
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
""")
Long totalDownloadsByUser(UUID userId);

// Top performing prompts by downloads (public and private)
@Query("""
    SELECT p
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
    ORDER BY a.downloadCount DESC
""")
List<Prompt> findTopPromptsByUser(UUID userId, Pageable pageable);


    @Query("""
    SELECT SUM(a.downloadCount)
    FROM Prompt p
    JOIN PromptAnalytics a ON p.id = a.promptId
    WHERE p.authorId = :userId
      AND p.visibility = 'PUBLIC'
      AND EXTRACT(YEAR FROM a.createdAt) = :year
      AND EXTRACT(MONTH FROM a.createdAt) = :month
""")
Long monthlyUsageByUser(UUID userId, int year, int month);
}