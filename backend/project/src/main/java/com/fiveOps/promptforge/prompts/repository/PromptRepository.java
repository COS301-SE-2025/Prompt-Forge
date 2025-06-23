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
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {
    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.featured = true")
    Page<PromptWithAuthorDTO> findByFeaturedTrue(Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId")
    Page<PromptWithAuthorDTO> findAllWithAuthor(Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.visibility = :visibility")
    Page<PromptWithAuthorDTO> findByVisibility(String visibility, Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE p.authorId = :authorId")
    Page<PromptWithAuthorDTO> findByAuthorId(UUID authorId, Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<PromptWithAuthorDTO> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.id, p.authorId, p.title, p.slug, p.description, p.price, " +
           "p.createdAt, p.publishedAt, p.tagIds, u.username) " +
           "FROM Prompt p JOIN User u ON p.authorId = u.userId " +
           "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "AND p.visibility = 'public'")
    Page<PromptWithAuthorDTO> searchPublicByTitle(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query(value = "SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.prompt_id, p.author_id, p.title, p.slug, p.description, p.price, " +
           "p.created_at, p.published_at, p.prompt_tags, u.username) " +
           "FROM prompts p JOIN users u ON p.author_id = u.user_id " +
           "WHERE :tagId = ANY(p.prompt_tags)", 
           nativeQuery = true)
    Page<PromptWithAuthorDTO> findByTagId(@Param("tagId") UUID tagId, Pageable pageable);

    @Query(value = "SELECT new com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO(" +
           "p.prompt_id, p.author_id, p.title, p.slug, p.description, p.price, " +
           "p.created_at, p.published_at, p.prompt_tags, u.username) " +
           "FROM prompts p JOIN users u ON p.author_id = u.user_id " +
           "WHERE visibility = 'public' AND price <= :maxPrice", 
           nativeQuery = true)
    Page<PromptWithAuthorDTO> findPublicPromptsUnderPrice(@Param("maxPrice") double maxPrice, Pageable pageable);
}

