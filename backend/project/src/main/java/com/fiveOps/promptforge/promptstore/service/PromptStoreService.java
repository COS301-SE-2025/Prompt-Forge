// src/main/java/com/fiveOps/promptforge/promptstore/service/PromptStoreService.java
package com.fiveOps.promptforge.promptstore.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.promptstore.repository.PromptStoreRepository;

@Service
public class PromptStoreService {
    private final PromptStoreRepository promptStoreRepository;

    public PromptStoreService(PromptStoreRepository promptStoreRepository) {
        this.promptStoreRepository = promptStoreRepository;
    }

    public List<Prompt> getAllPublicPrompts() {
        return promptStoreRepository.findByVisibility("PUBLIC");
    }

    public List<Prompt> getPublicPromptsUnderPrice(double maxPrice) {
        return promptStoreRepository.findByVisibilityAndPriceLessThanEqual("PUBLIC", maxPrice);
    }

    public List<Prompt> getPublicPromptsByTag(UUID tagId) {
        return promptStoreRepository.findPublicPromptsByTag(tagId);
    }
}