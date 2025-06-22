package com.fiveOps.promptforge.promptstore.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.promptstore.model.PromptReview;

@Repository
public interface PromptReviewRepository extends JpaRepository<PromptReview, UUID> {
    Page<PromptReview> findByPromptId(UUID promptId,Pageable pageable);
    boolean existsByPromptIdAndUserId(UUID promptId, UUID userId);
    
    @Query("SELECT AVG(r.rating) FROM PromptReview r WHERE r.promptId = :promptId")
    Double calculateAverageRating(UUID promptId);
}