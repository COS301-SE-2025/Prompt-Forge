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
    List<Prompt> findByVisibilityAndPriceLessThanEqual(String visibility, double maxPrice);
    
    @Query("SELECT p FROM Prompt p JOIN p.tagIds t WHERE p.visibility = 'PUBLIC' AND t = :tagId")
    List<Prompt> findPublicPromptsByTag(@Param("tagId") UUID tagId);
}