package com.fiveOps.promptforge.prompts.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    prompt.setVisibility("private");
    if (prompt.getPrice() == null) {
      prompt.setPrice(0.0);
    }

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
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
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
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              prompt.setVisibility("public");
              prompt.setPublishedAt(java.time.LocalDateTime.now());
              return promptRepository.save(prompt);
            })
        .orElse(null);
  }

  @Transactional
  public Prompt unpublishPrompt(UUID id) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              prompt.setVisibility("private");
              return promptRepository.save(prompt);
            })
        .orElse(null);
  }

  @Transactional
  public boolean deletePrompt(UUID id) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              promptRepository.delete(prompt);
              return true;
            })
        .orElse(false);
  }

  public List<Prompt> searchByTitle(String searchTerm) {
    return promptRepository.findByTitleContainingIgnoreCase(searchTerm);
  }

  public List<Prompt> searchPublicByTitle(String searchTerm) {
    return promptRepository.searchPublicByTitle(searchTerm);
  }


    public Page<Map<String, PromptWithAuthorDTO>> getPurchasedPrompts(UUID userId,Pageable pageable) {
        System.out.println("getPurchasedPromptsByUserId");
        System.out.println(promptRepository.getPurchasedPromptsByUserId(userId, pageable));
        return promptRepository.getPurchasedPromptsByUserId(userId,pageable);
    }
}

