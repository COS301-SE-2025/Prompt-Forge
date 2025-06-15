package com.fiveOps.promptforge.prompts.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Prompt;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {

    List<Prompt> findByVisibility(String visibility);
    //List<Prompt> findByCategoryAndVisibility(String category, String visibility);
    List<Prompt> findByAuthorId(UUID authorId);
    List<Prompt> findByTitleContainingIgnoreCase(String title);
    
    @Query(value = "SELECT * FROM prompts WHERE :tagId = ANY(prompt_tags)", 
           nativeQuery = true)
    List<Prompt> findByTagId(@Param("tagId") UUID tagId);

    @Query(value = "SELECT * FROM prompts WHERE visibility = 'public' AND price <= :maxPrice", nativeQuery = true)
    List<Prompt> findPublicPromptsUnderPrice(@Param("maxPrice") double maxPrice);

    //long countByCategory(String category);
}