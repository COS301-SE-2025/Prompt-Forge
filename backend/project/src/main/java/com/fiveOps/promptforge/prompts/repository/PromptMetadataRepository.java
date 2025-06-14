package com.fiveOps.promptforge.prompts.repository;



import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.PromptMetadata;

@Repository
public interface PromptMetadataRepository extends JpaRepository<PromptMetadata, UUID> {

    PromptMetadata findByPromptId(UUID promptId);

    @Modifying
    @Query("UPDATE PromptMetadata m SET m.viewCount = m.viewCount + 1 WHERE m.prompt.id = :promptId")
    @Transactional
    void incrementViewCount(@Param("promptId") UUID promptId);

    @Modifying
    @Query("UPDATE PromptMetadata m SET m.forkCount = m.forkCount + 1 WHERE m.prompt.id = :promptId")
    @Transactional
    void incrementForkCount(@Param("promptId") UUID promptId);

    @Modifying
    @Query("UPDATE PromptMetadata m SET m.downloadCount = m.downloadCount + 1 WHERE m.prompt.id = :promptId")
    @Transactional
    void incrementDownloadCount(@Param("promptId") UUID promptId);

    @Query("SELECT AVG(r.rating) FROM PromptRating r WHERE r.prompt.id = :promptId")
    Double calculateAverageRating(@Param("promptId") UUID promptId);
}
