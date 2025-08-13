package com.fiveOps.promptforge.dashboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.fiveOps.promptforge.prompts.model.Prompt;

public interface DashboardRepository extends CrudRepository<Prompt, UUID> {
  // Average rating for all prompts by a user
  @Query(
    value = """
    SELECT AVG(r.rating) FROM reviews r WHERE r.prompt_id 
    IN (SELECT p.prompt_id FROM prompts p WHERE p.author_id = :userId)
    """,
    nativeQuery = true
  )
  Double averageRatingByUser(UUID userId);

  // Count all prompts by user (public and private)
  @Query("SELECT COUNT(p) FROM Prompt p WHERE p.authorId = :userId")
  long countAllByUser(UUID userId);

  // Average rating for all user's prompts (public and private)
  // @Query(
  //     """
  //   SELECT AVG(a.rating)
  //   FROM Prompt p
  //   JOIN reviews a ON p.prompt_id = a.prompt_id
  //   WHERE p.authorId = :userId
   
  //   """)
  // Double averageRatingByUser(UUID userId);

  // Total downloads for all user's prompts (public and private)
//   @Query(
//       """
//     SELECT SUM(a.downloadCount)
//     FROM Prompt p
//     JOIN PromptAnalytics a ON p.id = a.promptId
//     WHERE p.authorId = :userId
// """)
//   Long totalDownloadsByUser(UUID userId);
  @Query(
  value = """
    SELECT COUNT(*) FROM purchased_prompts pp
    WHERE pp.prompt_id IN (SELECT p.prompt_id FROM prompts p WHERE p.author_id = :userId)
  """,
  nativeQuery = true
  )
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

  @Query(
  value = """
    SELECT t.name, COUNT(*) 
    FROM prompts p 
    JOIN LATERAL unnest(p.prompt_tags) AS tag_id(tag_id) ON TRUE 
    JOIN tags t ON t.tag_id = tag_id.tag_id 
    WHERE p.author_id = :userId 
    GROUP BY t.name
  """,
  nativeQuery = true
  )
  List<Object[]> getCategoryBreakdownByUser(UUID userId);

    @Query(
      value = """
        SELECT EXTRACT(MONTH FROM p.created_at) AS month, COUNT(*) AS count
        FROM prompts p
        WHERE p.author_id = :userId
          AND EXTRACT(YEAR FROM p.created_at) = :year
        GROUP BY month
        ORDER BY month
      """,
      nativeQuery = true
    )
    List<Object[]> getMonthlyPromptCountsByUser(UUID userId, int year);
}
