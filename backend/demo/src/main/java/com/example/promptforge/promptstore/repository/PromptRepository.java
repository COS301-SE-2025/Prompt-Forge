package com.example.promptforge.promptstore.repository;



import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.promptforge.promptstore.model.Prompt;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {

    // Find all public prompts
    List<Prompt> findByIsPublicTrue();

    // Find prompts by category
    List<Prompt> findByCategory(String category);

    // Find public prompts by category
    List<Prompt> findByCategoryAndIsPublicTrue(String category);

    // Find prompts by author
    List<Prompt> findByAuthorId(UUID authorId);

    // Search prompts by title (case-insensitive)
    List<Prompt> findByTitleContainingIgnoreCase(String title);

    // // Custom query to find top-rated prompts
    // @Query("SELECT p FROM Prompt p WHERE p.isPublic = true ORDER BY p.rating DESC")
    // List<Prompt> findTopRatedPrompts();

    // Custom query with native SQL
    @Query(value = "SELECT * FROM prompt WHERE is_public = true AND price <= :maxPrice", nativeQuery = true)
    List<Prompt> findPublicPromptsUnderPrice(@Param("maxPrice") double maxPrice);

    // Count prompts by category
    long countByCategory(String category);
}