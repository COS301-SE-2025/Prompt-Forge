
package com.fiveOps.promptforge.prompts.service;

import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@Service
public class PromptService {
    private final PromptRepository promptRepository;
    private final TagService tagService;

    

    public PromptService(PromptRepository promptRepository, TagService tagService) {
        this.promptRepository = promptRepository;
        this.tagService = tagService;
    }

    public Page<PromptWithAuthorDTO> getAllPrompts(Pageable pageable) {
    return promptRepository.findAllWithAuthor(pageable);
    }

    public Page<PromptWithAuthorDTO> getPromptsByAuthor(UUID authorId, Pageable pageable) {
    return promptRepository.findByAuthorId(authorId, pageable);
    }

    @Cacheable(value = "prompts", key = "#id")
    public Prompt getPromptById(UUID id) {
        return promptRepository.findById(id).orElse(null);
    }

    @Transactional
    public Prompt createPrompt(Prompt prompt) {
        prompt.setVisibility("private");
        if (prompt.getPrice() == null) {
            prompt.setPrice(0.0);
        }
        /////add analytics too later!!!!!
        prompt.resolveAndSetTags(tagService);
        return promptRepository.save(prompt);
    }

    public Page<PromptWithAuthorDTO> getPromptsByTagName(String tagName, Pageable pageable) {
    UUID tagId = tagService.getTagIdByName(tagName);
    return promptRepository.findByTagId(tagId, pageable);
    }

    @Transactional
    @CacheEvict(value = "prompts", key = "#prompt.id")
    public Prompt updatePrompt(UUID id, Prompt promptDetails) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    prompt.setTitle(promptDetails.getTitle());
                    prompt.setSlug(promptDetails.getSlug());
                    prompt.setContent(promptDetails.getContent());
                    prompt.setDescription(promptDetails.getDescription());
                    prompt.setPrice(promptDetails.getPrice());
                    prompt.setTagIds(promptDetails.getTagIds());
                    // visibility can only be updated through publish/unpublish
                    return promptRepository.save(prompt);
                })
                .orElse(null);
    }

    @Transactional
    @CacheEvict(value = "prompts", key = "#prompt.id")
    public Prompt publishPrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    prompt.setVisibility("public");
                    prompt.setPublishedAt(java.time.LocalDateTime.now());
                    return promptRepository.save(prompt);
                })
                .orElse(null);
    }

    @Transactional
    @CacheEvict(value = "prompts", key = "#prompt.id")
    public Prompt unpublishPrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    prompt.setVisibility("private");
                    return promptRepository.save(prompt);
                })
                .orElse(null);
    }

    @Transactional
    @CacheEvict(value = "prompts", key = "#prompt.id")
    public boolean deletePrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    promptRepository.delete(prompt);
                    return true;
                })
                .orElse(false);
                //////later add deleting analytics
    }

    @Cacheable(value = "prompts", condition = "#result != null")
     public Page<PromptWithAuthorDTO> searchByTitle(String searchTerm, Pageable pageable) {
    return promptRepository.findByTitleContainingIgnoreCase(searchTerm, pageable);
    }


    @Cacheable(value = "prompts", condition = "#result != null")
    public Page<PromptWithAuthorDTO> searchPublicByTitle(String searchTerm, Pageable pageable) {
    return promptRepository.searchPublicByTitle(searchTerm, pageable);
    }
}