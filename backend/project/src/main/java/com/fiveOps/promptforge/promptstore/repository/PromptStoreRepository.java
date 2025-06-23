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

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.visibility = :visibility")
    Page<PromptWithAuthorDTO> findByVisibility(String visibility, Pageable pageable);

    
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
              GROUP BY p.prompt_id, u.username
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
       GROUP BY p.prompt_id, u.username
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
       GROUP BY p.prompt_id, u.username
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
       GROUP BY p.prompt_id, u.username
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
       GROUP BY p.prompt_id, u.username
       """, 
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND :tagId = ANY(p.prompt_tags)
       AND p.created_at >= NOW() - INTERVAL '7 days'
       """, nativeQuery = true)
    Page<Map<String, PromptWithAuthorDTO>> findByTagAndNew(@Param("tagID") UUID tagId, Pageable pageable);

    @Query
    (value="""
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
       WHERE p.visibility = 'public' AND LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND p.visibility = 'public'
       GROUP BY p.prompt_id, u.username
       """,
       countQuery = """
       SELECT COUNT(DISTINCT p.prompt_id)
       FROM prompts p
       JOIN users u ON p.author_id = u.user_id
       LEFT JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
       WHERE p.visibility = 'public' AND LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND p.visibility = 'public'
       AND p.created_at >= NOW() - INTERVAL '7 days'
       """, nativeQuery = true)
       Page<Map<String, PromptWithAuthorDTO>> searchPublicByTitle(@Param("searchTerm") String searchTerm, Pageable pageable);


    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND p.visibility = 'public'")
    Page<PromptWithAuthorDTO> searchPublicByTitle(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.visibility = 'public' AND p.price <= :maxPrice")
    Page<PromptWithAuthorDTO> findPublicUnderPrice(@Param("maxPrice") double maxPrice, Pageable pageable);
    
//     Page<Prompt> findByIdAndVisibility(UUID id, String visibility, Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.visibility = 'public' AND p.publishedAt IS NOT NULL " +
           "ORDER BY p.publishedAt DESC")
    Page<PromptWithAuthorDTO> findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(String visibility, Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
       "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
       "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
       "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
       "WHERE p.authorId = :authorId AND p.visibility = 'public'")
Page<PromptWithAuthorDTO> findByAuthorId(@Param("authorId") UUID authorId, Pageable pageable);

@Query(value = "SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
       "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
       "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
       "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
       "WHERE :tagId = ANY(p.tagIds) AND p.visibility = 'public'", nativeQuery = true)
Page<PromptWithAuthorDTO> findByTagId(@Param("tagId") UUID tagId, Pageable pageable);
}