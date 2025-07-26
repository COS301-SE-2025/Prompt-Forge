package com.fiveOps.promptforge.prompts.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.repository.TagRepository;

@Service
@Transactional
public class TagService {
  private final TagRepository tagRepository;

  public TagService(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

public Tag findOrCreateTag(String name) {
    String normalizedName = normalizeTagName(name);
    return tagRepository
        .findByName(normalizedName)
        .orElseGet(() -> {
            // Generate unique slug if needed
            String slug = generateSlug(normalizedName);
            int counter = 1;
            
            // Check if slug exists and make it unique
            while (tagRepository.existsBySlug(slug)) {
                slug = generateSlug(normalizedName) + "-" + counter++;
            }
            
            Tag newTag = Tag.builder()
                .name(normalizedName)
                .slug(slug)
                .isAutoSuggest(true)  // Mark as AI-generated
                .build();
                
            return tagRepository.save(newTag);
        });
}

  public List<Tag> findOrCreateTags(List<String> tagNames) {
    return tagNames.stream().map(this::findOrCreateTag).collect(Collectors.toList());
  }

  @Transactional
  public void incrementUsageCount(UUID tagId) {
    tagRepository.incrementUsageCount(tagId);
  }

  public String normalizeTagName(String name) {
    if (name == null || name.trim().isEmpty()) {
        return name;
    }
    
    String trimmed = name.trim();
    // Capitalize first letter and lowercase the rest
    return trimmed.substring(0, 1).toUpperCase() + 
           trimmed.substring(1).toLowerCase();
  }

  public String generateSlug(String name) {
    return name.toLowerCase().replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-");
  }

  public UUID getTagIdByName(String tagName) {
    return tagRepository
        .findByName(tagName)
        .orElseThrow(() -> new RuntimeException("Tag not found: " + tagName))
        .getId();
  }

  // Add to TagService.java
  public List<Tag> getAllTags() {
    return tagRepository.findAll();
  }

  public List<Tag> getPopularTags(int limit) {
    return tagRepository.findPopularTags(limit);
  }

  public List<Tag> getTagsByIds(List<UUID> tagIds) {
    return tagRepository.findAllById(tagIds);
  }
}
