package com.fiveOps.promptforge.promptstore.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.promptstore.exception.PurchaseException;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.repository.PromptPurchaseRepository;
import com.fiveOps.promptforge.promptstore.repository.PromptReviewRepository;
import com.fiveOps.promptforge.promptstore.repository.PromptStoreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PromptStoreService {
    private final PromptStoreRepository promptStoreRepository;
    private final PromptService promptService;
    private final PromptPurchaseRepository purchaseRepository;
    private final PromptReviewRepository reviewRepository;


    public List<Prompt> getAllPublicPrompts() {
        return promptStoreRepository.findByVisibility("public");
    }
    
    public List<Prompt> searchPublic(String query) {
        return promptService.searchPublicByTitle(query);
    }
    
    public List<Prompt> getPublicUnderPrice(double maxPrice) {
        return promptStoreRepository.findPublicUnderPrice(maxPrice);
    }
    
    public List<Prompt> getPublicByTagName(String tagName) {
        return promptService.getPromptsByTagName(tagName)
            .stream()
            .filter(prompt -> "public".equals(prompt.getVisibility()))
            .collect(Collectors.toList());
    }
    
    
    @Transactional
    public PromptPurchase purchasePrompt(UUID promptId, UUID userId) {
        Prompt prompt = promptService.getPromptById(promptId);
        
        if (purchaseRepository.existsByPromptIdAndUserId(promptId, userId)) {
            throw new PurchaseException("User already purchased this prompt");
        }
        
        PromptPurchase purchase = PromptPurchase.builder()
            .promptId(promptId)
            .userId(userId)
            .pricePaid(prompt.getPrice())
            .build();
            
        return purchaseRepository.save(purchase);
    }

    ///////// Review functionality from code2
    public List<PromptReview> getPromptReviews(UUID promptId) {
        return reviewRepository.findByPromptId(promptId);
    }

    @Transactional
    public PromptReview createReview(PromptReview review) {
        if (reviewRepository.existsByPromptIdAndUserId(review.getPromptId(), review.getUserId())) {
            throw new IllegalArgumentException("User already reviewed this prompt");
        }
        return reviewRepository.save(review);
    }

    public Double getAverageRating(UUID promptId) {
        return reviewRepository.calculateAverageRating(promptId);
    }
    /////////////////////////////////////
    
    // Get PUBLIC prompts by author
    public List<Prompt> getPublicPromptsByAuthor(UUID authorId) {
        return promptService.getPromptsByAuthor(authorId).stream()
                .filter(p -> "public".equals(p.getVisibility()))
                .collect(Collectors.toList());
    }

    // Unpublish a listing (soft delete)
    @Transactional
    public boolean deleteListing(UUID promptId) {
        Prompt unpublished = promptService.unpublishPrompt(promptId);
        return unpublished != null;
    }

    public List<Prompt> getRecentlyPublishedPrompts() {
    return promptStoreRepository.findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc("public")
            .stream()
            .limit(10) // Get top 10 most recent
            .collect(Collectors.toList());
}
}