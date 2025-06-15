
package com.fiveOps.promptforge.promptstore.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;

@RestController
@RequestMapping("/api/store/prompts")
public class PromptStoreController {
    private final PromptStoreService promptStoreService;

    public PromptStoreController(PromptStoreService promptStoreService) {
        this.promptStoreService = promptStoreService;
    }

    @GetMapping
    public ResponseEntity<List<Prompt>> getAllPublicPrompts() {
        return ResponseEntity.ok(promptStoreService.getAllPublicPrompts());
    }

    @GetMapping("/under-price")
    public ResponseEntity<List<Prompt>> getPublicPromptsUnderPrice(@RequestParam double maxPrice) {
        return ResponseEntity.ok(promptStoreService.getPublicPromptsUnderPrice(maxPrice));
    }

    @GetMapping("/by-tag/{tagId}")
    public ResponseEntity<List<Prompt>> getPublicPromptsByTag(@PathVariable UUID tagId) {
        return ResponseEntity.ok(promptStoreService.getPublicPromptsByTag(tagId));
    }
}