package com.fiveOps.promptforge.prompts.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fiveOps.promptforge.prompts.service.TagService;
import com.fiveOps.promptforge.prompts.service.UniversalTaggingService;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "prompts",
    indexes = {
      @Index(name = "idx_prompt_author", columnList = "author_id"),
      @Index(name = "idx_prompt_visibility", columnList = "visibility"),
      @Index(name = "idx_prompt_featured", columnList = "featured"),
      @Index(name = "idx_prompt_published", columnList = "published_at"),
      @Index(name = "idx_prompt_created", columnList = "created_at"),
      @Index(name = "idx_prompt_title", columnList = "title"),
      @Index(name = "idx_prompt_price", columnList = "price")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prompt {
  private static final Logger LOGGER = LoggerFactory.getLogger(Prompt.class);

  @Id
  @Column(name = "prompt_id", columnDefinition = "UUID")
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(name = "author_id", nullable = false)
  private UUID authorId;

  @Column(name = "featured")
  private Boolean featured;

  @Column(nullable = false, length = 100)
  private String title;

  @Column(nullable = false, length = 255)
  private String slug;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, precision = 10)
  private Double price = 0.0;

  @Column(name = "visibility", nullable = false, length = 20)
  private String visibility = "private";

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "published_at")
  private LocalDateTime publishedAt;

  @Column(name = "prompt_tags", columnDefinition = "uuid[]")
  @JdbcTypeCode(SqlTypes.ARRAY)
  private List<UUID> tagIds;

  @Transient private List<String> tagNames;

  public void resolveAndSetTags(TagService tagService, UniversalTaggingService taggingService) {
    try {
      Map<String, Object> aiTags = taggingService.predictTags(this.content);
      Object categoriesObj = aiTags.get("categories");

      if (categoriesObj instanceof List) {
        @SuppressWarnings("unchecked")
        List<String> aiTagNames = (List<String>) categoriesObj;

        if (!aiTagNames.isEmpty()) {
          List<Tag> tags =
              aiTagNames.stream().map(tagService::findOrCreateTag).collect(Collectors.toList());

          this.tagIds = tags.stream().map(Tag::getId).collect(Collectors.toList());

          tags.forEach(tag -> tagService.incrementUsageCount(tag.getId()));
        }
      }
    } catch (Exception e) {
      // Log error but don't fail the entire operation
      LOGGER.error("Failed to generate AI tags: " + e.getMessage());
    }
  }

  @PrePersist
  protected void onCreate() {
    if (this.slug == null || this.slug.isEmpty()) {
      this.slug = generateSlug(this.title);
    }
  }

  private String generateSlug(String title) {
    if (title == null) return "";
    return title
        .toLowerCase()
        .replaceAll("[^a-z0-9\\s-]", "") // Remove invalid chars
        .replaceAll("\\s+", "-") // Replace spaces with hyphens
        .replaceAll("-+", "-") // Replace multiple hyphens
        .replaceAll("^-|-$", ""); // Trim hyphens from ends
  }

  @PreUpdate // Add this annotation
  protected void onUpdate() {
    this.slug = generateSlug(this.title);
  }
}
