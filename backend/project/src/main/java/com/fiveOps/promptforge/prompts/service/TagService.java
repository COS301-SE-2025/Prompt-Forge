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
        return tagRepository.findByName(normalizedName)
            .orElseGet(() -> {
                Tag newTag = Tag.builder()
                    .name(normalizedName)
                    .slug(generateSlug(normalizedName))
                    .build();
                return tagRepository.save(newTag);
            });
    }

    public List<Tag> findOrCreateTags(List<String> tagNames) {
        return tagNames.stream()
            .map(this::findOrCreateTag)
            .collect(Collectors.toList());
    }

    @Transactional
    public void incrementUsageCount(UUID tagId) {
        tagRepository.incrementUsageCount(tagId);
    }

    private String normalizeTagName(String name) {
        return name.trim();
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9-]", "-")
            .replaceAll("-+", "-");
    }

    public List<Tag> getPopularTags(int limit) {
        return tagRepository.findPopularTags(limit);
    }

    public UUID getTagIdByName(String tagName) {
    return tagRepository.findByName(tagName)
        .orElseThrow(() -> new RuntimeException("Tag not found: " + tagName))
        .getId();
    }
}