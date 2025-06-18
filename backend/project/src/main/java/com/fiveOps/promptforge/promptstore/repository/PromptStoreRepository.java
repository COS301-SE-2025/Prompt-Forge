// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.promptstore.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Prompt;

@Repository
public interface PromptStoreRepository extends JpaRepository<Prompt, UUID> {
    List<Prompt> findByVisibility(String visibility);
    
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