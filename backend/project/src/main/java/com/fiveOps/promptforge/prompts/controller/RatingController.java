package com.fiveOps.promptforge.prompts.controller;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.repository.PromptMetadataRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRatingRepository;

@RestController
@RequestMapping("/api/prompts/ratings")
public class RatingController {

    private final PromptRatingRepository ratingRepository;
    private final PromptMetadataRepository metadataRepository;

    @Autowired
    public RatingController(PromptRatingRepository ratingRepository, 
                          PromptMetadataRepository metadataRepository) {
        this.ratingRepository = ratingRepository;
        this.metadataRepository = metadataRepository;
    }

    // @PostMapping
    // public ResponseEntity<PromptRating> createRating(@RequestBody PromptRating rating) {
    //     if (ratingRepository.existsByPromptIdAndUserId(
    //         rating.getPrompt().getId(), 
    //         rating.getUser().getId())) {
    //         return ResponseEntity.badRequest().build();
    //     }

    //     PromptRating savedRating = ratingRepository.save(rating);
        
    //     // Update average rating in metadata
    //     UUID promptId = rating.getPrompt().getId();
    //     Double avgRating = metadataRepository.calculateAverageRating(promptId);
    //     metadataRepository.findByPromptId(promptId).ifPresent(metadata -> {
    //         metadata.setAverageRating(avgRating);
    //         metadataRepository.save(metadata);
    //     });

    //     return ResponseEntity.ok(savedRating);
    // } no users for now

    @GetMapping("/prompt/{promptId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable UUID promptId) {
        return ResponseEntity.ok(metadataRepository.calculateAverageRating(promptId));
    }
}