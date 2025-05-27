// src/main/java/com/example/promptforge/prompt/PromptMetadataRepository.java
package com.example.promptforge.dashboard.prompt;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PromptMetadataRepository extends JpaRepository<PromptMetadata, UUID> {
    @Query("SELECT AVG(pm.avgRating) FROM PromptMetadata pm WHERE pm.avgRating IS NOT NULL")
    Double calculateAverageRating();
}
