package com.fiveOps.promptforge.promptstore.repository;

import com.fiveOps.promptforge.promptstore.model.PromptReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromptReviewRepository extends JpaRepository<PromptReview, UUID> {
    List<PromptReview> findByPromptId(UUID promptId);
    boolean existsByPromptIdAndUserId(UUID promptId, UUID userId);
    
    @Query("SELECT AVG(r.rating) FROM PromptReview r WHERE r.promptId = :promptId")
    Double calculateAverageRating(UUID promptId);
}