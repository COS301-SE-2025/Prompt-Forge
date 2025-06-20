package com.fiveOps.promptforge.prompts.model;

import com.fiveOps.promptforge.prompts.service.TagService;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

// import java.beans.Transient;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "prompts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prompt {
    @Id
    @Column(name = "prompt_id", columnDefinition = "UUID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "featured")
    private Boolean featured;
public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10)
    private Double price= 0.0;

    @Column(name = "visibility", nullable = false, length = 20)
    private String visibility = "PRIVATE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "prompt_tags", columnDefinition = "uuid[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<UUID> tagIds;

    @Transient
    private List<String> tagNames;

    public void resolveAndSetTags(TagService tagService) {
        if (this.tagNames != null && !this.tagNames.isEmpty()) {
            List<Tag> tags = tagService.findOrCreateTags(this.tagNames);
            this.tagIds = tags.stream()
                .map(Tag::getId)
                .toList();
            
            // Update usage counts
            tags.forEach(tag -> tagService.incrementUsageCount(tag.getId()));
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
        return title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "") // Remove invalid chars
            .replaceAll("\\s+", "-")         // Replace spaces with hyphens
            .replaceAll("-+", "-")           // Replace multiple hyphens
            .replaceAll("^-|-$", "");        // Trim hyphens from ends
    }


    @PreUpdate // Add this annotation
    protected void onUpdate() {
        this.slug = generateSlug(this.title);
    }

    

    ///analytics functionality
    /// 
    // @OneToOne(
    //     mappedBy = "prompt",
    //     cascade = CascadeType.ALL,
    //     fetch = FetchType.LAZY,
    //     orphanRemoval = true
    // )
    // @JsonIgnore
    // private PromptMetadata metadata;

    // public void setMetadata(PromptMetadata metadata) {
    //     if (metadata == null) {
    //         if (this.metadata != null) {
    //             this.metadata.setPrompt(null);
    //         }
    //     } else {
    //         metadata.setPrompt(this);
    //     }
    //     this.metadata = metadata;
    // }
}
