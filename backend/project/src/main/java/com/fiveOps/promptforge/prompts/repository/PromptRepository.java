package com.fiveOps.promptforge.prompts.repository;

import java.util.List;
// import java.util.Map;
import java.util.UUID;
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
  @Query(value = """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'authored' AS source
       FROM
              prompts p
       WHERE p.author_id = :authorId
       LIMIT :limit
       OFFSET :offset
       """, nativeQuery = true)
  List<PromptWithSourceDTO> findByAuthorId(@Param("authorId") UUID authorId,
       @Param("limit") int limit, @Param("offset") int offset);

  @Query(value = """
       SELECT COUNT(*)
       FROM prompts p
       WHERE p.author_id = :authorId
       """, nativeQuery = true)
  long countAuthoredPrompts(@Param("authorId") UUID authorId);

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

  @Query(value = """
       SELECT
              pp.purchase_id AS purchaseId,
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              author_user.username AS authorName,
              array_agg(t.name) AS tagNames,
              'purchased' AS source
       FROM
              purchased_prompts pp
       JOIN prompts p ON pp.prompt_id = p.prompt_id
       JOIN users author_user ON p.author_id = author_user.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE pp.user_id = :user_id
       GROUP BY pp.purchase_id, p.prompt_id, author_user.username, 
       p.author_id, p.title, p.slug,p.description, p.price
       LIMIT :limit
       OFFSET :offset
       """,
       nativeQuery = true)
       List<PromptWithSourceDTO> getPurchasedPromptsByUserId(
        @Param("user_id") UUID userId, @Param("limit") int limit, @Param("offset") int offset);

       
       @Query(value = """
       SELECT COUNT(*)
       FROM purchased_prompts p
       WHERE p.user_id = :userId
       """,
       nativeQuery = true)
       long countPurchasedPrompts(@Param("userId") UUID userId);
}
