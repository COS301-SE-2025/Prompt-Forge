// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.promptstore.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;

@Repository
public interface PromptStoreRepository extends JpaRepository<Prompt, UUID> {
    List<Prompt> findByVisibility(String visibility);
    @Query(value = """
       SELECT
              p.prompt_id AS id,
              p.author_id AS authorId,
              p.title AS title,
              p.slug AS slug,
              p.description AS description,
              p.price AS price,
              u.username AS username,
              array_agg(t.name) AS tagNames
       FROM
              prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public'
       GROUP BY p.prompt_id, u.username
       LIMIT :size OFFSET :offset
       """, nativeQuery = true)
    List<Map<String, PromptWithAuthorDTO>> findPublicPromptsWithAuthorAndTags(@Param("size") int size, @Param("offset") int offset);

    @Query("SELECT p FROM Prompt p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND p.visibility = 'public'")
    List<Prompt> searchPublicByTitle(@Param("query") String query);
    
    @Query("SELECT p FROM Prompt p WHERE " +
           "p.visibility = 'public' AND p.price <= :maxPrice")
    List<Prompt> findPublicUnderPrice(@Param("maxPrice") double maxPrice);
    
    List<Prompt> findByIdAndVisibility(UUID id, String visibility);

    @Query("SELECT p FROM Prompt p WHERE p.visibility = 'public' AND p.publishedAt IS NOT NULL ORDER BY p.publishedAt DESC")
List<Prompt> findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(String visibility);
}