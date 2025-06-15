package com.fiveOps.promptforge.prompts.controller;

import java.util.List;
import java.util.UUID;

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
import com.fiveOps.promptforge.prompts.service.PromptService;

@RestController
@RequestMapping("/prompts")
public class PromptController {

    private final PromptService promptService;

    public PromptController(PromptService promptService) {
        this.promptService = promptService;
    }

    @GetMapping
    public ResponseEntity<List<Prompt>> getAllPublicPrompts() {
        List<Prompt> prompts = promptService.getAllPublicPrompts();
        return ResponseEntity.ok(prompts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPromptById(@PathVariable UUID id) {
        Prompt prompt = promptService.getPromptById(id);
        return prompt != null ? ResponseEntity.ok(prompt) : ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Prompt>> getPromptsByCategory(@PathVariable String category) {
        List<Prompt> prompts = promptService.getPromptsByCategory(category);
        return ResponseEntity.ok(prompts);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Prompt>> getPromptsByAuthor(@PathVariable UUID authorId) {
        List<Prompt> prompts = promptService.getPromptsByAuthor(authorId);
        return ResponseEntity.ok(prompts);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Prompt>> searchPrompts(@RequestParam String query) {
        List<Prompt> prompts = promptService.searchPrompts(query);
        return ResponseEntity.ok(prompts);
    }

    @PostMapping
    public ResponseEntity<Prompt> createPrompt(@RequestBody Prompt prompt) {
        // Removed metadata initialization
        //add this after analytics implementation!!!!!
        Prompt createdPrompt = promptService.createPrompt(prompt);
        return ResponseEntity.ok(createdPrompt);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prompt> updatePrompt(@PathVariable UUID id, @RequestBody Prompt promptDetails) {
        Prompt updatedPrompt = promptService.updatePrompt(id, promptDetails);
        return updatedPrompt != null ? ResponseEntity.ok(updatedPrompt) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrompt(@PathVariable UUID id) {
        boolean deleted = promptService.deletePrompt(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/price")
    public ResponseEntity<List<Prompt>> getPromptsUnderPrice(@RequestParam double maxPrice) {
        List<Prompt> prompts = promptService.getPromptsUnderPrice(maxPrice);
        return ResponseEntity.ok(prompts);
    }

    // Removed metadata/analytics endpoints endpoints
    /*
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
    */
}