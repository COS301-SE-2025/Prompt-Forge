
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
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.service.PromptService;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {
    private final PromptService promptService;

    public PromptController(PromptService promptService) {
        this.promptService = promptService;
    }

    @GetMapping
    public ResponseEntity<List<Prompt>> getAllPrompts() {
        return ResponseEntity.ok(promptService.getAllPrompts());
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Prompt>> getPromptsByAuthor(@PathVariable UUID authorId) {
        return ResponseEntity.ok(promptService.getPromptsByAuthor(authorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPromptById(@PathVariable UUID id) {
        Prompt prompt = promptService.getPromptById(id);
        return prompt != null ? ResponseEntity.ok(prompt) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Prompt> createPrompt(@RequestBody Prompt prompt) {
        if (prompt.getPrice() == null) {
        prompt.setPrice(0.0);
    }
        Prompt created = promptService.createPrompt(prompt);
        return ResponseEntity.ok(created);
        /////analytics!!!!!
        
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prompt> updatePrompt(@PathVariable UUID id, @RequestBody Prompt promptDetails) {
        Prompt updatedPrompt = promptService.updatePrompt(id, promptDetails);
        return updatedPrompt != null ? ResponseEntity.ok(updatedPrompt) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Prompt> publishPrompt(@PathVariable UUID id) {
        Prompt publishedPrompt = promptService.publishPrompt(id);
        return publishedPrompt != null ? ResponseEntity.ok(publishedPrompt) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<Prompt> unpublishPrompt(@PathVariable UUID id) {
        Prompt unpublishedPrompt = promptService.unpublishPrompt(id);
        return unpublishedPrompt != null ? ResponseEntity.ok(unpublishedPrompt) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrompt(@PathVariable UUID id) {
        boolean deleted = promptService.deletePrompt(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/by-tag/{tagName}")
    public ResponseEntity<List<Prompt>> getByTagName(@PathVariable String tagName) {
        return ResponseEntity.ok(promptService.getPromptsByTagName(tagName));
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