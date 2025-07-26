package com.fiveOps.promptforge.prompts.controller;

import com.fiveOps.promptforge.prompts.service.PromptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-tags")
@RequiredArgsConstructor
public class AITaggingController {
    
    private final PromptService promptService;
    
    @GetMapping("/for-prompt/{promptId}")
    public ResponseEntity<?> getTagsForPrompt(@PathVariable UUID promptId) {
        try {
            return ResponseEntity.ok(promptService.generateTagsForPrompt(promptId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "Tag generation failed",
                    "details", e.getMessage()
                ));
        }
    }
}