// src/main/java/com/example/promptforge/prompt/PromptMetadataRepository.java
package com.example.promptforge.dashboard.prompt;


import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.promptforge.promptstore.model.PromptMetadata;

@Repository
public interface PromptMetadataRepo extends JpaRepository<PromptMetadata, UUID> {
    @Query("SELECT AVG(pm.averageRating) FROM PromptMetadata pm WHERE pm.averageRating IS NOT NULL")
    Double calculateAverageRating();
}
