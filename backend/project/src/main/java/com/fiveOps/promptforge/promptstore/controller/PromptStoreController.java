package com.fiveOps.promptforge.promptstore.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/store/prompts")
@RequiredArgsConstructor
public class PromptStoreController {

  private final PromptStoreService storeService;
  private final UserService userService;

  @GetMapping
  public Page<Map<String, PromptWithAuthorDTO>> getAllPublicPrompts(Pageable pageable) {
    return storeService.getPublicPromptsWithAuthorAndTags(pageable);
  }

  @GetMapping("/featured")
  public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(
      @PageableDefault(size = 10) Pageable pageable) {
    return storeService.getFeaturedPrompts(pageable);
  }

  @GetMapping("/{promptId}/reviews")
  public ResponseEntity<Page<ReviewProjection>> getReviewsForPrompt(
      @PathVariable UUID promptId, @PageableDefault(size = 10) Pageable pageable) {

    Page<ReviewProjection> reviews = storeService.getReviewsForPrompt(promptId, pageable);
    return ResponseEntity.ok(reviews);
  }

  @PostMapping("/{promptId}/reviews")
  public ResponseEntity<PromptReview> createReview(
      @PathVariable UUID promptId,
      @RequestBody PromptReview review,
      Authentication authentication) {

    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);

    review.setUserId(userId);
    review.setPromptId(promptId);

    PromptReview createdReview = storeService.createReview(review);
    return ResponseEntity.ok(createdReview);
  }

  @PutMapping("/{promptId}/reviews/{reviewId}")
  public ResponseEntity<PromptReview> updateReviewPartial(
      @PathVariable UUID promptId,
      @PathVariable UUID reviewId,
      @Valid @RequestBody PromptReview request,
      Authentication authentication) {

    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);

    PromptReview updatedReview =
        storeService.updateReviewPartial(
            reviewId, userId, promptId, request.getRating(), request.getComment());

    return ResponseEntity.ok(updatedReview);
  }

  @DeleteMapping("/{promptId}/reviews/{reviewId}")
  public ResponseEntity<Void> deleteReview(
      @PathVariable UUID promptId, @PathVariable UUID reviewId, Authentication authentication) {

    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);

    storeService.deleteReview(reviewId, userId, promptId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/search")
  public Page<Map<String, PromptWithAuthorDTO>> searchPublic(
      @RequestParam String query, Pageable pageable) {
    return storeService.searchPublic(query, pageable);
  }

  @GetMapping("/filter/price")
  public List<Prompt> getUnderPrice(@RequestParam double maxPrice) {
    return storeService.getPublicUnderPrice(maxPrice);
  }

  @GetMapping("/filter/tag/{tagName}")
  public Page<Map<String, PromptWithAuthorDTO>> filterByTagName(
      @PathVariable String tagName, @PageableDefault(size = 10) Pageable pageable) {

    return storeService.getPublicByTagName(tagName, pageable);
  }

  @GetMapping("/filter")
  public Page<Map<String, PromptWithAuthorDTO>> filterByTagNameAndFilter(
      @RequestParam String tagName,
      @RequestParam String filter,
      @PageableDefault(size = 10) Pageable pageable) {
    String formattedTagName =
        tagName.substring(0, 1).toUpperCase() + tagName.substring(1).toLowerCase();
    return storeService.getPublicByTagNameAndFilter(formattedTagName, filter, pageable);
  }

  @GetMapping("/filter/recent")
  public Page<Map<String, PromptWithAuthorDTO>> getNew(
      @PageableDefault(size = 10) Pageable pageable) {
    return storeService.getNew(pageable);
  }

  @GetMapping("/filter/author/{authorId}")
  public List<Prompt> getPublicPromptsByAuthor(@PathVariable UUID authorId) {
    return storeService.getPublicPromptsByAuthor(authorId);
  }

  @DeleteMapping("/{promptId}")
  public ResponseEntity<Void> deleteListing(
      @PathVariable UUID promptId, Authentication authentication) {

    boolean deleted = storeService.deleteListing(promptId);
    return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
  }

  @GetMapping("/ownership/{promptId}")
  public ResponseEntity<Boolean> isPromptBought(
      @PathVariable UUID promptId, Authentication authentication) {
    String userEmail = authentication.getName();
    UUID userId = userService.getUserIdByEmail(userEmail);
    return ResponseEntity.ok(storeService.isPromptBought(userId, promptId));
  }

  @GetMapping("/tags")
  public List<Tag> getAllTags() {
    return storeService.getAllTags();
  }

  @GetMapping("/tags/popular")
  public List<Tag> getPopularTags(@RequestParam(defaultValue = "10") int limit) {
    return storeService.getPopularTags(limit);
  }
}
