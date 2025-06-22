// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.promptstore.repository;

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
    Page<Prompt> findByVisibility(String visibility, Pageable pageable);
    
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
    Page<Map<String, PromptWithAuthorDTO>> findPublicPromptsWithAuthorAndTags(@Param("size") int size, @Param("offset") int offset, Pageable pageable);

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
       WHERE p.featured = true
       GROUP BY p.prompt_id, u.username
       """, nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findByFeatured(Boolean featured, Pageable pageable);

    @Query("SELECT p FROM Prompt p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND p.visibility = 'public'")
    Page<Prompt> searchPublicByTitle(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Prompt p WHERE " +
           "p.visibility = 'public' AND p.price <= :maxPrice")
    Page<Prompt> findPublicUnderPrice(@Param("maxPrice") double maxPrice, Pageable pageable);
    
    Page<Prompt> findByIdAndVisibility(UUID id, String visibility, Pageable pageable);

    @Query("SELECT p FROM Prompt p WHERE p.visibility = 'public' AND p.publishedAt IS NOT NULL ORDER BY p.publishedAt DESC")
    Page<Prompt> findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(String visibility, Pageable pageable);
}