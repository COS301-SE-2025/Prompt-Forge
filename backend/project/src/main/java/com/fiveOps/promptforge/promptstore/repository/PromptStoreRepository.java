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
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """, 
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public'
       """,
       nativeQuery = true)
       Page<Map<String, PromptWithAuthorDTO>> getPublicPromptsWithAuthorAndTags(Pageable pageable);

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
              WHERE p.visibility = 'public' AND :tagId = ANY(p.prompt_tags)
              GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
              """, nativeQuery = true)
       Page<Map<String, PromptWithAuthorDTO>> findPublicByTagId(@Param("tagId") UUID tagId, Pageable pageable);

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
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """, nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findByFeatured(Pageable pageable);
    
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
       WHERE visibility='public' AND p.featured = true AND :tagId = ANY(p.prompt_tags)
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """, nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findPublicByTagIdAndFeatured(@Param("tagId") UUID tagId,Pageable pageable);

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
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND p.created_At >= NOW() - INTERVAL '7 days' 
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """, 
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public'
       AND p.created_at >= NOW() - INTERVAL '7 days'
       """,
       nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findNew(Pageable pageable);

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
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND :tagId = ANY(p.prompt_tags) 
       AND p.created_At >= NOW() - INTERVAL '7 days'
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """, 
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND :tagId = ANY(p.prompt_tags)
       AND p.created_at >= NOW() - INTERVAL '7 days'
       """, nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findByTagAndNew(@Param("tagId") UUID tagId, Pageable pageable);

    // Fixed: Removed FETCH FIRST ? ROWS ONLY since Pageable handles pagination
    // Fixed: Corrected the countQuery to match the main query conditions
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
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
       GROUP BY 
    p.prompt_id, 
    p.author_id, 
    p.title, 
    p.slug, 
    p.description, 
    p.price, 
    u.username
       """,
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)s
       WHERE p.visibility = 'public' AND LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
       """, nativeQuery = true)
       Page<Map<String, PromptWithAuthorDTO>> searchPublicByTitle(@Param("searchTerm") String searchTerm, Pageable pageable);

//     // Renamed this method to avoid conflicts and use different return type
//     @Query("SELECT p FROM Prompt p WHERE " +
//            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
//            "AND p.visibility = 'public'")
//     List<Prompt> searchPublicByTitleList(@Param("query") String query);
    
    @Query("SELECT p FROM Prompt p WHERE " +
           "p.visibility = 'public' AND p.price <= :maxPrice")
    List<Prompt> findPublicUnderPrice(@Param("maxPrice") double maxPrice);
    
    List<Prompt> findByIdAndVisibility(UUID id, String visibility);

    @Query("SELECT p FROM Prompt p WHERE p.visibility = 'public' AND p.publishedAt IS NOT NULL ORDER BY p.publishedAt DESC")
    List<Prompt> findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(String visibility);
}