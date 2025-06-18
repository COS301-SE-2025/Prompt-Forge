package com.fiveOps.promptforge.prompts.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
import com.fiveOps.promptforge.prompts.model.PromptMetadata;
import com.fiveOps.promptforge.prompts.repository.PromptMetadataRepository;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@RestController
@RequestMapping("/prompts")
public class PromptController {

    private final PromptRepository promptRepository;

    @Autowired
    public PromptController(PromptRepository promptRepository) {
        this.promptRepository = promptRepository;
    }

    // Get all public prompts
    @GetMapping
    public ResponseEntity<List<Prompt>> getAllPublicPrompts() {
        List<Prompt> prompts = promptRepository.findByIsPublicTrue();
        return ResponseEntity.ok(prompts);
    }

    // Get prompt by ID
    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPromptById(@PathVariable UUID id) {
        return promptRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get prompts by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Prompt>> getPromptsByCategory(@PathVariable String category) {
        List<Prompt> prompts = promptRepository.findByCategoryAndIsPublicTrue(category);
        return ResponseEntity.ok(prompts);
    }

    // Get prompts by author
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Prompt>> getPromptsByAuthor(@PathVariable UUID authorId) {
        List<Prompt> prompts = promptRepository.findByAuthorId(authorId);
        return ResponseEntity.ok(prompts);
    }

    // Search prompts by title
    @GetMapping("/search")
    public ResponseEntity<List<Prompt>> searchPrompts(@RequestParam String query) {
        List<Prompt> prompts = promptRepository.findByTitleContainingIgnoreCase(query);
        return ResponseEntity.ok(prompts);
    }

    // Create new prompt
    @PostMapping
    public ResponseEntity<Prompt> createPrompt(@RequestBody Prompt prompt) {
        PromptMetadata metadata = PromptMetadata.builder()
            .viewCount(0)
            .forkCount(0)
            .downloadCount(0)
            .averageRating(null)
            .build();
        prompt.setMetadata(metadata);

        Prompt savedPrompt = promptRepository.save(prompt);
        return ResponseEntity.ok(savedPrompt);
    }

    // Update existing prompt
    @PutMapping("/{id}")
    public ResponseEntity<Prompt> updatePrompt(@PathVariable UUID id, @RequestBody Prompt promptDetails) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    // Only update allowed fields
                    prompt.setTitle(promptDetails.getTitle());
                    prompt.setDescription(promptDetails.getDescription());
                    prompt.setContent(promptDetails.getContent());
                    prompt.setPrice(promptDetails.getPrice());
                    prompt.setCategory(promptDetails.getCategory());
                    prompt.setIsPublic(promptDetails.getIsPublic());
                    // authorId remains unchanged from existing prompt
                    
                    Prompt updatedPrompt = promptRepository.save(prompt);
                    return ResponseEntity.ok(updatedPrompt);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete prompt
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrompt(@PathVariable UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    promptRepository.delete(prompt);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // // Get top-rated prompts
    // @GetMapping("/top-rated")
    // public ResponseEntity<List<Prompt>> getTopRatedPrompts() {
    //     List<Prompt> prompts = promptRepository.findTopRatedPrompts();
    //     return ResponseEntity.ok(prompts);
    // }

    // Get public prompts under a certain price
    @GetMapping("/price")
    public ResponseEntity<List<Prompt>> getPromptsUnderPrice(@RequestParam double maxPrice) {
        List<Prompt> prompts = promptRepository.findPublicPromptsUnderPrice(maxPrice);
        return ResponseEntity.ok(prompts);
    }

    @Autowired
    private PromptMetadataRepository metadataRepository;

    @GetMapping("/{id}/metadata")
    public ResponseEntity<PromptMetadata> getPromptMetadata(@PathVariable UUID id) {
        PromptMetadata metadata = metadataRepository.findByPromptId(id);
        if (metadata != null) {
            return ResponseEntity.ok(metadata);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> trackPromptView(@PathVariable UUID id) {
        metadataRepository.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }
}