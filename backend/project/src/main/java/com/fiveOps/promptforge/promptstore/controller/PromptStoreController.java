package com.fiveOps.promptforge.promptstore.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageRequest;

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
import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/store/prompts")
@RequiredArgsConstructor
public class PromptStoreController {
    private final PromptStoreService storeService;


    @GetMapping // ← Handles GET /api/store/prompts
    public Page<PromptWithAuthorDTO> getAllPublicPrompts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getAllPublicPrompts(pageable);
    }
    
    @GetMapping ("/page")// ← returns a page (a list of prom)
    public Page<Map<String, PromptWithAuthorDTO>> getPage(
            @RequestParam String page, 
            @RequestParam String pageSize) {
        Pageable pageable = PageRequest.of(Integer.parseInt(page), Integer.parseInt(pageSize));
        return storeService.getPage(page, pageSize, pageable);
    }

    
    @GetMapping // ← returns a page (a list of prom)
    public Page<Map<String, PromptWithAuthorDTO>> getAllPublicPrompts(Pageable pageable){
        return storeService.getPublicPromptsWithAuthorAndTags(pageable);
    }

    @GetMapping ("/featured")// ← number of prompts

    public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);

    }



    @PostMapping("/{promptId}/purchase")
    public ResponseEntity<PromptPurchase> purchasePrompt(
            @PathVariable UUID promptId,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(storeService.purchasePrompt(promptId, userId));
    }//////user id???

    @GetMapping("/{promptId}/reviews")
    public ResponseEntity<Page<ReviewProjection>> getReviewsForPrompt(
    @PathVariable UUID promptId,
    @PageableDefault(size = 10) Pageable pageable) {
    
    Page<ReviewProjection> reviews = storeService.getReviewsForPrompt(promptId, pageable);
    return ResponseEntity.ok(reviews);
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

    public Page<PromptWithAuthorDTO> searchPublic(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.searchPublic(query, pageable);

    }

    @GetMapping("/filter/price")
    public Page<PromptWithAuthorDTO> getUnderPrice(
            @RequestParam double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getPublicUnderPrice(maxPrice, pageable);
    }

    @GetMapping("/filter/tag/{tagName}")
    public Page<PromptWithAuthorDTO> getByTagName(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getPublicByTagName(tagName, pageable);
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
    public Page<PromptWithAuthorDTO> getPublicPromptsByAuthor(
            @PathVariable UUID authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getPublicPromptsByAuthor(authorId, pageable);
    }
    // Delete (unpublish) listing
    @DeleteMapping("/{promptId}")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID promptId) {
        return storeService.deleteListing(promptId) ?
            ResponseEntity.noContent().build() :
            ResponseEntity.notFound().build();
    }

    @GetMapping("/filter/recent")
    public ResponseEntity<Page<PromptWithAuthorDTO>> getRecentlyPublishedPrompts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(storeService.getRecentlyPublishedPrompts(pageable));
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

    
// @GetMapping("/{id}")
//     public ResponseEntity<Prompt> getPromptById(@PathVariable UUID id) {
//         Prompt prompt = promptService.getPromptById(id);
//         return prompt != null ? ResponseEntity.ok(prompt) : ResponseEntity.notFound().build();
//     }
    
}
