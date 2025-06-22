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

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {

     List<Prompt> findByFeaturedTrue();
     Page<Prompt> findAll(Pageable pageable);

    Page<Prompt> findByVisibility(String visibility,Pageable pageable);
    //Page<Prompt> findByCategoryAndVisibility(String category, String visibility);
    Page<Prompt> findByAuthorId(UUID authorId,Pageable pageable);
    Page<Prompt> findByTitleContainingIgnoreCase(String title,Pageable pageable);
    @Query("SELECT p FROM Prompt p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "AND p.visibility = 'public'")
    Page<Prompt> searchPublicByTitle(@Param("searchTerm") String searchTerm,Pageable pageable);
    
    @Query(value = "SELECT * FROM prompts WHERE :tagId = ANY(prompt_tags)", 
           nativeQuery = true)
    Page<Prompt> findByTagId(@Param("tagId") UUID tagId,Pageable pageable);

    @Query(value = "SELECT * FROM prompts WHERE visibility = 'public' AND price <= :maxPrice", nativeQuery = true)
    Page<Prompt> findPublicPromptsUnderPrice(@Param("maxPrice") double maxPrice,Pageable pageable);

    

    //long countByCategory(String category);
}