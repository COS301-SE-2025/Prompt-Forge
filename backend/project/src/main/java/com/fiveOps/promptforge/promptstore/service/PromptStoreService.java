package com.fiveOps.promptforge.promptstore.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.prompts.service.TagService;
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
    private final TagService tagService;   

    @Cacheable(value = "prompts", key = "{#root.methodName,#pageable}")
    public Page<Prompt> getAllPublicPrompts(Pageable pageable) {
        return promptStoreRepository.findByVisibility("public", pageable);
    }
    
    public Page<Map<String, PromptWithAuthorDTO>> getPage(String page, String size, Pageable pageable) {
        int pageSize = Integer.parseInt(size);
        int offset = pageSize * Integer.parseInt(page);

        return promptStoreRepository.findPublicPromptsWithAuthorAndTags(pageSize, offset, pageable);
    }

    public long getPageCount(String pageSize) {
        long promptCount = promptStoreRepository.count();
        return Math.floorDiv(promptCount, Integer.parseInt(pageSize));
    }

    public long getPromptCount() {
        return promptStoreRepository.count();
    }
    
    public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(Pageable pageable) {
        return promptStoreRepository.findByFeatured(true, pageable);
    }
    
    
    public Page<Prompt> searchPublic(String query, Pageable pageable) {
        return promptStoreRepository.searchPublicByTitle(query, pageable);
    }
    
    
    public Page<Prompt> getPublicUnderPrice(double maxPrice, Pageable pageable) {
        return promptStoreRepository.findPublicUnderPrice(maxPrice, pageable);
    }
    
    public Page<Prompt> getPublicByTagName(String tagName, Pageable pageable) {
        Page<Prompt> allPrompts = promptService.getPromptsByTagName(tagName, pageable);
        List<Prompt> filteredPrompts = allPrompts.getContent().stream()
            .filter(prompt -> "public".equals(prompt.getVisibility()))
            .collect(Collectors.toList());
        
        return new PageImpl<>(filteredPrompts, pageable, allPrompts.getTotalElements());
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
    public Page<PromptReview> getPromptReviews(UUID promptId, Pageable pageable) {
        return reviewRepository.findByPromptId(promptId, pageable);
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
    public Page<Prompt> getPublicPromptsByAuthor(UUID authorId, Pageable pageable) {
        Page<Prompt> allPrompts = promptService.getPromptsByAuthor(authorId, pageable);
        List<Prompt> filteredPrompts = allPrompts.getContent().stream()
                .filter(p -> "public".equals(p.getVisibility()))
                .collect(Collectors.toList());
        
        return new PageImpl<>(filteredPrompts, pageable, allPrompts.getTotalElements());
    }

    // Unpublish a listing (soft delete)
    @Transactional
    public boolean deleteListing(UUID promptId) {
        Prompt unpublished = promptService.unpublishPrompt(promptId);
        return unpublished != null;
    }

    public Page<Prompt> getRecentlyPublishedPrompts(Pageable pageable) {
        Page<Prompt> allPrompts = promptStoreRepository.findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc("public", pageable);
        List<Prompt> limitedPrompts = allPrompts.getContent().stream()
                .limit(10) // Get top 10 most recent
                .collect(Collectors.toList());
        
        return new PageImpl<>(limitedPrompts, pageable, Math.min(10, allPrompts.getTotalElements()));
    }

    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    public List<Tag> getPopularTags(int limit) {
        return tagService.getPopularTags(limit);
    }

    // public Page<PromptWithTagsDTO> getPromptsWithTags(Pageable pageable) {
    //     Page<Prompt> prompts = promptStoreRepository.findByVisibility("public", pageable);
    //     List<PromptWithTagsDTO> promptsWithTags = prompts.getContent().stream()
    //             .map(prompt -> mapToPromptWithTagsDTO(prompt, pageable))
    //             .collect(Collectors.toList());
        
    //     return new PageImpl<>(promptsWithTags, pageable, prompts.getTotalElements());
    // }

    // private PromptWithTagsDTO mapToPromptWithTagsDTO(Prompt prompt) {
    //     List<Tag> tags = tagService.getTagsByIds(prompt.getTagIds());
    //     return PromptWithTagsDTO.builder()
    //             .id(prompt.getId())
    //             .title(prompt.getTitle())
    //             .description(prompt.getDescription())
    //             .price(prompt.getPrice())
    //             .tags(tags)
    //             .build();
    // }
}