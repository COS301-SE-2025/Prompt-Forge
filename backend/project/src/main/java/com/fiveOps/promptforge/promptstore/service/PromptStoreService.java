package com.fiveOps.promptforge.promptstore.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.prompts.service.TagService;
import com.fiveOps.promptforge.promptstore.dto.PromptWithTagsDTO;
import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
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

  public List<Prompt> getAllPublicPrompts() {
    return promptStoreRepository.findByVisibility("public");
  }

  public Page<Map<String, PromptWithAuthorDTO>> getPublicPromptsWithAuthorAndTags(
      Pageable pageable) {
    return promptStoreRepository.getPublicPromptsWithAuthorAndTags(pageable);
  }

  public long getPageCount(String pageSize) {
    long promptCount = promptStoreRepository.count();
    return Math.floorDiv(promptCount, Integer.parseInt(pageSize));
  }

  public long getPromptCount() {
    return promptStoreRepository.count();
  }

  public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(Pageable pageable) {
    return promptStoreRepository.findByFeatured(pageable);
  }

  public List<Prompt> searchPublic(String query) {
    return promptService.searchPublicByTitle(query);
  }

  public Page<Map<String, PromptWithAuthorDTO>> searchPublic(String query, Pageable pageable) {
    return promptStoreRepository.searchPublicByTitle(query, pageable);
  }

  public List<Prompt> getPublicUnderPrice(double maxPrice) {
    return promptStoreRepository.findPublicUnderPrice(maxPrice);
  }

  public List<Prompt> getPublicByTagName(String tagName) {
    return promptService.getPromptsByTagName(tagName).stream()
        .filter(prompt -> "public".equals(prompt.getVisibility()))
        .collect(Collectors.toList());
  }

  public Page<Map<String, PromptWithAuthorDTO>> getPublicByTagName(
      String tagName, Pageable pageable) {
    UUID tagId = tagService.getTagIdByName(tagName);
    return promptStoreRepository.findPublicByTagId(tagId, pageable);
  }

  public Page<Map<String, PromptWithAuthorDTO>> getPublicByTagNameAndFilter(
      String tagName, String filter, Pageable pageable) {
    UUID tagId = tagService.getTagIdByName(tagName);
    if (filter.toLowerCase().equals("featured")) {
      return promptStoreRepository.findPublicByTagIdAndFeatured(tagId, pageable);
    }

    return promptStoreRepository.findByTagAndNew(tagId, pageable);
  }

  public Page<Map<String, PromptWithAuthorDTO>> getNew(Pageable pageable) {
    return promptStoreRepository.findNew(pageable);
  }

  public Boolean isPromptBought(UUID userID, UUID promptId) {
    return purchaseRepository.existsByPromptIdAndUserId(promptId, userID);
  }

  @Transactional
  public PromptPurchase purchasePrompt(UUID promptId, UUID userId) {
    Prompt prompt = promptService.getPromptById(promptId);

    if (prompt == null) {
      throw new PurchaseException("Prompt with ID " + promptId + " not found in database");
    }

    if (purchaseRepository.existsByPromptIdAndUserId(promptId, userId)) {
      throw new PurchaseException("Prompt already purchased");
    }

    PromptPurchase purchase =
        PromptPurchase.builder()
            .promptId(promptId)
            .userId(userId)
            .pricePaid(prompt.getPrice())
            .visibility("public")
            .build();


    return purchaseRepository.save(purchase);
  }

    public Page<Map<String, PromptWithAuthorDTO>> getPublicByTagName(String tagName, Pageable pageable) {
        UUID tagId = tagService.getTagIdByName(tagName);
        return promptStoreRepository.findPublicByTagId(tagId, pageable);
    }
    
    public Page<Map<String, PromptWithAuthorDTO>> getPublicByTagNameAndFilter(String tagName, String filter, Pageable pageable) {  
        UUID tagId = tagService.getTagIdByName(tagName);
        if(filter.toLowerCase().equals("featured")){
            return promptStoreRepository.findPublicByTagIdAndFeatured(tagId, pageable);
        }
        
        return promptStoreRepository.findByTagAndNew(tagId, pageable);
    }
    
    public Page<Map<String, PromptWithAuthorDTO>> getNew( Pageable pageable) {  
        return promptStoreRepository.findNew(pageable);
    }
    
    public Boolean isOwned(UUID userID, UUID promptId){

        Prompt probe = new Prompt();
        probe.setAuthorId(userID); // you want all prompts in the "Marketing" category
        probe.setId(promptId); // you want all prompts in the "Marketing" category

        return promptStoreRepository.existsByIdAndAuthorId(promptId,userID) || purchaseRepository.existsByPromptIdAndUserId(promptId, userID);
    }
    
    @Transactional
    public PromptPurchase purchasePrompt(UUID promptId, UUID userId) {
        Prompt prompt = promptService.getPromptById(promptId);
        
        if (prompt == null) {
            throw new PurchaseException("Prompt with ID " + promptId + " not found in database");
        }
        
        if (purchaseRepository.existsByPromptIdAndUserId(promptId, userId)) {
            throw new PurchaseException("Prompt already purchased");
        }
        
        PromptPurchase purchase = PromptPurchase.builder()
        .promptId(promptId)
        .userId(userId)
        .pricePaid(prompt.getPrice())
        .visibility("public")
        .build();
            
        return purchaseRepository.save(purchase);
    }


  ///////// Review functionality
  public Page<ReviewProjection> getReviewsForPrompt(UUID promptId, Pageable pageable) {
    return reviewRepository.findReviewsWithUsernameByPromptId(promptId, pageable);
  }

  @Transactional
  public PromptReview createReview(PromptReview review) {
    if (reviewRepository.existsByPromptIdAndUserId(review.getPromptId(), review.getUserId())) {
      throw new IllegalArgumentException("User already reviewed this prompt");
    }
    return reviewRepository.save(review);
  }

  @Transactional
  public PromptReview updateReviewPartial(
      UUID reviewId,
      UUID userId,
      UUID promptId,
      @Nullable Double rating,
      @Nullable String comment) {
    // Verify review exists and belongs to user/prompt
    PromptReview review =
        reviewRepository
            .findByIdAndUserIdAndPromptId(reviewId, userId, promptId)
            .orElseThrow(() -> new IllegalArgumentException("Review not found or unauthorized"));

    // Only update non-null fields
    if (rating != null) {
      review.setRating(rating);
    }
    if (comment != null) {
      review.setComment(comment);
    }

    return reviewRepository.save(review);
  }

  @Transactional
  public void deleteReview(UUID reviewId, UUID userId, UUID promptId) {
    if (!reviewRepository.existsByIdAndUserIdAndPromptId(reviewId, userId, promptId)) {
      throw new IllegalArgumentException("Review not found or unauthorized");
    }
    reviewRepository.deleteById(reviewId);
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
    return promptStoreRepository
        .findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc("public")
        .stream()
        .limit(10) // Get top 10 most recent
        .collect(Collectors.toList());
  }

  public List<Tag> getAllTags() {
    return tagService.getAllTags();
  }

  public List<Tag> getPopularTags(int limit) {
    return tagService.getPopularTags(limit);
  }

  public List<PromptWithTagsDTO> getPromptsWithTags() {
    List<Prompt> prompts = promptStoreRepository.findByVisibility("public");
    return prompts.stream().map(this::mapToPromptWithTagsDTO).collect(Collectors.toList());
  }

  private PromptWithTagsDTO mapToPromptWithTagsDTO(Prompt prompt) {
    List<Tag> tags = tagService.getTagsByIds(prompt.getTagIds());
    return PromptWithTagsDTO.builder()
        .id(prompt.getId())
        .title(prompt.getTitle())
        .description(prompt.getDescription())
        .price(prompt.getPrice())
        .tags(tags)
        .build();
  }
}
