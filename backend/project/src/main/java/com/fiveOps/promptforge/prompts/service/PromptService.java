
package com.fiveOps.promptforge.prompts.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.prompts.service.TagService;
import com.fiveOps.promptforge.prompts.repository.TagRepository;

@Service
public class PromptService {
    private final PromptRepository promptRepository;
    private final TagService tagService;

    public PromptService(PromptRepository promptRepository, TagService tagService) {
        this.promptRepository = promptRepository;
        this.tagService = tagService;
    }

    public List<Prompt> getAllPrompts() {
        return promptRepository.findAll();
    }

    public List<Prompt> getPromptsByAuthor(UUID authorId) {
        return promptRepository.findByAuthorId(authorId);
    }

    public Prompt getPromptById(UUID id) {
        return promptRepository.findById(id).orElse(null);
    }

    @Transactional
    public Prompt createPrompt(Prompt prompt) {
        prompt.setVisibility("PRIVATE");  // Ensure new prompts are private by default
        /////add analytics too later!!!!!
        prompt.resolveAndSetTags(tagService);
        return promptRepository.save(prompt);
    }

    public List<Prompt> getPromptsByTagName(String tagName) {
        // Delegate tag lookup to TagService
        UUID tagId = tagService.getTagIdByName(tagName);
        return promptRepository.findByTagId(tagId);
    }

    @Transactional
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
    public Prompt publishPrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    prompt.setVisibility("PUBLIC");
                    prompt.setPublishedAt(java.time.LocalDateTime.now());
                    return promptRepository.save(prompt);
                })
                .orElse(null);
    }

    @Transactional
    public Prompt unpublishPrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    prompt.setVisibility("PRIVATE");
                    return promptRepository.save(prompt);
                })
                .orElse(null);
    }

    @Transactional
    public boolean deletePrompt(UUID id) {
        return promptRepository.findById(id)
                .map(prompt -> {
                    promptRepository.delete(prompt);
                    return true;
                })
                .orElse(false);
                //////later add deleting analytics
    }
}