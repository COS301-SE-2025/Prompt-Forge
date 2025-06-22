package com.fiveOps.promptforge.promptstore.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @GetMapping // ← Handles GET /api/store/prompts
    public Page<Prompt> getAllPublicPrompts(
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
    
    @GetMapping ("/pages")// ← gets the number of pages needed for the prompts in the db
    public long getPageCount(@RequestParam String pageSize){
        return storeService.getPageCount(pageSize);
    }
    
    @GetMapping ("/count")// ← number of prompts
    public long getPromptCount(){
        return storeService.getPromptCount();
    }

    @GetMapping ("/featured")// ← number of prompts
    public Page<Map<String, PromptWithAuthorDTO>> getFeaturedPrompts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getFeaturedPrompts(pageable);
    }



    @PostMapping("/{promptId}/purchase")
    public ResponseEntity<PromptPurchase> purchasePrompt(
            @PathVariable UUID promptId,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(storeService.purchasePrompt(promptId, userId));
    }//////user id???

    @GetMapping("/{promptId}/reviews")
    public ResponseEntity<Page<PromptReview>> getPromptReviews(
            @PathVariable UUID promptId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(storeService.getPromptReviews(promptId, pageable));
    }

    // @PostMapping("/reviews")
    // public ResponseEntity<PromptReview> createReview(
    //         @RequestBody PromptReview review,
    //         @AuthenticationPrincipal UUID userId) {
    //     review.setUserId(userId);
    //     return ResponseEntity.ok(storeService.createReview(review));
    // }///user id????????????????????



    @GetMapping("/search")
    public Page<Prompt> searchPublic(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.searchPublic(query, pageable);
    }

    @GetMapping("/filter/price")
    public Page<Prompt> getUnderPrice(
            @RequestParam double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getPublicUnderPrice(maxPrice, pageable);
    }

    @GetMapping("/filter/tag/{tagName}")
    public Page<Prompt> getByTagName(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return storeService.getPublicByTagName(tagName, pageable);
    }


    // Get public prompts by author
    @GetMapping("/filter/author/{authorId}")
    public Page<Prompt> getPublicPromptsByAuthor(
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
    public ResponseEntity<Page<Prompt>> getRecentlyPublishedPrompts(
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
