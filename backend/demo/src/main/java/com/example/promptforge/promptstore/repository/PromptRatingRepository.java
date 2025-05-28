package com.example.promptforge.promptstore.repository;


import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.promptforge.promptstore.model.PromptRating;

@Repository
public interface PromptRatingRepository extends JpaRepository<PromptRating, UUID> {
    //boolean existsByPromptIdAndUserId(UUID promptId, UUID userId);
}
