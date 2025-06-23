package com.fiveOps.promptforge.promptstore.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/store/prompts")
@RequiredArgsConstructor
public class PromptStoreController {
    private final PromptStoreService storeService;

    // @GetMapping // ← Handles GET /api/store/prompts
    // public List<Prompt> getAllPublicPrompts() {
    //     return storeService.getAllPublicPrompts();
    // }
    
    @GetMapping // ← returns a page (a list of prom)
    public Page<Map<String, PromptWithAuthorDTO>> getAllPublicPrompts(Pageable pageable){
        return storeService.getPublicPromptsWithAuthorAndTags(pageable);
    }

    @GetMapping ("/featured")// ← number of prompts
    public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(@PageableDefault(size = 10) Pageable pageable){
        return storeService.getFeaturedPrompts(pageable);
    }


    @PostMapping("/{promptId}/purchase")
    public ResponseEntity<PromptPurchase> purchasePrompt(
            @PathVariable UUID promptId,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(storeService.purchasePrompt(promptId, userId));
    }//////user id???

    @GetMapping("/{promptId}/reviews")
    public ResponseEntity<List<PromptReview>> getPromptReviews(
            @PathVariable UUID promptId) {
        return ResponseEntity.ok(storeService.getPromptReviews(promptId));
    }

    // @PostMapping("/reviews")
    // public ResponseEntity<PromptReview> createReview(
    //         @RequestBody PromptReview review,
    //         @AuthenticationPrincipal UUID userId) {
    //     review.setUserId(userId);
    //     return ResponseEntity.ok(storeService.createReview(review));
    // }///user id????????????????????



    // @GetMapping("/search")
    // public List<Prompt> searchPublic(@RequestParam String query) {
    //     return storeService.searchPublic(query);
    // }
    
    @GetMapping("/search")
    public Page<Map<String, PromptWithAuthorDTO>> searchPublic(@RequestParam String query,Pageable pageable) {
        return storeService.searchPublic(query,pageable);
    }

    @GetMapping("/filter/price")
    public List<Prompt> getUnderPrice(@RequestParam double maxPrice) {
        return storeService.getPublicUnderPrice(maxPrice);
    }

    @GetMapping("/filter/tag/{tagName}")
    public List<Prompt> getByTagName(@PathVariable String tagName) {
        return storeService.getPublicByTagName(tagName);
    }

    @GetMapping("/filter/tag/tag/{tagName}") //filter by tagname only
    public Page<Map<String, PromptWithAuthorDTO>> filterByTagName(
            @PathVariable String tagName,
            @PageableDefault(size = 10) Pageable pageable) {
        return storeService.getPublicByTagName(tagName.substring(0, 1).toUpperCase() +tagName.substring(1).toLowerCase(), pageable);
    }
    
    @GetMapping("/filter") // filter by tagname and filters(new, featured, etc.)
    public Page<Map<String, PromptWithAuthorDTO>> filterByTagNameAndFilter(
            @RequestParam String tagName,
            @RequestParam String filter,
            @PageableDefault(size = 10) Pageable pageable) {
        return storeService.getPublicByTagNameAndFilter(
                tagName.substring(0, 1).toUpperCase() + tagName.substring(1).toLowerCase(), filter, pageable);
    }

    @GetMapping("/new")
    public Page<Map<String, PromptWithAuthorDTO>> getNew(@PageableDefault(size = 10) Pageable pageable) {
        return storeService.getNew(pageable);
    }


    // Get public prompts by author
    @GetMapping("/filter/author/{authorId}")
    public List<Prompt> getPublicPromptsByAuthor(@PathVariable UUID authorId) {
        return storeService.getPublicPromptsByAuthor(authorId);
    }

    // Delete (unpublish) listing
    @DeleteMapping("/{promptId}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID promptId) {
        return storeService.deleteListing(promptId) ?
            ResponseEntity.noContent().build() :
            ResponseEntity.notFound().build();
    }

    @GetMapping("/filter/recent")
    public ResponseEntity<List<Prompt>> getRecentlyPublishedPrompts() {
    return ResponseEntity.ok(storeService.getRecentlyPublishedPrompts());
    }

    @GetMapping("/tags")
    public List<Tag> getAllTags() {
        return storeService.getAllTags();
    }

    @GetMapping("/tags/popular")
    public List<Tag> getPopularTags(@RequestParam(defaultValue = "10") int limit) {
        return storeService.getPopularTags(limit);
    }


    ////to implement view? need analytics
    /// top rated
    /// top selling

    

    
}
