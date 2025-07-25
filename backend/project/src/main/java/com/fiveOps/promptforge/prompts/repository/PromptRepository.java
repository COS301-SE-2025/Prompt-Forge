package com.fiveOps.promptforge.prompts.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithSourceDTO;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {

  List<Prompt> findByFeaturedTrue();

  List<Prompt> findByVisibility(String visibility);

  // List<Prompt> findByCategoryAndVisibility(String category, String visibility);
  @Query(
      value =
          """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'authored' AS source,
              (
                     SELECT COUNT(*)
                     FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              prompts p
       JOIN users author_user ON author_user.user_id = p.author_id
       LEFT JOIN
              purchased_prompts pp ON pp.prompt_id = p.prompt_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.author_id = :authorId AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
       GROUP BY p.prompt_id, author_user.username,p.author_id,p.title,p.slug,p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> findByAuthorIdAndOptionalTagName(
      @Param("authorId") UUID authorId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Query(
      value =
          """
       SELECT COUNT(*)
       FROM prompts p
       WHERE p.author_id = :authorId
       """,
      nativeQuery = true)
  long countAuthoredPrompts(@Param("authorId") UUID authorId);

  @Query(
      value =
          """
       SELECT COUNT(*)
       FROM prompts p
       WHERE p.author_id = :authorId AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
       """,
      nativeQuery = true)
  long countByAuthoredAndTags(@Param("authorId") UUID authorId, @Param("tagId") UUID tagId);

  List<Prompt> findByTitleContainingIgnoreCase(String title);

  @Query(
      "SELECT p FROM Prompt p WHERE "
          + "LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
          + "AND p.visibility = 'public'")
  List<Prompt> searchPublicByTitle(@Param("searchTerm") String searchTerm);

  @Query(value = "SELECT * FROM prompts WHERE :tagId = ANY(prompt_tags)", nativeQuery = true)
  List<Prompt> findByTagId(@Param("tagId") UUID tagId);

  @Query(
      value = "SELECT * FROM prompts WHERE visibility = 'public' AND price <= :maxPrice",
      nativeQuery = true)
  List<Prompt> findPublicPromptsUnderPrice(@Param("maxPrice") double maxPrice);

  @Query(
      value =
          """
       SELECT
              pp.purchase_id AS purchaseId,
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'purchased' AS source,
              (
              SELECT COUNT(*)
              FROM purchased_prompts pp
              WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       JOIN users author_user ON p.author_id = author_user.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE pp.user_id = :user_id
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
       GROUP BY pp.purchase_id, p.prompt_id, author_user.username,
              p.author_id, p.title, p.slug, p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> getPurchasedPromptsByUserIdAndOptionalTag(
      @Param("user_id") UUID userId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Query(
      value =
          """
       SELECT COUNT(*)
       FROM purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       WHERE pp.user_id = :userId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
       """,
      nativeQuery = true)
  long countPurchasedPromptsByOptionalTagName(
      @Param("userId") UUID userId, @Param("tagId") UUID tagId);

  @Query(
      value =
          """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'authored' AS source,
              (
                     SELECT COUNT(*)
                     FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              prompts p
       JOIN users author_user ON author_user.user_id = p.author_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE
              p.author_id = :authorId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND :visibility = p.visibility
       GROUP BY p.prompt_id, author_user.username,p.author_id,p.title,p.slug,p.description, p.price,
              p.visibility
       """,
      nativeQuery = true)
  Page<PromptWithSourceDTO> findByAuthorIdAndVisibilityAndOptionalTag(
      @Param("authorId") UUID authorId,
      @Param("tagId") UUID tagId,
      @Param("visibility") String visibility,
      Pageable pageable);

  @Query(
      value =
          """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'authored' AS source,
              (
                     SELECT COUNT(*)
                     FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              prompts p
       JOIN users author_user ON author_user.user_id = p.author_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE
              p.author_id = :authorId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND p.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY p.prompt_id, author_user.username,p.author_id,p.title,p.slug,p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> findRecentPromptsByAuthorIdAndAndOptionalTag(
      @Param("authorId") UUID authorId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Query(
      value =
          """
       SELECT
              COUNT(*)
       FROM
              prompts p
       WHERE
              p.author_id = :authorId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND p.created_at >= NOW() - INTERVAL '7 days'
       """,
      nativeQuery = true)
  long countRecentPromptsByAuthorIdAndAndOptionalTag(
      @Param("authorId") UUID authorId, @Param("tagId") UUID tagId);

  //////// Purchased prompts
  @Query(
      value =
          """
       SELECT
              pp.purchase_id AS purchaseId,
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'purchased' AS source,
              (
              SELECT COUNT(*)
              FROM purchased_prompts pp
              WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       JOIN users author_user ON p.author_id = author_user.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE pp.user_id = :userId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND p.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY pp.purchase_id, p.prompt_id, author_user.username,
              p.author_id, p.title, p.slug, p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
      @Param("userId") UUID userId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Query(
      value =
          """
       SELECT COUNT(*)
       FROM
              purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       WHERE pp.user_id = :userId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND p.created_at >= NOW() - INTERVAL '7 days'
       """,
      nativeQuery = true)
  long countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
      @Param("userId") UUID userId, @Param("tagId") UUID tagId);

  @Query(
      value =
          """
       SELECT
              pp.purchase_id AS purchaseId,
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'purchased' AS source,
              (
                     SELECT COUNT(*)
                     FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       JOIN users author_user ON p.author_id = author_user.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE pp.user_id = :userId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND (
                     SELECT COUNT(*) FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
                     ) > 1
       GROUP BY pp.purchase_id, p.prompt_id, author_user.username,
              p.author_id, p.title, p.slug, p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> findPopularPurchasedPromptsByUserIdAndOptionalTag(
      @Param("userId") UUID userId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") long offset);

  @Query(
      value =
          """

       SELECT COUNT(*)
       FROM purchased_prompts pp
       WHERE pp.user_id = :userId AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND (
                     SELECT COUNT(*) FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) > 1
       """,
      nativeQuery = true)
  long countPopularPurchasedPromptsByUserIdAndOptionalTag(
      @Param("userId") UUID userId, @Param("tagId") UUID tagId);

  @Query(
      value =
          """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              p.visibility AS visibility,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'authored' AS source,
              (
                     SELECT COUNT(*)
                     FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) AS usageCount
       FROM
              prompts p
       JOIN purchased_prompts pp ON pp.prompt_id = p.prompt_id
       JOIN users author_user ON p.author_id = author_user.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.author_id = :authorId
              AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND (
                     SELECT COUNT(*) FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
                     ) > 1
       GROUP BY p.prompt_id, author_user.username,
              p.author_id, p.title, p.slug, p.description, p.price,
              p.visibility
       LIMIT :limit
       OFFSET :offset
       """,
      nativeQuery = true)
  List<PromptWithSourceDTO> findPopularAuthoredPromptsByUserIdAndOptionalTag(
      @Param("authorId") UUID authorId,
      @Param("tagId") UUID tagId,
      @Param("limit") int limit,
      @Param("offset") long offset);

  @Query(
      value =
          """

       SELECT COUNT(*)
       FROM prompts p
       WHERE p.author_id = :authorId AND (:tagId IS NULL OR :tagId = ANY(p.prompt_tags))
              AND (
                     SELECT COUNT(*) FROM purchased_prompts pp
                     WHERE pp.prompt_id = p.prompt_id
              ) > 1
       """,
      nativeQuery = true)
  long countPopularAuthoredPromptsByUserIdAndOptionalTag(
      @Param("authorId") UUID authorId, @Param("tagId") UUID tagId);
}
