package com.fiveOps.promptforge.prompts.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    // Find tag by exact name match
    Optional<Tag> findByName(String name);

    // Find tags containing search term (case-insensitive)
    List<Tag> findByNameContainingIgnoreCase(String searchTerm);

    // Bulk find tags by their IDs
    List<Tag> findAllByIdIn(List<UUID> ids);

    // Increment usage count for a tag
    @Modifying
    @Query("UPDATE Tag t SET t.usageCount = t.usageCount + 1 WHERE t.id = :tagId")
    void incrementUsageCount(UUID tagId);

    // Find popular tags (most used)
    @Query("SELECT t FROM Tag t ORDER BY t.usageCount DESC LIMIT :limit")
    List<Tag> findPopularTags(int limit);

    // Find tags by category
    List<Tag> findByCategory(String category);

    // Check if tag exists by name
    boolean existsByName(String name);

    
}