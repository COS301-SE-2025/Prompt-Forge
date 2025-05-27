package com.example.promptforge.promptstore.controller;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.promptforge.promptstore.model.PromptMetadata;
import com.example.promptforge.promptstore.repository.PromptMetadataRepository;

@RestController
@RequestMapping("/api/prompts/metadata")
public class PromptMetadataController {

    private final PromptMetadataRepository metadataRepository;

    @Autowired
    public PromptMetadataController(PromptMetadataRepository metadataRepository) {
        this.metadataRepository = metadataRepository;
    }

    // @GetMapping("/{promptId}")
    // public ResponseEntity<PromptMetadata> getMetadataByPromptId(@PathVariable UUID promptId) {
    //     return metadataRepository.findByPromptId(promptId)
    //             .map(ResponseEntity::ok)
    //             .orElse(ResponseEntity.notFound().build());
    // }
    @GetMapping("/{promptId}")
    public ResponseEntity<PromptMetadata> getMetadataByPromptId(@PathVariable UUID promptId) {
        PromptMetadata metadata = metadataRepository.findByPromptId(promptId);
        if (metadata != null) {
            return ResponseEntity.ok(metadata);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{promptId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable UUID promptId) {
        metadataRepository.incrementViewCount(promptId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{promptId}/fork")
    public ResponseEntity<Void> incrementForkCount(@PathVariable UUID promptId) {
        metadataRepository.incrementForkCount(promptId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{promptId}/download")
    public ResponseEntity<Void> incrementDownloadCount(@PathVariable UUID promptId) {
        metadataRepository.incrementDownloadCount(promptId);
        return ResponseEntity.ok().build();
    }

@GetMapping("/{promptId}/stats")
public ResponseEntity<PromptMetadata> getPromptStats(@PathVariable UUID promptId) {
    PromptMetadata metadata = metadataRepository.findByPromptId(promptId);
    if (metadata == null) {
        return ResponseEntity.notFound().build();
    }
    
    // Recalculate average rating in case it changed
    Double avgRating = metadataRepository.calculateAverageRating(promptId);
    metadata.setAverageRating(avgRating);
    return ResponseEntity.ok(metadata);
}
}
