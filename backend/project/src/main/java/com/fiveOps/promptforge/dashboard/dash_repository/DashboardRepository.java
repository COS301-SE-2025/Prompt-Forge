package com.fiveOps.promptforge.dashboard.dash_repository;

import com.fiveOps.promptforge.prompts.model.Prompt;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface DashboardRepository extends CrudRepository<Prompt, UUID> {

    @Query("SELECT COUNT(p) FROM Prompt p WHERE p.author.id = :userId AND p.published = true")
    long countPublishedByUser(UUID userId);

    @Query("SELECT AVG(p.avgRating) FROM Prompt p WHERE p.author.id = :userId AND p.published = true")
    Double averageRatingByUser(UUID userId);

    @Query("SELECT SUM(p.downloads) FROM Prompt p WHERE p.author.id = :userId AND p.published = true")
    Long totalDownloadsByUser(UUID userId);

    @Query("SELECT p FROM Prompt p WHERE p.author.id = :userId AND p.published = true ORDER BY p.downloads DESC")
    List<Prompt> findTopPromptsByUser(UUID userId, Pageable pageable);
}